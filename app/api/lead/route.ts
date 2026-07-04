import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { leadInput, stageToSegment } from "@/lib/validation/lead";
import { insertLead } from "@/lib/leads/repository";
import { buildCalUrl } from "@/lib/cal";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/lead
 * Valide le formulaire de qualification, enregistre le lead dans Supabase,
 * et renvoie l'URL Cal.com préremplie vers laquelle rediriger le prospect.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (!rateLimit(`lead:${ip}`).allowed) {
    return fail("Trop de tentatives. Réessayez dans un instant.", 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Corps de requête invalide.", 400);
  }

  const parsed = leadInput.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(first?.message ?? "Données invalides.", 422);
  }

  const lead = parsed.data;

  // Honeypot : un bot a rempli le champ caché.
  if (lead.website) {
    return fail("Requête refusée.", 400);
  }

  // Le segment déduit du stade prime si aucun n'a été choisi via le sélecteur.
  const withSegment = {
    ...lead,
    segment: lead.segment ?? stageToSegment(lead.stage),
  };

  const calLink = process.env.NEXT_PUBLIC_CAL_LINK;
  if (!calLink) {
    logger.error("NEXT_PUBLIC_CAL_LINK manquant");
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
