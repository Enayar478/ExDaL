import type { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { ok, fail } from "@/lib/api";
import { scoreSubmission } from "@/lib/validation/score";
import { evaluate, isComplete } from "@/lib/score/scoring";
import { insertScoreSubmission } from "@/lib/score/repository";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { scorePlan } from "@/lib/email/templates";
import { maskEmail } from "@/lib/email/html";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Corps attendu : email + jusqu'à 30 paires de réponses (quelques centaines d'octets).
const MAX_BODY_BYTES = 4 * 1024; // 4 Ko
const SOURCE = "score-cession";

/**
 * POST /api/score
 * Reçoit les réponses au Score de Préparation, RECALCULE le score côté serveur
 * (jamais la valeur du client), persiste la soumission et envoie le plan par email.
 *
 * Sécurité :
 *  - Rate-limit par IP · limite de taille du corps · honeypot.
 *  - Le score n'est jamais lu depuis le client : recalcul serveur via `evaluate`.
 *  - IP hashée (RGPD), jamais stockée en clair.
 *  - Réponse neutre non-cacheable.
 */
export async function POST(request: NextRequest) {
  // 0. Limite de taille du corps.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return fail("Corps de requête trop volumineux.", 413);
  }

  // 1. Parse + validation Zod.
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

  const parsed = scoreSubmission.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(first?.message ?? "Données invalides.", 422);
  }

  const { email, answers, website } = parsed.data;

  // 2. Honeypot : réponse neutre (200) pour ne pas trahir la détection aux bots.
  if (website && website.length > 0) {
    return ok({ delivered: true });
  }

  // 3. Rate-limit par IP (5 tentatives / min).
  const ip = clientIp(request.headers);
  if (!(await rateLimit(`score:${ip}`)).allowed) {
    return fail("Trop de tentatives. Réessayez dans un instant.", 429);
  }

  // 4. Cohérence sémantique : toutes les questions doivent être répondues valablement.
  if (!isComplete(answers)) {
    return fail("Le diagnostic est incomplet.", 422);
  }

  // 5. Recalcul du score et du verdict CÔTÉ SERVEUR (source de vérité).
  const result = evaluate(answers);
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // 6. Persistance (analyse commerciale). Best-effort : un incident base ne doit
  //    pas priver le dirigeant du plan qu'il a demandé, on journalise et on continue.
  try {
    await insertScoreSubmission({
      email,
      score: result.score,
      verdict: result.verdict.key,
      answers,
      source: SOURCE,
      ipHash,
    });
  } catch (error) {
    logger.error("insertScoreSubmission a échoué", {
      to: maskEmail(email),
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // 7. Envoi du plan personnalisé (dégrade proprement si Resend n'est pas configuré).
  const emailSent = await sendEmail(
    email,
    scorePlan({
      score: result.score,
      verdictTitle: result.verdict.title,
      verdictBody: result.verdict.body,
      recommendations: result.recommendations.map((dimension) => ({
        label: dimension.label,
        text: dimension.recommendation,
      })),
    }),
  );

  if (!emailSent) {
    logger.warn("Email du plan de préparation non envoyé", {
      to: maskEmail(email),
    });
  }

  return ok({ delivered: true });
}
