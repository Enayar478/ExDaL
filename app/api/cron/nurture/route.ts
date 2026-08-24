import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ok, fail } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { activateStalePending, fetchDue } from "@/lib/nurture/repository";
import { processDueEnrollment } from "@/lib/nurture/send-step";

export const runtime = "nodejs";
export const maxDuration = 60;

// Une passe quotidienne suffit : les offsets de séquence (lib/nurture/sequences.ts)
// sont exprimés en jours, et chaque étape est idempotente (verrou `claimStep`).
const BATCH_LIMIT = 50;

/** Comparaison à temps constant du Bearer token (même pattern que middleware.ts). */
function isAuthorized(request: NextRequest, secret: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(header, "utf8");
  return (
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf)
  );
}

/**
 * GET /api/cron/nurture
 * Déclenché quotidiennement par Vercel Cron (vercel.json, 08:00 UTC).
 *
 * Sécurité : fail-closed sans CRON_SECRET configuré (503, jamais de cron
 * ouvert par oubli de config) ; Bearer token comparé à temps constant (401
 * sinon). Vercel injecte cet en-tête automatiquement sur ses appels de cron.
 *
 * Ordre de traitement :
 *   1. Rattrapage des enrollments `pending` périmés (48h, PR 3) : les
 *      démarre avant de chercher les étapes dues, sinon ils ne seraient
 *      jamais repris tant qu'un autre événement ne les active pas.
 *   2. Les enrollments actifs dus, traités SÉQUENTIELLEMENT (jamais en
 *      parallèle) : Resend limite le débit à ~2 requêtes/seconde, un envoi
 *      concurrent ferait courir un risque de rate-limit côté fournisseur
 *      sur un lot de plusieurs dizaines d'emails.
 */
export async function GET(request: NextRequest) {
  const env = getServerEnv();

  if (!env.CRON_SECRET) {
    logger.error("CRON_SECRET non configuré, cron nurture rejeté");
    return fail("Cron non configuré.", 503);
  }

  if (!isAuthorized(request, env.CRON_SECRET)) {
    return fail("Non autorisé.", 401);
  }

  const now = new Date();
  const activated = await activateStalePending(now, BATCH_LIMIT);
  const due = await fetchDue(now, BATCH_LIMIT);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let repaired = 0;

  for (const enrollment of due) {
    const outcome = await processDueEnrollment(enrollment);
    if (outcome === "sent") {
      sent += 1;
    } else if (outcome === "failed") {
      failed += 1;
    } else if (outcome === "repaired") {
      repaired += 1;
    } else {
      skipped += 1;
    }
  }

  // Les reprises de claims périmés et les réparations d'avancement sont déjà
  // journalisées individuellement (avec maskEmail) dans processDueEnrollment :
  // ce résumé agrège les compteurs pour la supervision du cron dans son
  // ensemble, jamais un blocage silencieux ne doit passer inaperçu ici.
  logger.warn("Passage du cron nurture terminé", {
    activated,
    due: due.length,
    sent,
    failed,
    skipped,
    repaired,
  });

  return ok({ activated, sent, failed, skipped, repaired });
}
