"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { useBooking } from "@/components/booking/BookingProvider";
import { ScoreResult } from "@/components/score/ScoreResult";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { QUESTIONS, SCORE_COPY } from "@/lib/score/content";
import { evaluate, type ScoreAnswers } from "@/lib/score/scoring";

type Phase = "intro" | "quiz" | "result";

/**
 * Outil de diagnostic « Score de Préparation à la Cession ».
 * Machine à états : intro → questions (une par une, enchaînement auto) → résultat.
 * Aucun appel réseau tant que le dirigeant ne s'engage pas (booking ou email).
 */
export function ScoreTool() {
  const { selectSegment } = useBooking();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ScoreAnswers>({});

  // Le diagnostic cible l'opération (levée / cession) : on préaligne la modale
  // de qualification sur la porte « premium » / stade « cession ».
  useEffect(() => {
    selectSegment("premium");
  }, [selectSegment]);

  const result = useMemo(
    () => (phase === "result" ? evaluate(answers) : null),
    [phase, answers],
  );

  function restart() {
    setAnswers({});
    setIndex(0);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center text-center">
        <MonoLabel tone="or-dim" className="block">
          {SCORE_COPY.eyebrow}
        </MonoLabel>
        <h1 className="mt-6 max-w-[20ch] font-serif text-4xl font-light leading-[1.1] text-blanc sm:text-5xl">
          {SCORE_COPY.title}
        </h1>
        <p className="mt-6 max-w-[52ch] font-serif text-[18px] leading-relaxed text-brume">
          {SCORE_COPY.subtitle}
        </p>
        <button
          type="button"
          onClick={() => {
            setPhase("quiz");
            posthog.capture("score_started");
          }}
          className="mt-10 rounded-sm bg-or px-7 py-3.5 font-mono text-[13px] uppercase tracking-[0.1em] text-noir transition-opacity hover:opacity-90"
        >
          {SCORE_COPY.startCta}
        </button>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
          {SCORE_COPY.reassurance}
        </p>
      </div>
    );
  }

  if (phase === "quiz") {
    const question = QUESTIONS[index];
    const total = QUESTIONS.length;
    const answered = answers[question.id];

    function choose(value: string) {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      // Enchaînement automatique vers la question suivante (ou le résultat).
      window.setTimeout(() => {
        if (index + 1 < total) {
          setIndex(index + 1);
        } else {
          setPhase("result");
          posthog.capture("score_completed", {
            question_count: total,
          });
        }
      }, 240);
    }

    return (
      <div className="flex flex-col">
        {/* Progression */}
        <div className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <MonoLabel tone="gris">
              Question {index + 1} / {total}
            </MonoLabel>
            <MonoLabel tone="gris">
              {Math.round((index / total) * 100)} %
            </MonoLabel>
          </div>
          <div
            className="h-px w-full bg-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={index + 1}
          >
            <span
              className="block h-px bg-or transition-[width] duration-500 ease-out"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Intitulé */}
        <fieldset className="flex flex-col">
          <legend className="mb-8 font-serif text-2xl font-light leading-snug text-blanc sm:text-[28px]">
            {question.prompt}
          </legend>

          <div className="flex flex-col gap-3">
            {question.answers.map((answer) => {
              const selected = answered === answer.value;
              return (
                <label
                  key={answer.value}
                  className={`flex cursor-pointer select-none items-center border px-5 py-4 font-serif text-[16px] transition-colors ${
                    selected
                      ? "border-or-dim bg-noir-3 text-blanc"
                      : "border-line text-brume hover:border-gris"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={answer.value}
                    checked={selected}
                    onChange={() => choose(answer.value)}
                    className="sr-only"
                  />
                  {answer.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Retour */}
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            className="mt-8 self-start font-mono text-[11px] uppercase tracking-[0.14em] text-gris transition-colors hover:text-brume"
          >
            ← Précédent
          </button>
        )}
      </div>
    );
  }

  // phase === "result"
  return result ? (
    <ScoreResult result={result} answers={answers} onRestart={restart} />
  ) : null;
}
