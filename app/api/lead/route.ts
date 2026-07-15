import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { leadInput, stageToSegment } from "@/lib/validation/lead";
import { insertLead } from "@/lib/leads/repository";
import { buildCalUrl } from "@/lib/cal";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Taille maximale du corps (JSON de qualification, quelques centaines d'octets en pratique).
const MAX_BODY_BYTES = 8 * 1024; // 8 Ko

/**
 * POST /api/lead
 * Valide le formulaire de qualification, enregistre le lead dans Supabase,
 * et renvoie l'URL Cal.com préremplie vers laquelle rediriger le prospect.
 *
 * Sécurité :
 *  - Rate-limit par IP (5 req / min).
 *  - Limite de taille du corps (8 Ko) pour prévenir les payloads abusifs.
 *  - Honeypot côté Zod (website: max(0)), la vérification applicative ci-dessous
 *    est unreachable par construction mais conservée comme filet de défense explicite.
 *  - CAL_LINK est serveur uniquement (pas de NEXT_PUBLIC_).
 *  - Réponse non-cacheable (Cache-Control: no-store).
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (!(await rateLimit(`lead:${ip}`)).allowed) {
    return fail("Trop de tentatives. Réessayez dans un instant.", 429);
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

  const parsed = leadInput.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(first?.message ?? "Données invalides.", 422);
  }

  const lead = parsed.data;

  // Honeypot : Zod (website: max(0)) rejette toute valeur non vide avec un 422
  // avant d'atteindre ce point. Cette vérification est une défense en profondeur
  // explicite au cas où le schéma serait assoupli par erreur.
  if (lead.website) {
    // Réponse neutre : on ne trahit pas la détection aux bots.
    return fail("Requête refusée.", 400);
  }

  // Le segment déduit du stade prime si aucun n'a été choisi via le sélecteur.
  const withSegment = {
    ...lead,
    segment: lead.segment ?? stageToSegment(lead.stage),
  };

  const env = getServerEnv();
  const calLink = env.CAL_LINK;
  if (!calLink) {
    logger.error("CAL_LINK manquant, réservation indisponible");
    return fail("Réservation temporairement indisponible.", 503);
  }

  let storedLead: { id: string };
  try {
    storedLead = await insertLead(withSegment);
  } catch (error) {
    logger.error("insertLead a échoué", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Impossible d'enregistrer votre demande pour le moment.", 500);
  }

  const calUrl = buildCalUrl(calLink, withSegment, storedLead.id);
  return ok({ calUrl });
}
