/**
 * Constantes publiques du site ExDaL.
 * Aucune donnée sensible ici — uniquement ce qui peut apparaître côté client.
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://exdal.fr";

export const site = {
  name: "ExDaL",
  legalName: "Ex Datis Lumen",
  tagline: "De la donnée, la lumière.",
  url: rawSiteUrl,
  locale: "fr_FR",
  description:
    "Studio d'expertise en data financière, spécialiste Pennylane. Analytics engineer indépendant : tableaux de bord fiables et fichiers financiers prêts pour une levée ou une cession.",
  keywords: [
    "analytics engineer Pennylane",
    "tableau de bord Pennylane",
    "data financière cession",
    "data financière levée de fonds",
    "expert data Pennylane",
    "réconciliation Pennylane CRM",
    "reporting financier startup",
    "due diligence data",
  ],
  email: "contact@exdal.fr",
} as const;

export type Site = typeof site;
