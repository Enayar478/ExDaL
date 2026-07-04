import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { markLeadBooked, markLeadBookedById } from "@/lib/leads/repository";
import { sendEmail } from "@/lib/email/send";
import { prospectConfirmation, ownerNotification } from "@/lib/email/templates";
import {
  verifyCalSignature,
  calWebhookPayload,
  formatWhen,
} from "@/lib/cal-webhook";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/cal-webhook
 * Reçoit BOOKING_CREATED de Cal.com : marque le lead comme réservé,
 * envoie la confirmation sobre au prospect et la notification au propriétaire.
 *
 * Corrélation : par lead_id (metadata Cal) en priorité, fallback email.
 * Idempotence : cal_booking_uid unique en base — un replay Cal ne déclenche
 *               pas de doublon d'email.
 */
export async function POST(request: NextRequest) {
  const env = getServerEnv();

  // Rate-limit permissif : Cal.com peut envoyer des bursts légitimes.
  if (!rateLimit(`cal-webhook:${clientIp(request.headers)}`, 30).allowed) {
    return fail("Trop de requêtes.", 429);
  }

  // Fail-closed : sans secret configuré, on REJETTE tout (jamais d'endpoint ouvert).
  if (!env.CAL_WEBHOOK_SECRET) {
    logger.error("CAL_WEBHOOK_SECRET non configuré — webhook rejeté");
    return fail("Webhook non configuré.", 503);
  }

  const raw = await request.text();
  const signature = request.headers.get("x-cal-signature-256");
  if (!verifyCalSignature(raw, signature, env.CAL_WEBHOOK_SECRET)) {
    return fail("Signature invalide.", 401);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("Corps invalide.", 400);
  }

  const parsed = calWebhookPayload.safeParse(json);
  if (!parsed.success) {
    return fail("Payload webhook inattendu.", 422);
  }

  const { triggerEvent, payload } = parsed.data;
  if (triggerEvent !== "BOOKING_CREATED") {
    return ok({ ignored: triggerEvent });
  }

  const attendee = payload.attendees[0];
  const when = formatWhen(payload.startTime);
  const responses = payload.responses ?? {};
  const role = typeof responses.role === "string" ? responses.role : undefined;
  const company =
    typeof responses.company === "string" ? responses.company : undefined;

  const leadId = payload.metadata?.lead_id;
  const calBookingUid = payload.uid;

  // Corrélation + idempotence (best-effort, ne bloque pas les emails si erreur DB).
  let alreadyProcessed = false;
  try {
    if (leadId && calBookingUid) {
      // Chemin nominal : corrélation par id, idempotence garantie par cal_booking_uid.
      const wasNew = await markLeadBookedById(leadId, calBookingUid);
      if (!wasNew) {
        // Le booking uid était déjà en base : replay Cal, on ne renvoie pas d'emails.
        logger.warn("Booking déjà traité — ignoré (idempotence)", {
          calBookingUid,
          leadId,
        });
        alreadyProcessed = true;
      }
    } else {
      // Fallback : corrélation par email (lead_id absent = ancien client Cal sans metadata).
      await markLeadBooked(attendee.email);
    }
  } catch (error) {
    logger.error("Corrélation lead échouée", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  if (alreadyProcessed) {
    return ok({ processed: false, reason: "already_handled" });
  }

  const details = {
    name: attendee.name ?? "",
    email: attendee.email,
    role,
    company,
    when,
  };

  await sendEmail(attendee.email, prospectConfirmation(details));
  if (env.NOTIFICATION_EMAIL) {
    await sendEmail(env.NOTIFICATION_EMAIL, ownerNotification(details));
  }

  return ok({ processed: true });
}
