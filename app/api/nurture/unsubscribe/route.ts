import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/email/html";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyUnsubscribeToken } from "@/lib/nurture/token";
import { stopById, stopByEmail } from "@/lib/nurture/repository";

export const runtime = "nodejs";

/**
 * Extrait le token depuis la query string (lien one-click RFC 8058 : le corps
 * du POST envoyé par le client mail est fixe, "List-Unsubscribe=One-Click",
 * sans place pour un token, qui doit donc voyager dans l'URL elle-même) ou
 * depuis le corps de la requête (JSON, envoyé par la page /desinscription).
 */
async function extractToken(request: NextRequest): Promise<string | null> {
  const { searchParams } = new URL(request.url);
  const fromQuery = searchParams.get("token");
  if (fromQuery) return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as unknown;
      if (body && typeof body === "object" && "token" in body) {
        const token = (body as Record<string, unknown>).token;
        return typeof token === "string" ? token : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const raw = await request.text();
      return new URLSearchParams(raw).get("token");
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * POST /api/nurture/unsubscribe
 * Arrête tout parcours de nurturing vivant pour l'email visé par le token
 * (toutes sources confondues : une désinscription RGPD ne doit épargner
 * aucun parcours en cours, contrairement à `stopByEmail` déclenché par une
 * réservation Cal.com qui, lui, cible une seule source).
 *
 * Réponse NEUTRE (200) dans tous les cas côté contenu, que le token soit
 * valide, forgé, expiré ou absent : jamais d'oracle qui confirmerait à un
 * tiers ayant intercepté un lien la validité d'une adresse ou d'un token.
 * Idempotent : un replay (clic répété, ou un client mail qui retente le
 * one-click) n'a d'effet que sur un parcours déjà arrêté, sans erreur.
 *
 * Sécurité : fail-closed sans NURTURE_SECRET configuré (503) ; rate-limit
 * par IP contre l'énumération de tokens.
 */
export async function POST(request: NextRequest) {
  const env = getServerEnv();

  if (!env.NURTURE_SECRET) {
    logger.error("NURTURE_SECRET non configuré, désinscription rejetée");
    return fail("Désinscription non configurée.", 503);
  }

  const ip = clientIp(request.headers);
  if (!(await rateLimit(`nurture-unsub:${ip}`, 10, 60_000)).allowed) {
    return fail("Trop de requêtes.", 429);
  }

  const token = await extractToken(request);
  if (!token) {
    // Réponse neutre : ni confirmation ni infirmation de quoi que ce soit.
    return ok({ done: true });
  }

  const result = verifyUnsubscribeToken(token);
  if (!result.valid) {
    logger.warn("Token de désinscription nurture invalide", {
      reason: result.reason,
    });
    return ok({ done: true });
  }

  const outcomes = await Promise.allSettled([
    stopById(result.eid, "unsubscribed"),
    stopByEmail(result.email, "unsubscribed"),
  ]);

  outcomes.forEach((outcome, index) => {
    if (outcome.status === "rejected") {
      logger.error("Arrêt d'un parcours nurture a échoué (désinscription)", {
        step: index === 0 ? "stopById" : "stopByEmail",
        to: maskEmail(result.email),
        message:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason),
      });
    }
  });

  return ok({ done: true });
}
