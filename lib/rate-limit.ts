import "server-only";

/**
 * Rate limiting best-effort en mémoire (fenêtre glissante).
 * Suffisant pour dissuader l'abus sur une landing page. Pour une montée en charge
 * multi-instances, brancher un store partagé (Upstash Redis) — voir README.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
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

/** Extrait une IP client raisonnable des en-têtes de la requête. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
