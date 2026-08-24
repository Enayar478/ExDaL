/**
 * Types du moteur de nurturing. Module pur, zéro I/O, zéro dépendance Supabase :
 * il peut être importé aussi bien côté repository que côté contenu ou rendu.
 */

/** Les trois séquences email, une par segment commercial. */
export type SequenceKey = "pilotage" | "cabinet" | "premium";

/** Cycle de vie d'un parcours de nurturing. */
export type EnrollmentStatus =
  | "pending"
  | "active"
  | "completed"
  | "stopped"
  | "unsubscribed";

/** Cause de sortie d'un parcours avant son terme naturel. */
export type StopReason =
  | "booked"
  | "unsubscribed"
  | "replied"
  | "manual"
  | "bounced"
  | "complained";

/** Origine du consentement ayant déclenché l'inscription à une séquence. */
export type NurtureSource = "qualification" | "score";

/** Un parcours de nurturing pour un email donné. */
export interface Enrollment {
  readonly id: string;
  readonly email: string;
  readonly sequence: SequenceKey;
  readonly source: NurtureSource;
  readonly leadId: string | null;
  readonly status: EnrollmentStatus;
  readonly startedAt: string | null;
  readonly nextStep: number;
  readonly nextSendAt: string | null;
  readonly stoppedAt: string | null;
  readonly stopReason: StopReason | null;
  readonly consentAt: string;
  readonly createdAt: string;
}

/**
 * Vue minimale d'un parcours arrivé à échéance, celle que consomme le cron
 * d'envoi. `startedAt` est toujours renseigné : seuls les parcours `active`
 * (donc déjà démarrés) sont éligibles.
 */
export interface DueEnrollment {
  readonly id: string;
  readonly email: string;
  readonly sequence: SequenceKey;
  readonly nextStep: number;
  readonly startedAt: string;
}
