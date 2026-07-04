import { type NextRequest, NextResponse } from "next/server";
import { verifyConfirmToken } from "@/lib/newsletter/token";
import { confirmSubscriber } from "@/lib/newsletter/repository";
import { logger } from "@/lib/logger";
import { site } from "@/lib/site";

/**
 * GET /api/newsletter/confirm?token=…
 * Validation du double opt-in : vérifie le token HMAC, confirme l'abonné,
 * redirige vers la landing avec le paramètre `newsletter=confirmed`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/?newsletter=invalid", site.url),
      { status: 302 },
    );
  }

  const result = verifyConfirmToken(token);

  if (!result.valid) {
    logger.warn("Token de confirmation newsletter invalide", {
      reason: result.reason,
    });
    return NextResponse.redirect(
      new URL(`/?newsletter=${result.reason}`, site.url),
      { status: 302 },
    );
  }

  try {
    await confirmSubscriber(result.email);
  } catch (error) {
    logger.error("Confirmation newsletter échouée en base", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(
      new URL("/?newsletter=error", site.url),
      { status: 302 },
    );
  }

  return NextResponse.redirect(
    new URL("/?newsletter=confirmed", site.url),
    { status: 302 },
  );
}
