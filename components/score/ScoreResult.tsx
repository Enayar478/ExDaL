"use client";

import { useState } from "react";
import { ScoreDial } from "@/components/score/ScoreDial";
import { ScoreEmailForm } from "@/components/score/ScoreEmailForm";
import { BookingButton } from "@/components/booking/BookingButton";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import { SCORE_COPY } from "@/lib/score/content";
import type {
  ScoreAnswers,
  ScoreResult as ScoreResultData,
} from "@/lib/score/scoring";
import { site } from "@/lib/site";

/** Écran de résultat : score, verdict, recommandations et appels à l'action. */
export function ScoreResult({
  result,
  answers,
  onRestart,
}: {
  result: ScoreResultData;
  answers: ScoreAnswers;
  onRestart: () => void;
}) {
  const { score, verdict, recommendations } = result;

  return (
    <div className="flex flex-col items-center text-center">
      <MonoLabel tone="or-dim" className="block">
        Votre diagnostic
      </MonoLabel>

      <div className="mt-8">
        <ScoreDial score={score} label={SCORE_COPY.scoreOutOf} />
      </div>

      {/* Verdict */}
      <h2 className="mt-8 font-serif text-3xl font-light text-blanc sm:text-4xl">
        {verdict.title}
      </h2>
      <p className="mt-4 max-w-[46ch] font-serif text-[17px] leading-relaxed text-brume">
        {verdict.body}
      </p>

      {/* Recommandations prioritaires */}
      {recommendations.length > 0 && (
        <div className="mt-12 w-full max-w-[540px] text-left">
          <MonoLabel tone="gris" className="block">
            {SCORE_COPY.recommendationsTitle}
          </MonoLabel>
          <ul className="mt-5 flex flex-col gap-5">
            {recommendations.map((dimension) => (
              <li key={dimension.key} className="border-l border-line pl-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-or-dim">
                  {dimension.label}
                </p>
                <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-brume">
                  {dimension.recommendation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Rule className="mt-14 w-full max-w-[540px]" />

      {/* Appel à l'action principal : l'échange qualifié */}
      <p className="mt-12 max-w-[42ch] font-serif text-[17px] leading-relaxed text-blanc">
        {SCORE_COPY.resultLead}
      </p>
      <div className="mt-6">
        <BookingButton label={SCORE_COPY.primaryCta} />
      </div>

      {/* Capture email : le serveur recalcule le score et renvoie le plan par email */}
      <div className="mt-14 w-full max-w-[360px]">
        <p className="mb-3 font-serif text-[15px] italic text-brume">
          {SCORE_COPY.emailLead}
        </p>
        <ScoreEmailForm answers={answers} />
        <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-gris">
          En demandant votre plan, vous acceptez d&apos;être recontacté au sujet
          de ce diagnostic.{" "}
          <a
            href="/mentions-legales"
            className="underline transition-colors hover:text-brume"
          >
            Mentions légales
          </a>
          .
        </p>
      </div>

      {/* Partage + reprise */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <ShareButton score={score} />
        <button
          type="button"
          onClick={onRestart}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-gris transition-colors hover:text-brume"
        >
          {SCORE_COPY.restartCta}
        </button>
      </div>
    </div>
  );
}

/**
 * Partage natif (Web Share API) avec repli copie du lien.
 * Aucune donnée n'est envoyée à un tiers : on ne partage que l'URL publique.
 */
function ShareButton({ score }: { score: number }) {
  const [copied, setCopied] = useState(false);
  const url = `${site.url}/score`;

  async function handleShare() {
    const text = `${SCORE_COPY.shareText} ${score}/100`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: site.name, text, url });
        return;
      } catch {
        // Partage annulé par l'utilisateur — on ne fait rien.
        return;
      }
    }
    // Repli : copie du lien dans le presse-papiers.
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-brume transition-colors hover:border-or-dim hover:text-or"
    >
      {copied ? "Lien copié ✓" : SCORE_COPY.shareCta}
    </button>
  );
}
