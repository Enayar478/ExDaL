import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * Vérification et parsing du webhook Resend (hygiène de liste : bounces et
 * plaintes). Resend délivre ses webhooks via Svix : trois en-têtes
 * (svix-id, svix-timestamp, svix-signature), signature HMAC-SHA256 en base64
 * du contenu "{svix-id}.{svix-timestamp}.{corps brut}", secret au format
 * whsec_<base64> (la partie utile est la portion base64 après le préfixe).
 *
 * Aucune dépendance npm `svix` : la vérification tient en une vingtaine de
 * lignes (cf. `verifyResendSignature`), testée directement contre un vecteur
 * construit dans test/resend-webhook.test.ts.
 */

const SVIX_SECRET_PREFIX = "whsec_";
const TOLERANCE_MS = 5 * 60 * 1000; // ±5 minutes, anti-replay.

export interface SvixHeaders {
  readonly id: string | null;
  readonly timestamp: string | null;
  readonly signature: string | null;
}

/** Décode la portion base64 du secret Resend (whsec_<base64>). */
function decodeSecret(secret: string): Buffer | null {
  if (!secret.startsWith(SVIX_SECRET_PREFIX)) return null;
  const encoded = secret.slice(SVIX_SECRET_PREFIX.length);
  if (!encoded) return null;
  try {
    return Buffer.from(encoded, "base64");
  } catch {
    return null;
  }
}

/** Compare deux buffers en temps constant, sans lever si les tailles diffèrent. */
function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Vérifie la signature Svix d'un webhook Resend.
 *
 * `svix-signature` peut porter plusieurs signatures espacées, chacune
 * préfixée par une version ("v1,<base64>", potentiellement "v1a,<base64>") :
 * une seule doit correspondre. Rejette si l'un des en-têtes manque, si le
 * timestamp sort de la fenêtre de tolérance (±5 min, anti-replay), ou si le
 * secret n'a pas la forme whsec_<base64>.
 */
export function verifyResendSignature(
  rawBody: string,
  headers: SvixHeaders,
  secret: string,
  now: Date = new Date(),
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(now.getTime() - timestampSeconds * 1000) > TOLERANCE_MS) {
    return false;
  }

  const key = decodeSecret(secret);
  if (!key) return false;

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", key).update(signedContent).digest();

  const candidates = signature
    .split(" ")
    .map((token) => token.split(",")[1])
    .filter((value): value is string => Boolean(value));

  return candidates.some((candidate) => {
    let candidateBuffer: Buffer;
    try {
      candidateBuffer = Buffer.from(candidate, "base64");
    } catch {
      return false;
    }
    return safeEqual(candidateBuffer, expected);
  });
}

const resendEventData = z
  .object({
    email_id: z.string().optional(),
    to: z.union([z.array(z.string()), z.string()]).optional(),
    from: z.string().optional(),
    subject: z.string().optional(),
  })
  .passthrough();

export const resendWebhookPayload = z
  .object({
    type: z.string(),
    created_at: z.string().optional(),
    data: resendEventData.optional(),
  })
  .passthrough();

export type ResendWebhookPayload = z.infer<typeof resendWebhookPayload>;

/** Extrait le premier destinataire d'un événement Resend (bounce/plainte). */
export function extractRecipientEmail(
  payload: ResendWebhookPayload,
): string | null {
  const to = payload.data?.to;
  if (Array.isArray(to)) return to[0] ?? null;
  if (typeof to === "string") return to;
  return null;
}
