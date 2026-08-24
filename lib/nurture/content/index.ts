/**
 * Résolveur de contenu des séquences de nurturing. Module PUR : aucune
 * dépendance Supabase, juste un accès indexé aux définitions déclaratives de
 * chaque séquence (pilotage/cabinet/premium), utilisé par le cron d'envoi
 * pour retrouver l'email à rendre pour une étape donnée.
 */
import { PILOTAGE_EMAILS } from "@/lib/nurture/content/pilotage";
import { CABINET_EMAILS } from "@/lib/nurture/content/cabinet";
import { PREMIUM_EMAILS } from "@/lib/nurture/content/premium";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";
import type { SequenceKey } from "@/lib/nurture/types";

const SEQUENCE_EMAILS: Readonly<
  Record<SequenceKey, readonly NurtureEmailDefinition[]>
> = {
  pilotage: PILOTAGE_EMAILS,
  cabinet: CABINET_EMAILS,
  premium: PREMIUM_EMAILS,
};

/**
 * Retrouve la définition d'un email pour une séquence et une étape données.
 * Retourne `null` si l'étape n'existe pas (garde-fou : ne doit jamais arriver
 * en pratique, `next_step` étant borné par la contrainte SQL 0-6 et
 * `advanceEnrollment` passant l'enrollment à `completed` avant le step 6).
 */
export function emailDefinitionFor(
  sequence: SequenceKey,
  step: number,
): NurtureEmailDefinition | null {
  return SEQUENCE_EMAILS[sequence][step] ?? null;
}
