import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Rate limiting à fenêtre glissante, durable via Supabase (Postgres).
 *
 * Le compteur vit dans la table `public.rate_limits` et est incrémenté de façon
 * ATOMIQUE par la fonction `check_rate_limit` (SECURITY DEFINER) — donc PARTAGÉ
 * entre toutes les instances serverless Vercel (résiste aux requêtes concurrentes
 * et aux cold starts), sans dépendre d'un service tiers : on réutilise l'infra
 * Supabase déjà en place.
 *
 * Fail-open contrôlé : si l'appel Supabase échoue (réseau, ou config absente en
 * dev/tests), on retombe sur un repli best-effort en mémoire de process plutôt
 * que de bloquer le trafic légitime.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// ── Repli en mémoire (best-effort : dev, tests, ou Supabase indisponible) ────
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  const next: Bucket = { count: bucket.count + 1, resetAt: bucket.resetAt };
  buckets.set(key, next);
  return { allowed: true, remaining: limit - next.count };
}

/**
 * Vérifie et incrémente le compteur pour `key`. Asynchrone (un aller-retour
 * Supabase). Repli mémoire en cas d'échec.
 */
export async function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return memoryLimit(key, limit, windowMs);
    return {
      allowed: Boolean(row.allowed),
      remaining: Number(row.remaining),
    };
  } catch {
    return memoryLimit(key, limit, windowMs);
  }
}

/**
 * Extrait une IP client fiable des en-têtes.
 * `x-real-ip` est injecté par Vercel et non falsifiable par le client, on le
 * privilégie. Le premier maillon de `x-forwarded-for` est spoofable ; on prend
 * donc le DERNIER maillon (celui ajouté par le proxy en périphérie) en repli.
 */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    return parts[parts.length - 1].trim();
  }
  return "unknown";
}
