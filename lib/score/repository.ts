import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { ScoreAnswers } from "@/lib/score/scoring";

/**
 * Accès aux soumissions du Score de Préparation (pattern repository).
 * Toute la logique métier dépend de cette interface, pas de Supabase directement.
 */
export interface StoredScoreSubmission {
  id: string;
}

export async function insertScoreSubmission(submission: {
  email: string;
  score: number;
  verdict: string;
  answers: ScoreAnswers;
  source?: string;
  ipHash?: string;
  marketingConsent?: boolean;
}): Promise<StoredScoreSubmission> {
  const supabase = getSupabaseAdmin();
  // Horodatage du consentement posé CÔTÉ SERVEUR, uniquement si le consentement
  // est explicitement vrai. Jamais de valeur client, jamais d'horodatage si refus.
  const marketingConsent = submission.marketingConsent ?? false;
  const marketingConsentAt = marketingConsent ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("score_submissions")
    .insert({
      email: submission.email,
      score: submission.score,
      verdict: submission.verdict,
      answers: submission.answers,
      source: submission.source ?? null,
      ip_hash: submission.ipHash ?? null,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsentAt,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Insertion de la soumission échouée : ${error.message}`);
  }
  return { id: data.id as string };
}
