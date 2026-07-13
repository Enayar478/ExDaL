/**
 * Logique de scoring — fonctions pures, sans effet de bord ni mutation.
 * Aucune dépendance UI : entièrement testable en isolation.
 */
import {
  QUESTIONS,
  VERDICT_TIERS,
  DIMENSION_RECOMMENDATIONS,
  DIMENSION_LABELS,
  MAX_SCORE,
  type DimensionKey,
  type ScoreQuestion,
  type VerdictTier,
} from "@/lib/score/content";

/** État des réponses : identifiant de question → valeur de l'option choisie. */
export type ScoreAnswers = Readonly<Record<string, string>>;

export interface DimensionResult {
  readonly key: DimensionKey;
  readonly label: string;
  /** Ratio de préparation de la dimension, entre 0 et 1. */
  readonly ratio: number;
  readonly recommendation: string;
}

export interface ScoreResult {
  /** Score global sur 100 (arrondi). */
  readonly score: number;
  readonly verdict: VerdictTier;
  /** Dimensions faibles à travailler en priorité (0 à 3, de la plus faible à la moins faible). */
  readonly recommendations: readonly DimensionResult[];
}

/** Seuil en deçà duquel une dimension est jugée « à travailler ». */
const WEAK_DIMENSION_RATIO = 0.75;
/** Nombre maximum de recommandations affichées (le doc vise 2–3). */
const MAX_RECOMMENDATIONS = 3;

/** Retourne les points d'une réponse donnée, ou 0 si l'option est inconnue/absente. */
function pointsForAnswer(question: ScoreQuestion, value: string | undefined): number {
  const answer = question.answers.find((option) => option.value === value);
  return answer?.points ?? 0;
}

/** Vrai lorsque chaque question a reçu une réponse valide. */
export function isComplete(answers: ScoreAnswers): boolean {
  return QUESTIONS.every((question) =>
    question.answers.some((option) => option.value === answers[question.id]),
  );
}

/** Score global sur 100. Les questions sans réponse comptent pour 0 (défensif). */
export function computeScore(answers: ScoreAnswers): number {
  const raw = QUESTIONS.reduce(
    (total, question) => total + pointsForAnswer(question, answers[question.id]),
    0,
  );
  // MAX_SCORE vaut 100 par construction, mais on normalise pour rester robuste
  // si le barème évolue.
  return Math.round((raw / MAX_SCORE) * 100);
}

/** Palier de verdict correspondant à un score (bornes inclusives, 0–100). */
export function verdictFor(score: number): VerdictTier {
  const clamped = Math.max(0, Math.min(100, score));
  const tier = VERDICT_TIERS.find(
    (candidate) => clamped >= candidate.min && clamped <= candidate.max,
  );
  // VERDICT_TIERS couvre 0–100 sans trou : ce repli n'est atteint que si la
  // configuration devient invalide. On renvoie le dernier palier par sûreté.
  return tier ?? VERDICT_TIERS[VERDICT_TIERS.length - 1];
}

/** Ratio de préparation (0–1) de chaque dimension, calculé sur ses seules questions. */
export function dimensionRatios(answers: ScoreAnswers): Record<DimensionKey, number> {
  const totals = new Map<DimensionKey, { earned: number; max: number }>();

  for (const question of QUESTIONS) {
    const best = Math.max(...question.answers.map((option) => option.points));
    const earned = pointsForAnswer(question, answers[question.id]);
    const current = totals.get(question.dimension) ?? { earned: 0, max: 0 };
    totals.set(question.dimension, {
      earned: current.earned + earned,
      max: current.max + best,
    });
  }

  const ratios = {} as Record<DimensionKey, number>;
  for (const [key, { earned, max }] of totals) {
    ratios[key] = max === 0 ? 0 : earned / max;
  }
  return ratios;
}

/**
 * Dimensions faibles à recommander, de la plus faible à la moins faible.
 * On ne retient que celles sous le seuil, plafonnées à MAX_RECOMMENDATIONS.
 */
export function recommendationsFor(answers: ScoreAnswers): readonly DimensionResult[] {
  const ratios = dimensionRatios(answers);

  return (Object.keys(ratios) as DimensionKey[])
    .map((key) => ({
      key,
      label: DIMENSION_LABELS[key],
      ratio: ratios[key],
      recommendation: DIMENSION_RECOMMENDATIONS[key],
    }))
    .filter((dimension) => dimension.ratio < WEAK_DIMENSION_RATIO)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, MAX_RECOMMENDATIONS);
}

/** Résultat complet du diagnostic : score, verdict et recommandations prioritaires. */
export function evaluate(answers: ScoreAnswers): ScoreResult {
  const score = computeScore(answers);
  return {
    score,
    verdict: verdictFor(score),
    recommendations: recommendationsFor(answers),
  };
}
