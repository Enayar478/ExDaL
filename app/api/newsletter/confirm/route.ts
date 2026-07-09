import { type NextRequest, NextResponse } from "next/server";
import { verifyConfirmToken } from "@/lib/newsletter/token";
import { confirmSubscriber } from "@/lib/newsletter/repository";
import { logger } from "@/lib/logger";
import { site } from "@/lib/site";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Ensemble statique des valeurs autorisées pour le paramètre `newsletter` de la
 * redirection. Cela évite d'interpoler result.reason (chaîne externe, même si elle
 * est issue de notre enum) directement dans l'URL sans validation explicite.
 */
const ALLOWED_NEWSLETTER_PARAMS = new Set([
  "invalid",
  "malformed",
  "expired",
  "invalid_signature",
  "error",
  "confirmed",
] as const);

type NewsletterParam =
  | "invalid"
  | "malformed"
  | "expired"
  | "invalid_signature"
  | "error"
  | "confirmed";

function redirectTo(param: NewsletterParam): NextResponse {
  return NextResponse.redirect(new URL(`/?newsletter=${param}`, site.url), {
    status: 302,
  });
}

/**
 * GET /api/newsletter/confirm?token=…
 * Validation du double opt-in : vérifie le token HMAC, confirme l'abonné,
 * redirige vers la landing avec le paramètre `newsletter=<état>`.
 *
 * Le paramètre de redirection est issu d'une liste autorisée explicite —
 * jamais interpolé depuis l'entrée utilisateur ou une chaîne non validée.
 */
export async function GET(request: NextRequest) {
  // Garde-fou volumétrique, cohérent avec les autres routes publiques.
  const ip = clientIp(request.headers);
  if (!(await rateLimit(`newsletter-confirm:${ip}`, 10, 60_000)).allowed) {
    return new NextResponse("Trop de requêtes.", { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return redirectTo("invalid");
  }

  const result = verifyConfirmToken(token);

  if (!result.valid) {
    logger.warn("Token de confirmation newsletter invalide", {
      reason: result.reason,
    });

    // Valider que la raison fait partie de l'ensemble autorisé avant de la
    // placer dans l'URL de redirection.
    const safeReason = ALLOWED_NEWSLETTER_PARAMS.has(result.reason)
      ? (result.reason as NewsletterParam)
      : "invalid";

    return redirectTo(safeReason);
  }

  try {
    await confirmSubscriber(result.email);
  } catch (error) {
    logger.error("Confirmation newsletter échouée en base", {
      message: error instanceof Error ? error.message : String(error),
    });
    return redirectTo("error");
  }

  return redirectTo("confirmed");
}
