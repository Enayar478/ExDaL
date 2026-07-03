import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { markLeadBooked } from "@/lib/leads/repository";
import { sendEmail } from "@/lib/email/send";
import { prospectConfirmation, ownerNotification } from "@/lib/email/templates";
import {
  verifyCalSignature,
  calWebhookPayload,
  formatWhen,
} from "@/lib/cal-webhook";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/cal-webhook
 * Reçoit BOOKING_CREATED de Cal.com : marque le lead comme réservé,
 * envoie la confirmation sobre au prospect et la notification au propriétaire.
 */
export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const raw = await request.text();

  // La signature n'est vérifiée que si un secret est configuré.
  if (env.CAL_WEBHOOK_SECRET) {
    const signature = request.headers.get("x-cal-signature-256");
    if (!verifyCalSignature(raw, signature, env.CAL_WEBHOOK_SECRET)) {
      return fail("Signature invalide.", 401);
    }
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

  // Corrélation du lead (best-effort, ne bloque pas les emails).
  try {
    await markLeadBooked(attendee.email);
  } catch (error) {
    logger.error("markLeadBooked a échoué", {
      message: error instanceof Error ? error.message : String(error),
    });
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
