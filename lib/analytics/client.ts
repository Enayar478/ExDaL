import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsProperties } from "./events";

/**
 * Client PostHog (Cloud EU), pensé pour une landing sans bandeau de cookies :
 *
 * - `persistence: "memory"` : rien n'est écrit sur l'appareil (ni cookie, ni
 *   localStorage). Exempté de consentement (doctrine CNIL sur la mesure
 *   d'audience sans traceur). Contrepartie assumée : les visiteurs uniques
 *   sont approximatifs, le tunnel (événements) reste exact.
 * - `person_profiles: "identified_only"` : événements anonymes, aucun profil
 *   créé (personne n'est jamais identifiée côté client).
 * - `autocapture` et session recording désactivés : uniquement les pageviews
 *   et les événements du catalogue `ANALYTICS_EVENTS`.
 *
 * Sans clé `NEXT_PUBLIC_POSTHOG_KEY` (dev, préprod), tout est no-op silencieux.
 */
const POSTHOG_API_HOST = "https://eu.i.posthog.com";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

/** Une clé projet PostHog valide commence toujours par `phc_`. */
export function isAnalyticsKey(key: string | undefined): key is string {
  return typeof key === "string" && key.startsWith("phc_");
}

let initialized = false;

/** Initialise PostHog une seule fois, côté navigateur uniquement. */
export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!isAnalyticsKey(key)) return;

  posthog.init(key, {
    api_host: POSTHOG_API_HOST,
    ui_host: POSTHOG_UI_HOST,
    // Presets 2025 : pageviews SPA via history change, pageleave fiable.
    defaults: "2025-05-24",
    persistence: "memory",
    person_profiles: "identified_only",
    autocapture: false,
    disable_session_recording: true,
  });
  initialized = true;
}

/**
 * Garde anti-PII (défense en profondeur) : les propriétés attendues sont des
 * enums courts (segment, stage, verdict...) ou des nombres. Une valeur qui
 * ressemble à un email ou dépasse une longueur d'enum plausible est écartée
 * AVANT l'envoi : même une erreur de câblage future ne fera pas fuiter de
 * donnée personnelle vers l'analytics.
 */
const MAX_PROPERTY_LENGTH = 64;

export function sanitizeProperties(
  properties: AnalyticsProperties | undefined,
): AnalyticsProperties | undefined {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      if (typeof value !== "string") return true;
      return !value.includes("@") && value.length <= MAX_PROPERTY_LENGTH;
    }),
  );
}

/**
 * Capture un événement du catalogue. No-op tant que `initAnalytics` n'a pas
 * abouti (clé absente, SSR, adblocker) : ne jette jamais, l'analytics ne doit
 * jamais casser le tunnel.
 */
export function capture(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
): void {
  if (!initialized) return;
  try {
    posthog.capture(event, sanitizeProperties(properties));
  } catch {
    // Silencieux par design : la mesure ne prime jamais sur la conversion.
  }
}
