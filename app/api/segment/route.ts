import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { segmentSignal } from "@/lib/validation/lead";
import { insertPathSignal } from "@/lib/leads/repository";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/segment
 * Enregistre le choix d'une porte du sélecteur de parcours (signal de segmentation).
 * Silencieux pour l'UX : un échec ne bloque jamais le scroll côté client.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (!rateLimit(`segment:${ip}`, 20).allowed) {
    return fail("Trop de requêtes.", 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
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
