import { z } from "zod";

/**
 * Schémas de validation des données prospect (frontière du système).
 * On ne fait jamais confiance à l'entrée : tout passe par Zod avant traitement.
 */

// Usage de Pennylane — question 2 du formulaire de qualification.
export const pennylaneUsage = z.enum(["oui", "non", "bientot"]);
export type PennylaneUsage = z.infer<typeof pennylaneUsage>;

// Stade du prospect — question 3, alimente la segmentation commerciale.
export const stage = z.enum(["pilotage", "cabinet", "operation"]);
export type Stage = z.infer<typeof stage>;

// Signal du sélecteur de parcours (les 3 portes de la section 4).
export const segment = z.enum(["pme", "cabinet", "premium"]);
export type Segment = z.infer<typeof segment>;

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} est requis.`)
    .max(max, `${label} est trop long.`);

// Formulaire de qualification en 3 questions (le brief : rôle, Pennylane, stade).
// L'email est capté à l'étape d'identité : il nous permet d'enregistrer le lead
// et de préremplir Cal.com même si le prospect n'aboutit pas la réservation.
export const leadInput = z.object({
  name: trimmed(2, 120, "Le nom"),
  email: z.string().trim().toLowerCase().email("Email invalide.").max(200),
  role: trimmed(2, 120, "Le rôle"),
  company: trimmed(1, 160, "L'entreprise"),
  pennylane: pennylaneUsage,
  stage: stage,
  // Segment éventuellement pré-sélectionné via le sélecteur de parcours.
  segment: segment.optional(),
  // Honeypot anti-spam : doit rester vide.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadInput>;

// Signal de segmentation seul (clic sur une porte, avant tout formulaire).
export const segmentSignal = z.object({
  segment: segment,
});

export type SegmentSignal = z.infer<typeof segmentSignal>;

/** Traduit un stade de qualification vers un segment commercial. */
export function stageToSegment(value: Stage): Segment {
  switch (value) {
    case "pilotage":
      return "pme";
    case "cabinet":
      return "cabinet";
    case "operation":
      return "premium";
  }
}
