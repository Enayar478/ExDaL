"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics/client";

/**
 * Monte PostHog au chargement de l'app (une fois, côté client). Ne rend rien.
 * Placé dans le layout racine : les pageviews couvrent tout le site, y compris
 * le Journal (analyse article par article via l'URL courante).
 */
export function Analytics() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
