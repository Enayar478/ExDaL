/**
 * Score de Préparation à la Cession — source unique de la copy et de la donnée.
 *
 * Lead magnet inbound : 10 questions fermées → score /100 → verdict → recommandations.
 * La logique (calcul, paliers, recos) vit dans `scoring.ts` ; ici, uniquement la
 * donnée et le texte (copy validée par l'agent thot-content, ton de marque ExDaL :
 * calme, sobre, sans superlatif ni jugement — un constat d'expert).
 *
 * Contrat structurel figé :
 *   - 10 questions, chacune avec 3 réponses ORDONNÉES du pire au meilleur (0 / 5 / 10 pts).
 *   - 4 dimensions de préparation (2 + 3 + 2 + 3 questions = 100 points au total).
 *   - 4 paliers de verdict couvrant 0–100 sans trou ni chevauchement.
 *   - 1 recommandation par dimension (affichée quand la dimension ressort faible).
 */

/** Les quatre dimensions de la préparation à une opération (levée / cession). */
export type DimensionKey = "comptes" | "metriques" | "tracabilite" | "dataroom";

/** Points d'une réponse — l'échelle est volontairement discrète et lisible. */
type AnswerPoints = 0 | 5 | 10;

interface ScoreAnswer {
  /** Identifiant stable de l'option (jamais affiché, sert d'état). */
  readonly value: string;
  /** Libellé présenté au dirigeant. */
  readonly label: string;
  /** Poids de préparation — les réponses sont ordonnées pire → meilleur. */
  readonly points: AnswerPoints;
}

export interface ScoreQuestion {
  readonly id: string;
  readonly dimension: DimensionKey;
  readonly prompt: string;
  /** Exactement 3 réponses, ordonnées du pire (0) au meilleur (10). */
  readonly answers: readonly ScoreAnswer[];
}

export interface VerdictTier {
  readonly key: "fondations" | "en-construction" | "credible" | "pret";
  /** Borne inférieure incluse. */
  readonly min: number;
  /** Borne supérieure incluse. */
  readonly max: number;
  readonly title: string;
  readonly body: string;
}

/** Libellés lisibles des dimensions (affichés dans les recommandations). */
export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  comptes: "Comptes & clôture",
  metriques: "Métriques de valorisation",
  tracabilite: "Traçabilité & réconciliation",
  dataroom: "Data room & due diligence",
};

/**
 * Les 10 questions. L'ordre des réponses (pire → meilleur) est porteur de sens :
 * l'index sert de barème (0 / 5 / 10). Ne pas réordonner sans ajuster les points.
 */
export const QUESTIONS: readonly ScoreQuestion[] = [
  // — Dimension A : Comptes & clôture ——————————————————————————————
  {
    id: "q1",
    dimension: "comptes",
    prompt:
      "Vos comptes des trois derniers mois sont-ils disponibles en un clic ?",
    answers: [
      { value: "q1a", label: "Non, il faut les reconstituer", points: 0 },
      { value: "q1b", label: "En partie, avec du délai", points: 5 },
      { value: "q1c", label: "Oui, immédiatement", points: 10 },
    ],
  },
  {
    id: "q2",
    dimension: "comptes",
    prompt:
      "Votre dernière clôture mensuelle a-t-elle été bouclée en moins de dix jours ouvrés ?",
    answers: [
      { value: "q2a", label: "Non, elle prend plusieurs semaines", points: 0 },
      {
        value: "q2b",
        label: "Oui, mais avec des ajustements de dernière minute",
        points: 5,
      },
      {
        value: "q2c",
        label: "Oui, dans les délais et sans surprise",
        points: 10,
      },
    ],
  },
  // — Dimension B : Métriques de valorisation ——————————————————————
  {
    id: "q3",
    dimension: "metriques",
    prompt:
      "Connaissez-vous votre MRR (chiffre d'affaires récurrent) exact, à jour ?",
    answers: [
      {
        value: "q3a",
        label: "Non, je raisonne en chiffre d'affaires global",
        points: 0,
      },
      {
        value: "q3b",
        label: "J'ai une estimation, recalculée manuellement",
        points: 5,
      },
      {
        value: "q3c",
        label: "Oui, un chiffre exact, suivi en continu",
        points: 10,
      },
    ],
  },
  {
    id: "q4",
    dimension: "metriques",
    prompt: "Votre taux de rétention ou de churn est-il mesuré chaque mois ?",
    answers: [
      { value: "q4a", label: "Non, jamais mesuré formellement", points: 0 },
      {
        value: "q4b",
        label: "Estimé de temps en temps, sans méthode fixe",
        points: 5,
      },
      {
        value: "q4c",
        label: "Oui, suivi mensuel, avec une définition stable",
        points: 10,
      },
    ],
  },
  {
    id: "q5",
    dimension: "metriques",
    prompt:
      "Pouvez-vous distinguer, dans vos revenus, ce qui est récurrent de ce qui est ponctuel ?",
    answers: [
      {
        value: "q5a",
        label: "Non, tout est mélangé dans le compte de résultat",
        points: 0,
      },
      {
        value: "q5b",
        label: "Approximativement, avec un tri manuel",
        points: 5,
      },
      {
        value: "q5c",
        label: "Oui, la distinction est structurée dans vos outils",
        points: 10,
      },
    ],
  },
  // — Dimension C : Traçabilité & réconciliation ———————————————————
  {
    id: "q6",
    dimension: "tracabilite",
    prompt:
      "Vos ventes, votre comptabilité et vos paiements racontent-ils la même histoire, au même euro près ?",
    answers: [
      {
        value: "q6a",
        label: "Non, les écarts ne sont jamais expliqués",
        points: 0,
      },
      {
        value: "q6b",
        label: "Oui, mais réconciliés à la main, en fin de mois",
        points: 5,
      },
      {
        value: "q6c",
        label: "Oui, réconciliés automatiquement, en continu",
        points: 10,
      },
    ],
  },
  {
    id: "q7",
    dimension: "tracabilite",
    prompt:
      "Un chiffre présenté à un tiers (banquier, investisseur) peut-il être retracé jusqu'à sa source en quelques minutes ?",
    answers: [
      {
        value: "q7a",
        label: "Non, il faudrait remonter plusieurs fichiers",
        points: 0,
      },
      {
        value: "q7b",
        label: "Oui, mais cela demande l'intervention d'une personne clé",
        points: 5,
      },
      {
        value: "q7c",
        label: "Oui, la source est documentée et accessible directement",
        points: 10,
      },
    ],
  },
  // — Dimension D : Data room & due diligence ——————————————————————
  {
    id: "q8",
    dimension: "dataroom",
    prompt:
      "Si un acheteur demandait vos trois derniers exercices avec le détail des ajustements, seriez-vous prêt sous 48 heures ?",
    answers: [
      {
        value: "q8a",
        label: "Non, il faudrait plusieurs semaines de préparation",
        points: 0,
      },
      {
        value: "q8b",
        label: "Oui, avec une mobilisation importante en urgence",
        points: 5,
      },
      {
        value: "q8c",
        label: "Oui, l'essentiel existe déjà, prêt à être partagé",
        points: 10,
      },
    ],
  },
  {
    id: "q9",
    dimension: "dataroom",
    prompt:
      "Avez-vous déjà identifié les documents qui composeraient votre data room le jour d'une opération ?",
    answers: [
      { value: "q9a", label: "Non, jamais réfléchi à la question", points: 0 },
      {
        value: "q9b",
        label: "Une liste existe, incomplète ou non tenue à jour",
        points: 5,
      },
      {
        value: "q9c",
        label: "Oui, une liste claire, et les documents sont rassemblés",
        points: 10,
      },
    ],
  },
  {
    id: "q10",
    dimension: "dataroom",
    prompt:
      "Votre prévisionnel financier (cohortes, hypothèses de croissance) tient-il à un examen ligne par ligne ?",
    answers: [
      {
        value: "q10a",
        label: "Non, il n'existe pas de prévisionnel formalisé",
        points: 0,
      },
      {
        value: "q10b",
        label:
          "Un prévisionnel existe, mais les hypothèses ne sont pas documentées",
        points: 5,
      },
      {
        value: "q10c",
        label: "Oui, les hypothèses sont documentées et vérifiables",
        points: 10,
      },
    ],
  },
];

/** Score total maximal atteignable — dérivé de la donnée, jamais codé en dur. */
export const MAX_SCORE = QUESTIONS.reduce(
  (total, question) =>
    total + Math.max(...question.answers.map((answer) => answer.points)),
  0,
);

/**
 * Quatre paliers couvrant 0–100. Bornes inclusives contiguës :
 * 0–40 / 41–70 / 71–90 / 91–100 (aucun trou, aucun chevauchement).
 */
export const VERDICT_TIERS: readonly VerdictTier[] = [
  {
    key: "fondations",
    min: 0,
    max: 40,
    title: "Les fondations restent à poser",
    body: "Vos chiffres ne racontent pas encore une histoire cohérente. Une levée ou une cession aujourd'hui demanderait plusieurs semaines de mise en ordre avant la première conversation sérieuse.",
  },
  {
    key: "en-construction",
    min: 41,
    max: 70,
    title: "La structure prend forme",
    body: "Les bases existent, mais des zones d'ombre subsistent. Un investisseur poserait des questions auxquelles vous n'avez pas encore de réponse immédiate.",
  },
  {
    key: "credible",
    min: 71,
    max: 90,
    title: "Un dossier crédible",
    body: "Vos chiffres tiennent l'examen. Quelques ajustements ciblés suffiraient à les rendre irréprochables face à une due diligence.",
  },
  {
    key: "pret",
    min: 91,
    max: 100,
    title: "Prêt pour l'examen",
    body: "Vos chiffres sont déjà au niveau qu'exige une opération. La question n'est plus la préparation, mais le moment choisi.",
  },
];

/** Une recommandation actionnable par dimension, affichée quand elle ressort faible. */
export const DIMENSION_RECOMMENDATIONS: Record<DimensionKey, string> = {
  comptes:
    "Automatisez votre clôture mensuelle pour la faire tenir en moins de dix jours ouvrés : c'est la première preuve de sérieux qu'un investisseur regarde.",
  metriques:
    "Isolez votre MRR et votre churn dans un tableau dédié, recalculé chaque mois selon une définition stable — pas réinventé à chaque fois qu'on vous le demande.",
  tracabilite:
    "Réconciliez CRM, comptabilité et paiements dans un entrepôt unique : un chiffre qui ne se retrace pas en quelques minutes est un chiffre qui inquiète.",
  dataroom:
    "Constituez votre data room avant qu'on vous la demande : la liste des documents attendus est connue, rassemblez-la maintenant plutôt que dans l'urgence.",
};

/** Textes de la page (en-tête, résultat, CTA) — centralisés pour la relecture éditoriale. */
export const SCORE_COPY = {
  eyebrow: "Diagnostic · 3 minutes",
  title: "Êtes-vous prêt pour l'examen ?",
  subtitle:
    "Dix questions sur vos comptes, vos métriques et votre traçabilité — pour savoir, avant qu'un investisseur ne le fasse à votre place, où se situe réellement votre dossier.",
  reassurance:
    "10 questions fermées. Résultat immédiat. Aucune donnée conservée sans votre accord.",
  startCta: "Commencer le diagnostic",
  // Résultat
  scoreOutOf: "sur 100",
  recommendationsTitle: "Par où commencer",
  resultLead:
    "Ce score est un point de départ. La conversation qui suit compte davantage.",
  primaryCta: "Échanger sur votre situation",
  emailLead:
    "Recevez le détail de votre score et une recommandation par dimension, par email.",
  emailCta: "Recevoir mon plan détaillé",
  shareCta: "Partager ce diagnostic",
  shareText:
    "J'ai mesuré la préparation de mes chiffres à une levée ou une cession. Faites le test :",
  restartCta: "Refaire le diagnostic",
  // SEO
  metaTitle: "Score de Préparation à la Cession",
  metaDescription:
    "Diagnostiquez en 3 minutes votre préparation à une levée ou une cession : 10 questions, un score sur 100, des recommandations avant la due diligence.",
} as const;
