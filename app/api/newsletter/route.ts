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

/**
 * POST /api/newsletter
 * Inscription newsletter avec double opt-in RGPD.
 * Flow : Zod → honeypot → rate-limit → upsert (non confirmé) → email de confirmation.
 */
export async function POST(request: NextRequest) {
  // 1. Parse + validation Zod
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Corps de la requête invalide.", 400);
  }

  const parsed = newsletterInput.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(" ");
    return fail(message, 422);
  }

  const { email, website, source } = parsed.data;

  // 2. Honeypot anti-bot — doit rester vide
  if (website && website.length > 0) {
    // On répond 200 pour ne pas trahir la détection aux bots.
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
