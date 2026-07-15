import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { segmentSignal } from "@/lib/validation/lead";
import { insertPathSignal } from "@/lib/leads/repository";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Taille maximale du corps (signal de segmentation, quelques dizaines d'octets).
const MAX_BODY_BYTES = 1024; // 1 Ko

/**
 * POST /api/segment
 * Enregistre le choix d'une porte du sélecteur de parcours (signal de segmentation).
 * Silencieux pour l'UX : un échec ne bloque jamais le scroll côté client.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (!(await rateLimit(`segment:${ip}`, 20)).allowed) {
    return fail("Trop de requêtes.", 429);
  }

  // Rejet des corps trop volumineux avant la désérialisation JSON.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return fail("Corps de requête trop volumineux.", 413);
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return fail("Corps de requête trop volumineux.", 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return fail("Corps de requête invalide.", 400);
  }

  const parsed = segmentSignal.safeParse(payload);
  if (!parsed.success) {
    return fail("Segment invalide.", 422);
  }

  try {
    await insertPathSignal(parsed.data.segment);
  } catch (error) {
    logger.error("insertPathSignal a échoué", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Signal non enregistré.", 500);
  }

  return ok({ recorded: true });
}
