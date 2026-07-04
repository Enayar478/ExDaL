import "server-only";
import { z } from "zod";

/**
 * Validation des variables d'environnement serveur au démarrage (fail-fast).
 * Aucun secret n'est jamais codé en dur : tout vient de l'environnement.
 * Ces valeurs ne doivent JAMAIS être importées dans un composant client.
 */
const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL doit être une URL valide."),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, "SUPABASE_SERVICE_ROLE_KEY manquante."),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY manquante.").optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  NOTIFICATION_EMAIL: z.string().email().optional(),
  CAL_WEBHOOK_SECRET: z.string().optional(),
  // Secret HMAC-SHA256 pour signer les tokens de confirmation newsletter.
  // Générer avec : openssl rand -hex 32
  NEWSLETTER_SECRET: z.string().min(16).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Retourne l'environnement serveur validé.
 * Lève une erreur explicite si une variable requise manque.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
    CAL_WEBHOOK_SECRET: process.env.CAL_WEBHOOK_SECRET,
    NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");
    throw new Error(`Configuration serveur invalide — ${issues}`);
  }

  cached = parsed.data;
  return cached;
}
