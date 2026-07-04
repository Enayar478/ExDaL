import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Vérification et parsing du webhook Cal.com (BOOKING_CREATED).
 * Docs signature : HMAC-SHA256 du corps brut, en-tête X-Cal-Signature-256.
 */
export function verifyCalSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const attendee = z.object({
  name: z.string().optional(),
  email: z.string().email(),
});

export const calWebhookPayload = z.object({
  triggerEvent: z.string(),
  payload: z.object({
    uid: z.string().optional(),
    startTime: z.string().optional(),
    attendees: z.array(attendee).min(1),
    responses: z.record(z.string(), z.unknown()).optional(),
    metadata: z
      .object({
        lead_id: z.string().optional(),
      })
      .passthrough()
      .optional(),
  }),
});

export type CalWebhookPayload = z.infer<typeof calWebhookPayload>;

/** Formate une date ISO en libellé lisible (Europe/Paris). */
export function formatWhen(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}
