import { describe, it, expect } from "vitest";
import { QUESTIONS, VERDICT_TIERS, MAX_SCORE } from "@/lib/score/content";
import {
  computeScore,
  verdictFor,
  isComplete,
  dimensionRatios,
  recommendationsFor,
  evaluate,
  type ScoreAnswers,
} from "@/lib/score/scoring";

/**
 * Construit un jeu de réponses en choisissant, pour chaque question, une lettre
 * d'option ('a' = pire/0, 'b' = médian/5, 'c' = meilleur/10).
 * Les valeurs d'options suivent la convention `${id}${lettre}` (ex. "q1a").
 */
function answersWith(letterFor: (id: string) => "a" | "b" | "c"): ScoreAnswers {
  return Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      `${question.id}${letterFor(question.id)}`,
    ]),
  );
}

const allWorst = answersWith(() => "a");
const allMedian = answersWith(() => "b");
const allBest = answersWith(() => "c");

describe("données du questionnaire", () => {
  it("comporte exactement 10 questions", () => {
    expect(QUESTIONS).toHaveLength(10);
  });

  it("attribue 3 réponses ordonnées 0 / 5 / 10 à chaque question", () => {
    for (const question of QUESTIONS) {
      expect(question.answers).toHaveLength(3);
      expect(question.answers.map((a) => a.points)).toEqual([0, 5, 10]);
    }
  });

  it("plafonne le barème à 100 points", () => {
    expect(MAX_SCORE).toBe(100);
  });

  it("couvre 0-100 avec des paliers contigus sans trou ni chevauchement", () => {
    const sorted = [...VERDICT_TIERS].sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBe(100);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
  });
});

describe("computeScore", () => {
  it("renvoie 0 quand toutes les réponses sont au pire niveau", () => {
    expect(computeScore(allWorst)).toBe(0);
  });

  it("renvoie 100 quand toutes les réponses sont au meilleur niveau", () => {
    expect(computeScore(allBest)).toBe(100);
  });

  it("renvoie 50 pour un questionnaire entièrement médian", () => {
    expect(computeScore(allMedian)).toBe(50);
  });

  it("traite une question sans réponse comme 0 (défensif)", () => {
    const partial: ScoreAnswers = { ...allBest };
    const withoutOne = { ...partial };
    delete (withoutOne as Record<string, string>).q1;
    // 100 - 10 (q1 non répondue) = 90
    expect(computeScore(withoutOne)).toBe(90);
  });

  it("ignore une valeur d'option inconnue", () => {
    const tampered: ScoreAnswers = { ...allBest, q1: "valeur-bidon" };
    expect(computeScore(tampered)).toBe(90);
  });
});

describe("verdictFor", () => {
  it("classe les bornes de chaque palier", () => {
    expect(verdictFor(0).key).toBe("fondations");
    expect(verdictFor(40).key).toBe("fondations");
    expect(verdictFor(41).key).toBe("en-construction");
    expect(verdictFor(70).key).toBe("en-construction");
    expect(verdictFor(71).key).toBe("credible");
    expect(verdictFor(90).key).toBe("credible");
    expect(verdictFor(91).key).toBe("pret");
    expect(verdictFor(100).key).toBe("pret");
  });

  it("borne les scores hors plage", () => {
    expect(verdictFor(-20).key).toBe("fondations");
    expect(verdictFor(150).key).toBe("pret");
  });
});

describe("isComplete", () => {
  it("est vrai quand chaque question a une réponse valide", () => {
    expect(isComplete(allBest)).toBe(true);
  });

  it("est faux s'il manque une réponse", () => {
    const withoutOne = { ...allBest } as Record<string, string>;
    delete withoutOne.q5;
    expect(isComplete(withoutOne)).toBe(false);
  });

  it("est faux si une réponse est invalide", () => {
    expect(isComplete({ ...allBest, q3: "inconnu" })).toBe(false);
  });
});

describe("dimensionRatios", () => {
  it("renvoie 1 partout au meilleur niveau et 0 au pire", () => {
    const best = dimensionRatios(allBest);
    expect(Object.values(best).every((r) => r === 1)).toBe(true);
    const worst = dimensionRatios(allWorst);
    expect(Object.values(worst).every((r) => r === 0)).toBe(true);
  });

  it("calcule le ratio d'une dimension sur ses seules questions", () => {
    // Seule la dimension « comptes » (q1, q2) est mise au meilleur, le reste au pire.
    const answers = answersWith((id) =>
      id === "q1" || id === "q2" ? "c" : "a",
    );
    const ratios = dimensionRatios(answers);
    expect(ratios.comptes).toBe(1);
    expect(ratios.metriques).toBe(0);
  });
});

describe("recommendationsFor", () => {
  it("ne recommande rien quand tout est au meilleur niveau", () => {
    expect(recommendationsFor(allBest)).toHaveLength(0);
  });

  it("plafonne à 3 recommandations même si les 4 dimensions sont faibles", () => {
    const recos = recommendationsFor(allWorst);
    expect(recos).toHaveLength(3);
  });

  it("classe les dimensions de la plus faible à la moins faible", () => {
    // comptes au pire (0), tracabilite médian (0.5), reste au meilleur.
    const answers = answersWith((id) => {
      if (id === "q1" || id === "q2") return "a"; // comptes → 0
      if (id === "q6" || id === "q7") return "b"; // tracabilite → 0.5
      return "c";
    });
    const recos = recommendationsFor(answers);
    expect(recos.map((r) => r.key)).toEqual(["comptes", "tracabilite"]);
  });

  it("exclut une dimension au-dessus du seuil de faiblesse", () => {
    // metriques à 10/15 ≈ 0.67 (faible), le reste au meilleur.
    const answers = answersWith((id) => {
      if (id === "q3") return "a"; // 0
      if (id === "q4" || id === "q5") return "c"; // 10 + 10
      return "c";
    });
    const recos = recommendationsFor(answers);
    expect(recos.map((r) => r.key)).toContain("metriques");
    expect(recos.map((r) => r.key)).not.toContain("comptes");
  });
});

describe("evaluate", () => {
  it("agrège score, verdict et recommandations", () => {
    const result = evaluate(allWorst);
    expect(result.score).toBe(0);
    expect(result.verdict.key).toBe("fondations");
    expect(result.recommendations).toHaveLength(3);
  });

  it("donne un sans-faute cohérent", () => {
    const result = evaluate(allBest);
    expect(result.score).toBe(100);
    expect(result.verdict.key).toBe("pret");
    expect(result.recommendations).toHaveLength(0);
  });
});
