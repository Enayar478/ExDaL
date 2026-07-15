/**
 * Catalogue des newsletters ExDaL — contenu-comme-données, immuable.
 * Aujourd'hui une seule lettre (Lumen) ; la structure est un tableau pour
 * accueillir plus tard des rendez-vous plus spécialisés, sans refonte : chaque
 * entrée porte sa copy et son `source` (traçabilité de l'inscription).
 */

export interface NewsletterBenefit {
  readonly title: string;
  readonly body: string;
}

export interface Newsletter {
  /** Identifiant d'URL / d'ancre (kebab-case). */
  readonly slug: string;
  /** Nom propre de la lettre. */
  readonly name: string;
  /** Sur-titre mono. */
  readonly eyebrow: string;
  /** Description courte (footer, menu, carte) — une phrase. */
  readonly tagline: string;
  /** Titre de présentation (H1 sur la page). */
  readonly title: string;
  /** Chapeau sous le titre. */
  readonly lede: string;
  /** Ce que reçoit l'abonné (3 points). */
  readonly benefits: readonly NewsletterBenefit[];
  /** Rythme et format, en une phrase sobre. */
  readonly cadence: string;
  /** Libellé du bouton d'inscription. */
  readonly ctaLabel: string;
  /** `source` transmis à l'API newsletter (traçabilité). */
  readonly source: string;
  /** Ouverte aux inscriptions ? (les futures lettres pourront être « à venir »). */
  readonly available: boolean;
  readonly metaTitle: string;
  readonly metaDescription: string;
}

const lumen: Newsletter = {
  slug: "lumen",
  name: "Lumen",
  eyebrow: "La newsletter",
  tagline:
    "Une lecture directe de la donnée financière : ce qu'un chiffre révèle, et ce qu'il cache.",
  title: "Ce que vos chiffres taisent",
  lede: "Lumen est une lecture bimensuelle de la donnée financière. Un signal repéré dans un dashboard, une ligne de bilan qui change tout, une méthode Pennylane rendue lisible : de quoi affiner une décision avant le prochain comité.",
  benefits: [
    {
      title: "Une lecture de terrain",
      body: "Un cas réel — une ligne de compte de résultat ou un dashboard Pennylane — décortiqué sans jargon.",
    },
    {
      title: "Un signal à surveiller",
      body: "Un indicateur qui mérite l'attention ce mois-ci, et la raison précise.",
    },
    {
      title: "Une note de méthode",
      body: "Une façon de réconcilier ou de fiabiliser une donnée financière, expliquée pas à pas.",
    },
  ],
  cadence:
    "Deux fois par mois, un email court et sobre. Désinscription en un clic, à tout moment.",
  ctaLabel: "Recevoir Lumen",
  source: "page-newsletter",
  available: true,
  metaTitle: "Lumen : la newsletter data financière d'ExDaL",
  metaDescription:
    "Lumen, la newsletter bimensuelle d'ExDaL : lectures de bilans et dashboards Pennylane, pour dirigeants qui pilotent leurs chiffres, pas l'inverse.",
};

export const NEWSLETTERS: readonly Newsletter[] = [lumen];

/** La lettre phare, mise en avant partout tant qu'il n'y en a qu'une. */
export const LUMEN = lumen;

/** Amorce discrète : d'autres rendez-vous viendront s'ajouter à Lumen. */
export const NEWSLETTER_TEASER_FUTUR =
  "D'autres rendez-vous, plus spécialisés, viendront s'ajouter à Lumen le moment venu.";
