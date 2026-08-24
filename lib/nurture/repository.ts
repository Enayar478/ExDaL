import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { sendAtFor } from "@/lib/nurture/sequences";
import type {
  DueEnrollment,
  EnrollmentStatus,
  NurtureSource,
  SequenceKey,
  StopReason,
} from "@/lib/nurture/types";

/**
 * Accès aux données du moteur de nurturing (pattern repository).
 *
 * Différence volontaire avec les autres repositories du projet (leads,
 * newsletter, score) : ici, aucune fonction ne lève d'exception. Le cron
 * d'envoi traite potentiellement des dizaines d'enrollments en un seul
 * passage ; une erreur isolée sur l'un d'eux (ligne verrouillée, timeout
 * réseau) ne doit jamais interrompre le traitement des suivants. Chaque
 * échec est journalisé (lib/logger) et l'appelant reçoit une valeur de
 * repli sûre plutôt qu'une exception à rattraper.
 */

const POSTGRES_UNIQUE_VIOLATION = "23505";
const LAST_STEP = 5;
const STALE_PENDING_HOURS = 48;
/** Nombre maximal de tentatives d'envoi avant abandon définitif d'une étape. */
const MAX_SEND_ATTEMPTS = 3;
/**
 * Durée au-delà de laquelle une ligne `claimed` est considérée périmée (le
 * process qui l'a posée est mort avant markStepSent/markStepFailed : crash,
 * timeout). Largement supérieure au `maxDuration` de 60s du cron d'envoi
 * (app/api/cron/nurture/route.ts) : passé ce délai, aucun processus ne peut
 * plus légitimement détenir ce claim.
 */
const STALE_CLAIM_TTL_MS = 2 * 60 * 60 * 1000; // 2 heures

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type CreateEnrollmentResult =
  | { readonly created: true; readonly id: string }
  | {
      readonly created: false;
      readonly reason: "already-enrolled" | "unsubscribed" | "error";
    };

export interface CreateEnrollmentInput {
  readonly email: string;
  readonly sequence: SequenceKey;
  readonly source: NurtureSource;
  readonly leadId?: string | null;
  /** Horodatage serveur du consentement explicite (preuve RGPD). */
  readonly consentAt: string;
  /** true : démarre le parcours immédiatement (active). false : reste en attente. */
  readonly startNow: boolean;
}

/**
 * Crée un enrollment. Refuse (sans throw) si :
 *   - un parcours vivant (pending/active) existe déjà pour cet email
 *     (contrainte portée par l'index unique partiel de la migration) ;
 *   - l'email a déjà une désinscription enregistrée (vérifié en amont : une
 *     désinscription reste valable même après la fin d'un parcours vivant,
 *     ce que l'index unique seul ne peut pas garantir).
 */
export async function createEnrollment(
  input: CreateEnrollmentInput,
): Promise<CreateEnrollmentResult> {
  const email = normalizeEmail(input.email);

  if (await hasUnsubscribed(email)) {
    return { created: false, reason: "unsubscribed" };
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const startedAt = input.startNow ? now.toISOString() : null;
  const nextSendAt = input.startNow
    ? (sendAtFor(input.sequence, 0, now)?.toISOString() ?? null)
    : null;

  const { data, error } = await supabase
    .from("nurture_enrollments")
    .insert({
      email,
      sequence: input.sequence,
      source: input.source,
      lead_id: input.leadId ?? null,
      status: input.startNow ? "active" : "pending",
      started_at: startedAt,
      next_step: 0,
      next_send_at: nextSendAt,
      consent_at: input.consentAt,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return { created: false, reason: "already-enrolled" };
    }
    logger.error("Création d'un enrollment nurture échouée", {
      error: error.message,
    });
    return { created: false, reason: "error" };
  }

  return { created: true, id: data.id as string };
}

/**
 * Active le(s) enrollment(s) en attente d'un lead donné : démarre le
 * parcours (started_at = now, calcule next_send_at pour l'étape 0).
 * Idempotent : n'agit que sur les lignes encore `pending`.
 *
 * @returns true si un enrollment a été activé, false sinon.
 */
export async function activateByLeadId(leadId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data: pending, error: fetchError } = await supabase
    .from("nurture_enrollments")
    .select("id, sequence")
    .eq("lead_id", leadId)
    .eq("status", "pending")
    .limit(1);

  if (fetchError) {
    logger.error("Lecture des enrollments en attente échouée", {
      leadId,
      error: fetchError.message,
    });
    return false;
  }
  if (!pending || pending.length === 0) {
    return false;
  }

  const target = pending[0];
  const now = new Date();
  const nextSendAt = sendAtFor(target.sequence as SequenceKey, 0, now);

  const { error, data } = await supabase
    .from("nurture_enrollments")
    .update({
      status: "active",
      started_at: now.toISOString(),
      next_send_at: nextSendAt?.toISOString() ?? null,
    })
    .eq("id", target.id)
    .eq("status", "pending")
    .select("id");

  if (error) {
    logger.error("Activation de l'enrollment nurture échouée", {
      leadId,
      error: error.message,
    });
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

/**
 * Résultat d'une réclamation d'étape :
 *   - `claimed: true` : le step peut être envoyé par cet appelant.
 *     `reclaimedStale: true` signale que cette réclamation reprend une ligne
 *     `claimed` périmée (crash mid-flight d'un passage précédent) : l'appelant
 *     doit le journaliser explicitement, ce n'est jamais un claim silencieux.
 *   - `reason: "in-progress"` : déjà réclamé/envoyé par un autre passage (ou
 *     en échec avec des tentatives restantes non reprises), on ne renvoie
 *     jamais un doublon : l'appelant doit simplement passer au suivant.
 *   - `reason: "abandoned"` : les tentatives sont épuisées (>= 3), l'appelant
 *     doit faire avancer l'enrollment sans envoyer (jamais de blocage infini).
 *   - `reason: "sent-not-advanced"` : l'email est parti (ligne `sent`
 *     confirmée) mais `advanceEnrollment` a échoué juste après : l'appelant
 *     doit réparer l'avancement SANS jamais renvoyer l'email.
 */
export type ClaimStepResult =
  | { readonly claimed: true; readonly reclaimedStale?: boolean }
  | {
      readonly claimed: false;
      readonly reason: "in-progress" | "abandoned" | "sent-not-advanced";
    };

/**
 * Réclame l'envoi de l'étape `step` d'un enrollment : insère une ligne
 * `claimed` dans nurture_sends. La contrainte unique (enrollment_id, step)
 * fait office de verrou : si une ligne existe déjà pour cette étape, l'insert
 * échoue en conflit et `reclaimOrInspect` tranche entre reprise (retry d'un
 * échec récupérable) et abandon (tentatives épuisées).
 */
export async function claimStep(
  enrollmentId: string,
  step: number,
  emailKey: string,
): Promise<ClaimStepResult> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("nurture_sends")
    .insert({
      enrollment_id: enrollmentId,
      step,
      email_key: emailKey,
      status: "claimed",
    })
    .select("id")
    .single();

  if (!error) {
    return data ? { claimed: true } : { claimed: false, reason: "in-progress" };
  }

  if (error.code !== POSTGRES_UNIQUE_VIOLATION) {
    logger.error("Réclamation d'un envoi nurture échouée", {
      enrollmentId,
      step,
      error: error.message,
    });
    return { claimed: false, reason: "in-progress" };
  }

  return reclaimOrInspect(enrollmentId, step);
}

/**
 * Appelée uniquement après un conflit d'unicité sur (enrollment_id, step).
 * Tranche entre quatre issues, dans l'ordre :
 *   1. Ligne en échec récupérable (`failed`, attempts < 3) : reprise directe.
 *   2. Ligne `claimed` PÉRIMÉE (crash mid-flight, cf. `resolveStaleClaim`) :
 *      reprise si tentatives restantes, abandon définitif sinon.
 *   3. Sinon, lecture de l'état existant pour distinguer un envoi confirmé
 *      dont l'avancement a échoué (`sent-not-advanced`) d'un simple
 *      chevauchement avec un passage concurrent encore légitime (in-progress).
 */
async function reclaimOrInspect(
  enrollmentId: string,
  step: number,
): Promise<ClaimStepResult> {
  const supabase = getSupabaseAdmin();

  const { data: reclaimed, error: reclaimError } = await supabase
    .from("nurture_sends")
    .update({ status: "claimed" })
    .eq("enrollment_id", enrollmentId)
    .eq("step", step)
    .eq("status", "failed")
    .lt("attempts", MAX_SEND_ATTEMPTS)
    .select("id");

  if (reclaimError) {
    logger.error("Reprise d'un envoi nurture en échec échouée", {
      enrollmentId,
      step,
      error: reclaimError.message,
    });
    return { claimed: false, reason: "in-progress" };
  }
  if (Array.isArray(reclaimed) && reclaimed.length > 0) {
    return { claimed: true };
  }

  const staleOutcome = await resolveStaleClaim(enrollmentId, step);
  if (staleOutcome === "reclaimed") {
    return { claimed: true, reclaimedStale: true };
  }
  if (staleOutcome === "abandoned") {
    return { claimed: false, reason: "abandoned" };
  }

  const { data: existing, error: readError } = await supabase
    .from("nurture_sends")
    .select("status, attempts")
    .eq("enrollment_id", enrollmentId)
    .eq("step", step)
    .maybeSingle();

  if (readError || !existing) {
    // Fail-safe : état inconnu, on ne renvoie jamais un email en doublon.
    return { claimed: false, reason: "in-progress" };
  }

  const attempts =
    typeof existing.attempts === "number" ? existing.attempts : 0;
  if (existing.status === "failed" && attempts >= MAX_SEND_ATTEMPTS) {
    return { claimed: false, reason: "abandoned" };
  }
  if (existing.status === "sent") {
    return { claimed: false, reason: "sent-not-advanced" };
  }
  return { claimed: false, reason: "in-progress" };
}

type StaleClaimOutcome = "reclaimed" | "abandoned" | "none";

/**
 * Répare une ligne `claimed` périmée (créée il y a plus de STALE_CLAIM_TTL_MS) :
 * le process qui l'a posée est forcément mort avant markStepSent/markStepFailed,
 * sans quoi le cycle claim → envoi → marquage se serait terminé bien avant.
 *
 * Atomicité : chaque UPDATE porte SA condition de reprise dans le WHERE
 * (statut, péremption, valeur exacte d'`attempts`), jamais dans une lecture
 * préalable qui déciderait ensuite d'un write séparé. Deux passages du cron
 * qui tomberaient sur la même ligne au même instant ne peuvent donc pas
 * tous les deux "gagner" la reprise : au plus un UPDATE affecte une ligne.
 *
 * `attempts` ne peut être incrémenté par une expression serveur via ce client
 * Supabase (pas d'update `col + 1` en PostgREST) : on boucle donc sur les
 * valeurs exactes possibles (1 à MAX_SEND_ATTEMPTS - 1, soit 2 tentatives au
 * plus avec la borne actuelle) et on cible chacune par égalité stricte dans
 * le WHERE. Le nombre d'itérations est borné par une constante déjà utilisée
 * ailleurs (MAX_SEND_ATTEMPTS), pas une valeur arbitraire.
 *
 * Fenêtre résiduelle assumée (doctrine : un email perdu vaut mieux qu'un
 * blocage éternel, un doublon très rare est un compromis acceptable) : si le
 * process mort a crashé APRÈS l'acceptation de l'email par Resend mais AVANT
 * `markStepSent`, cette reprise renverra l'email une deuxième fois. Cette
 * fenêtre est de l'ordre de la milliseconde (le temps de l'appel réseau
 * Resend) et bornée par MAX_SEND_ATTEMPTS reprises maximum.
 */
async function resolveStaleClaim(
  enrollmentId: string,
  step: number,
): Promise<StaleClaimOutcome> {
  const supabase = getSupabaseAdmin();
  const staleBefore = new Date(Date.now() - STALE_CLAIM_TTL_MS).toISOString();

  for (let attempts = 1; attempts < MAX_SEND_ATTEMPTS; attempts += 1) {
    const { data, error } = await supabase
      .from("nurture_sends")
      .update({ status: "claimed", attempts: attempts + 1 })
      .eq("enrollment_id", enrollmentId)
      .eq("step", step)
      .eq("status", "claimed")
      .eq("attempts", attempts)
      .lt("created_at", staleBefore)
      .select("id");

    if (error) {
      logger.error("Reprise d'un claim nurture périmé échouée", {
        enrollmentId,
        step,
        error: error.message,
      });
      return "none";
    }
    if (Array.isArray(data) && data.length > 0) {
      return "reclaimed";
    }
  }

  const { data: expired, error: expireError } = await supabase
    .from("nurture_sends")
    .update({ status: "failed" })
    .eq("enrollment_id", enrollmentId)
    .eq("step", step)
    .eq("status", "claimed")
    .gte("attempts", MAX_SEND_ATTEMPTS)
    .lt("created_at", staleBefore)
    .select("id");

  if (expireError) {
    logger.error("Abandon d'un claim nurture périmé échoué", {
      enrollmentId,
      step,
      error: expireError.message,
    });
    return "none";
  }
  return Array.isArray(expired) && expired.length > 0 ? "abandoned" : "none";
}

/** Enrollments actifs dont l'étape suivante est due, les plus anciens d'abord. */
export async function fetchDue(
  now: Date,
  limit: number,
): Promise<readonly DueEnrollment[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("nurture_enrollments")
    .select("id, email, sequence, next_step, started_at")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .order("next_send_at", { ascending: true })
    .limit(limit);

  if (error) {
    logger.error("Lecture des enrollments dus échouée", {
      error: error.message,
    });
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    sequence: row.sequence as SequenceKey,
    nextStep: row.next_step as number,
    startedAt: row.started_at as string,
  }));
}

/** Marque une étape comme envoyée avec succès (id Resend pour traçabilité). */
export async function markStepSent(
  enrollmentId: string,
  step: number,
  resendId?: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("nurture_sends")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      resend_id: resendId ?? null,
    })
    .eq("enrollment_id", enrollmentId)
    .eq("step", step);

  if (error) {
    logger.error("Marquage d'un envoi nurture réussi échoué", {
      enrollmentId,
      step,
      error: error.message,
    });
  }
}

/** Marque une étape comme échouée et incrémente son compteur de tentatives. */
export async function markStepFailed(
  enrollmentId: string,
  step: number,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data, error: fetchError } = await supabase
    .from("nurture_sends")
    .select("attempts")
    .eq("enrollment_id", enrollmentId)
    .eq("step", step)
    .maybeSingle();

  if (fetchError) {
    logger.error("Lecture d'un envoi nurture échouée", {
      enrollmentId,
      step,
      error: fetchError.message,
    });
    return;
  }

  const attempts = (typeof data?.attempts === "number" ? data.attempts : 0) + 1;

  const { error } = await supabase
    .from("nurture_sends")
    .update({ status: "failed", attempts })
    .eq("enrollment_id", enrollmentId)
    .eq("step", step);

  if (error) {
    logger.error("Marquage d'un envoi nurture échoué en échec", {
      enrollmentId,
      step,
      error: error.message,
    });
  }
}

export interface AdvanceEnrollmentInput {
  readonly enrollmentId: string;
  readonly sequence: SequenceKey;
  readonly currentStep: number;
  readonly startedAt: string;
}

/**
 * Fait avancer un enrollment après l'envoi réussi de son étape courante.
 * Passe à `completed` (next_send_at = null) une fois la dernière étape
 * (step 5) franchie, sinon programme l'étape suivante.
 */
export async function advanceEnrollment(
  input: AdvanceEnrollmentInput,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const nextStep = input.currentStep + 1;
  const isComplete = input.currentStep >= LAST_STEP;

  const nextSendAt = isComplete
    ? null
    : (sendAtFor(
        input.sequence,
        nextStep,
        new Date(input.startedAt),
      )?.toISOString() ?? null);

  const { error } = await supabase
    .from("nurture_enrollments")
    .update({
      next_step: nextStep,
      status: isComplete ? "completed" : "active",
      next_send_at: nextSendAt,
    })
    .eq("id", input.enrollmentId);

  if (error) {
    logger.error("Avancement de l'enrollment nurture échoué", {
      enrollmentId: input.enrollmentId,
      error: error.message,
    });
  }
}

function stoppedStatusFor(reason: StopReason): EnrollmentStatus {
  return reason === "unsubscribed" ? "unsubscribed" : "stopped";
}

/**
 * Arrête tout parcours vivant (pending/active) pour un email (ex. bounce global).
 * `onlySource` restreint l'arrêt aux parcours d'une origine donnée : utilisé
 * quand un lead nurturé par le Score réserve un call, seul son parcours
 * `source: "score"` doit s'arrêter, jamais un parcours `qualification` que le
 * même appel de webhook vient tout juste d'activer.
 */
export async function stopByEmail(
  email: string,
  reason: StopReason,
  onlySource?: NurtureSource,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const baseQuery = supabase
    .from("nurture_enrollments")
    .update({
      status: stoppedStatusFor(reason),
      stopped_at: new Date().toISOString(),
      stop_reason: reason,
      next_send_at: null,
    })
    .eq("email", normalizeEmail(email))
    .in("status", ["pending", "active"]);

  const query = onlySource ? baseQuery.eq("source", onlySource) : baseQuery;
  const { error } = await query;

  if (error) {
    logger.error("Arrêt de l'enrollment nurture par email échoué", {
      error: error.message,
    });
  }
}

/** Arrête un parcours précis par son id (ex. clic sur le lien de désinscription). */
export async function stopById(
  enrollmentId: string,
  reason: StopReason,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("nurture_enrollments")
    .update({
      status: stoppedStatusFor(reason),
      stopped_at: new Date().toISOString(),
      stop_reason: reason,
      next_send_at: null,
    })
    .eq("id", enrollmentId)
    .in("status", ["pending", "active"]);

  if (error) {
    logger.error("Arrêt de l'enrollment nurture par id échoué", {
      enrollmentId,
      error: error.message,
    });
  }
}

/**
 * Un email s'est-il déjà désinscrit du nurturing ? Fail-safe RGPD : en cas
 * d'erreur de lecture, on répond `true` (on préfère bloquer un envoi
 * légitime plutôt que risquer de contacter quelqu'un qui s'est désinscrit).
 */
export async function hasUnsubscribed(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("nurture_enrollments")
    .select("id")
    .eq("email", normalizeEmail(email))
    .eq("status", "unsubscribed")
    .limit(1);

  if (error) {
    logger.error("Vérification de désinscription nurture échouée", {
      error: error.message,
    });
    return true;
  }

  return Array.isArray(data) && data.length > 0;
}

/**
 * Rattrapage (décision CEO) : active tout enrollment `pending` de source
 * "qualification" créé il y a plus de 48h, jamais démarré (le prospect n'a
 * pas réservé de call qui aurait autrement déclenché `activateByLeadId`).
 *
 * Aucun appelant dans cette PR : la route cron d'envoi (PR 4) l'invoquera
 * après son propre traitement des enrollments déjà actifs.
 *
 * @returns le nombre d'enrollments effectivement activés.
 */
export async function activateStalePending(
  now: Date,
  limit: number,
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const staleBefore = new Date(
    now.getTime() - STALE_PENDING_HOURS * 60 * 60 * 1000,
  );

  const { data: stale, error: fetchError } = await supabase
    .from("nurture_enrollments")
    .select("id, sequence")
    .eq("status", "pending")
    .eq("source", "qualification")
    .lt("created_at", staleBefore.toISOString())
    .limit(limit);

  if (fetchError) {
    logger.error("Lecture des enrollments en attente périmés échouée", {
      error: fetchError.message,
    });
    return 0;
  }
  if (!stale || stale.length === 0) {
    return 0;
  }

  let activatedCount = 0;
  for (const row of stale) {
    const nextSendAt = sendAtFor(row.sequence as SequenceKey, 0, now);

    const { error, data } = await supabase
      .from("nurture_enrollments")
      .update({
        status: "active",
        started_at: now.toISOString(),
        next_send_at: nextSendAt?.toISOString() ?? null,
      })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id");

    if (error) {
      logger.error("Activation d'un enrollment périmé échouée", {
        enrollmentId: row.id,
        error: error.message,
      });
      continue;
    }
    if (Array.isArray(data) && data.length > 0) {
      activatedCount += 1;
    }
  }

  return activatedCount;
}
