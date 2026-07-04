import { type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { ok, fail } from "@/lib/api";
import { newsletterInput } from "@/lib/validation/newsletter";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { upsertSubscriber } from "@/lib/newsletter/repository";
import { generateConfirmToken } from "@/lib/newsletter/token";
import { sendEmail } from "@/lib/email/send";
import { newsletterConfirmation } from "@/lib/email/templates";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/email/html";
import { site } from "@/lib/site";

// Taille maximale du corps (email + source + honeypot — quelques centaines d'octets).
const MAX_BODY_BYTES = 2048; // 2 Ko

/**
 * POST /api/newsletter
 * Inscription newsletter avec double opt-in RGPD.
 * Flow : taille → Zod → honeypot → rate-limit → upsert (non confirmé) → email de confirmation.
 *
 * Note honeypot : Zod (website: max(0)) rejette les valeurs non vides avec un 422
 * avant d'atteindre le check applicatif. Le check ici est une défense en profondeur
 * ET sert à répondre 200 (neutre) aux bots plutôt que 422 (qui révèle la détection).
 */
export async function POST(request: NextRequest) {
  // 0. Limite de taille du corps
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return fail("Corps de la requête trop volumineux.", 413);
  }

  // 1. Parse + validation Zod
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return fail("Corps de la requête trop volumineux.", 413);
    }
    body = JSON.parse(raw);
  } catch {
    return fail("Corps de la requête invalide.", 400);
  }

  const parsed = newsletterInput.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(" ");
    return fail(message, 422);
  }

  const { email, website, source } = parsed.data;

  // 2. Honeypot anti-bot — doit rester vide.
  // Zod rejette déjà les valeurs non vides (422), mais on répond ici 200
  // pour ne pas révéler le mécanisme aux bots (réponse neutre).
  if (website && website.length > 0) {
    return ok({ queued: true });
  }

  // 3. Rate-limit par IP (3 tentatives / 10 min)
  const ip = clientIp(request.headers);
  const rl = rateLimit(`newsletter:${ip}`, 3, 10 * 60_000);
  if (!rl.allowed) {
    return fail("Trop de tentatives. Réessayez dans quelques minutes.", 429);
  }

  // 4. Hash de l'IP (RGPD : on ne stocke pas l'IP brute)
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // 5. Upsert en base (confirmed_at = NULL → en attente)
  try {
    await upsertSubscriber({ email, source, ipHash });
  } catch (error) {
    logger.error("Upsert newsletter échoué", {
      to: maskEmail(email),
      message: error instanceof Error ? error.message : String(error),
    });
    return fail(
      "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
      500,
    );
  }

  // 6. Génération du token et envoi de l'email de confirmation
  let token: string;
  try {
    token = generateConfirmToken(email);
  } catch (error) {
    logger.error("Génération du token newsletter échouée", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail(
      "Service temporairement indisponible. Veuillez réessayer.",
      503,
    );
  }

  const confirmUrl = `${site.url}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const emailSent = await sendEmail(email, newsletterConfirmation(confirmUrl));

  if (!emailSent) {
    logger.warn("Email de confirmation newsletter non envoyé", {
      to: maskEmail(email),
    });
    // On ne fail pas : le subscriber est en base, l'opérateur peut relancer.
  }

  return ok({ queued: true });
}
