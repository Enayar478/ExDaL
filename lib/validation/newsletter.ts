import { z } from "zod";

/**
 * Schéma de validation pour l'inscription à la newsletter « Lumen ».
 * Honeypot anti-spam : le champ `website` doit rester vide (jamais rempli par un humain).
 * Source optionnelle pour tracer l'origine de l'inscription.
 */
export const newsletterInput = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse email invalide.")
    .max(200, "Adresse email trop longue."),
  // Honeypot : invisible côté UI, rempli uniquement par les bots.
  website: z
    .string()
    .max(0, "Champ honeypot rempli.")
    .optional()
    .or(z.literal("")),
  // Contexte d'inscription (footer, lead-magnet, article, etc.)
  source: z.string().max(80).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterInput>;
