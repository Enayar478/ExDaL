/**
 * Catalogue typé des événements produit. Un événement = un moment du tunnel,
 * nommé en français snake_case, capturé UNIQUEMENT aux points de conversion
 * (pas de bruit : l'espace négatif vaut aussi pour la donnée).
 *
 * Règle absolue : JAMAIS de PII dans les propriétés (ni nom, ni email, ni
 * entreprise). Le mode cookieless et le RGPD l'exigent ; les identités vivent
 * dans Supabase, pas dans l'analytics.
 */
export const ANALYTICS_EVENTS = {
  /** Ouverture de la modale de qualification (tous points d'entrée confondus). */
  qualificationOuverte: "qualification_ouverte",
  /** Lead accepté par /api/lead, juste avant la redirection Cal.com. */
  leadSoumis: "lead_soumis",
  /** Bifurcation du parcours d'accueil : le visiteur dit ce qui l'amène. */
  bifurcationChoisie: "bifurcation_choisie",
  /** Premier clic sur « Calculer mon score » (entrée dans le quiz). */
  scoreDemarre: "score_demarre",
  /** Dixième réponse donnée : le verdict s'affiche. */
  scoreTermine: "score_termine",
  /** Email laissé pour recevoir le plan d'action du score. */
  scoreEmailSoumis: "score_email_soumis",
  /** Inscription newsletter acceptée (avant confirmation double opt-in). */
  newsletterInscription: "newsletter_inscription",
  /** Clic sur le CTA de fin d'article (variant qualification ou score). */
  articleCtaClique: "article_cta_clique",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Propriétés d'événement : scalaires uniquement, jamais de PII. */
export type AnalyticsProperties = Readonly<
  Record<string, string | number | boolean>
>;
