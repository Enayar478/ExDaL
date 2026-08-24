import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/email/html";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  verifyResendSignature,
  resendWebhookPayload,
  extractRecipientEmail,
} from "@/lib/resend-webhook";
import { stopByEmail } from "@/lib/nurture/repository";
import type { StopReason } from "@/lib/nurture/types";

export const runtime = "nodejs";

// Taille maximale du corps du webhook Resend (même plafond que cal-webhook :
// un événement bounce/complaint typique fait quelques Ko, 64 Ko est généreux).
const MAX_BODY_BYTES = 64 * 1024;

/** Seuls ces deux événements déclenchent une hygiène de liste ; tout le reste est neutre. */
const STOP_REASON_BY_EVENT: Readonly<Record<string, StopReason>> = {
  "email.bounced": "bounced",
  "email.complained": "complained",
};

/**
 * POST /api/resend-webhook
 * Hygiène de liste automatique du nurturing.
 *
 * `email.bounced` (rejet permanent par le serveur du destinataire) et
 * `email.complained` (plainte spam) stoppent TOUS les parcours vivants de
 * l'email concerné : un hard bounce relancé détruit la réputation d'envoi,
 * une plainte ignorée est un problème RGPD. Tout autre type d'événement
 * répond 200 sans effet.
 *
 * Sécurité (doctrine cal-webhook, cf. app/api/cal-webhook/route.ts) :
 *  - Fail-closed : sans RESEND_WEBHOOK_SECRET configuré → 503.
 *  - Signature Svix vérifiée en temps constant AVANT tout parsing métier.
 *  - Limite de taille du corps pour prévenir les payloads abusifs.
 *  - Rate-limit permissif (30/min) pour les bursts légitimes de Resend.
 *
 * Idempotent par nature : stopper un parcours déjà arrêté est un no-op
 * (stopByEmail ne cible que les statuts pending/active).
 */
export async function POST(request: NextRequest) {
  const env = getServerEnv();

  if (
    !(await rateLimit(`resend-webhook:${clientIp(request.headers)}`, 30))
      .allowed
  ) {
    return fail("Trop de requêtes.", 429);
  }

  // Fail-closed : sans secret configuré, on REJETTE tout (jamais d'endpoint ouvert).
  if (!env.RESEND_WEBHOOK_SECRET) {
    logger.error("RESEND_WEBHOOK_SECRET non configuré, webhook rejeté");
    return fail("Webhook non configuré.", 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return fail("Corps de requête trop volumineux.", 413);
  }

  const raw = await request.text();

  // Double vérification de taille après lecture (defense-in-depth).
  if (raw.length > MAX_BODY_BYTES) {
    return fail("Corps de requête trop volumineux.", 413);
  }

  // Vérification de la signature AVANT toute autre opération (fail-fast).
  const svixHeaders = {
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
  };
  if (!verifyResendSignature(raw, svixHeaders, env.RESEND_WEBHOOK_SECRET)) {
    return fail("Signature invalide.", 401);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("Corps invalide.", 400);
  }

  const parsed = resendWebhookPayload.safeParse(json);
  if (!parsed.success) {
    return fail("Payload webhook inattendu.", 422);
  }

  const reason = STOP_REASON_BY_EVENT[parsed.data.type];
  if (!reason) {
    return ok({ ignored: true });
  }

  const email = extractRecipientEmail(parsed.data);
  if (!email) {
    logger.warn("Événement Resend sans destinataire exploitable", {
      type: parsed.data.type,
    });
    return ok({ processed: false, reason: "no_recipient" });
  }

  try {
    await stopByEmail(email, reason);
  } catch (error) {
    logger.error("Arrêt des parcours nurture après événement Resend échoué", {
      type: parsed.data.type,
      to: maskEmail(email),
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return ok({ processed: true });
}
