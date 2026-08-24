/**
 * Calendrier des séquences de nurturing. Module PUR : zéro I/O, zéro appel
 * réseau, uniquement des fonctions de mapping et de calcul de dates. Toute la
 * logique métier « quand envoyer quoi » vit ici, testable sans mock.
 */
import type { Stage } from "@/lib/validation/lead";
import type { VerdictTier } from "@/lib/score/content";
import type { SequenceKey } from "@/lib/nurture/types";

type Verdict = VerdictTier["key"];

/**
 * Décalage en jours depuis `started_at` pour chaque étape (index = step).
 * Pilotage et cabinet partagent le même rythme ; premium est plus resserré
 * (cible en opération, la fenêtre de décision est plus courte).
 */
export const SEQUENCE_OFFSETS: Readonly<
  Record<SequenceKey, readonly number[]>
> = {
  pilotage: [0, 3, 7, 11, 15, 21],
  cabinet: [0, 3, 7, 11, 15, 21],
  premium: [0, 2, 5, 8, 11, 16],
};

/**
 * Route un verdict du Score de Préparation vers une séquence de nurturing.
 * Un dossier peu préparé (fondations / en-construction) a le plus à gagner
 * d'une séquence orientée opération (premium) : c'est l'angle qui parle le
 * plus directement à son point de douleur. Un dossier déjà solide
 * (credible / pret) est routé vers pilotage, plus proche d'un besoin de
 * suivi récurrent que d'une opération imminente.
 */
export function sequenceForVerdict(verdict: Verdict): SequenceKey {
  switch (verdict) {
    case "fondations":
    case "en-construction":
      return "premium";
    case "credible":
    case "pret":
      return "pilotage";
  }
}

/** Route le stade déclaré au formulaire de qualification vers une séquence. */
export function stageToSequence(stage: Stage): SequenceKey {
  switch (stage) {
    case "pilotage":
      return "pilotage";
    case "cabinet":
      return "cabinet";
    case "operation":
      return "premium";
  }
}

/**
 * Date d'envoi de l'étape `step` d'une séquence, calculée depuis `startedAt`.
 * Retourne `null` au-delà de la dernière étape (step >= 6), ce qui signale
 * l'appelant qu'il n'y a plus rien à programmer.
 */
export function sendAtFor(
  sequence: SequenceKey,
  step: number,
  startedAt: Date,
): Date | null {
  const offsets = SEQUENCE_OFFSETS[sequence];
  const offsetDays = offsets[step];
  if (step < 0 || offsetDays === undefined) {
    return null;
  }

  const result = new Date(startedAt);
  result.setUTCDate(result.getUTCDate() + offsetDays);
  return result;
}
