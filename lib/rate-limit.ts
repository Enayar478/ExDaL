import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting à fenêtre glissante.
 *
 * - Si Upstash Redis est configuré (`UPSTASH_REDIS_REST_URL` + `_TOKEN`), le
 *   compteur est PARTAGÉ entre toutes les instances serverless Vercel → la
 *   limite est réellement efficace (résiste aux requêtes concurrentes et aux
 *   cold starts).
 * - Sinon, repli best-effort en mémoire de process (dev, tests, ou tant que le
 *   store durable n'est pas branché). Non partagé entre instances : dissuasif
 *   seulement. L'activation d'Upstash ne demande aucun changement de code.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// ── Store durable (Upstash Redis) ───────────────────────────────────────────
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Un limiter par configuration (limite|fenêtre), mis en cache.
const limiters = new Map<string, Ratelimit>();
function upstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "exdal:rl",
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── Repli en mémoire (best-effort) ──────────────────────────────────────────
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
 * Vérifie et incrémente le compteur pour `key`. Asynchrone (Upstash fait un
 * aller-retour réseau). Fail-open contrôlé : si Redis est momentanément
 * indisponible, on retombe sur le repli mémoire plutôt que de bloquer le trafic
 * légitime.
 */
export async function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const limiter = upstashLimiter(limit, windowMs);
  if (limiter) {
    try {
      const { success, remaining } = await limiter.limit(key);
      return { allowed: success, remaining };
    } catch {
      return memoryLimit(key, limit, windowMs);
    }
  }
  return memoryLimit(key, limit, windowMs);
}

/**
 * Extrait une IP client fiable des en-têtes.
 * `x-real-ip` est injecté par Vercel et non falsifiable par le client — on le
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
