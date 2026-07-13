import { z } from "zod";

/**
 * Validation de la soumission du Score de Préparation à la Cession (frontière API).
 * On ne fait jamais confiance à l'entrée :
 *   - l'email est normalisé,
 *   - les réponses ne sont acceptées que sous forme de paires (id de question →
 *     valeur d'option) courtes et plafonnées en nombre ; la cohérence sémantique
 *     (toutes les questions répondues, options valides) est vérifiée côté serveur
 *     via `isComplete`, et le score est TOUJOURS recalculé serveur.
 */

// Une réponse : clé "q1".."q99", valeur "q1a".."q99c". Bornées pour éviter tout abus.
const questionId = z.string().regex(/^q\d{1,2}$/, "Identifiant de question invalide.");
const optionValue = z
  .string()
  .regex(/^q\d{1,2}[a-z]$/, "Valeur de réponse invalide.");

export const scoreSubmission = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse email invalide.")
    .max(200, "Adresse email trop longue."),
  // 1 à 30 paires — le questionnaire en compte 10, la marge absorbe une évolution.
  answers: z
    .record(questionId, optionValue)
    .refine((value) => Object.keys(value).length >= 1, "Aucune réponse fournie.")
    .refine(
      (value) => Object.keys(value).length <= 30,
      "Trop de réponses fournies.",
    ),
  // Honeypot anti-bot : invisible côté UI, doit rester vide.
  website: z.string().max(0, "Champ honeypot rempli.").optional().or(z.literal("")),
});

export type ScoreSubmission = z.infer<typeof scoreSubmission>;
