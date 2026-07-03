import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

/**
 * Client Supabase côté serveur avec la clé service_role.
 * Ne JAMAIS exposer ce client ni cette clé au navigateur.
 * L'accès aux leads passe exclusivement par des routes API serveur.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const env = getServerEnv();
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
