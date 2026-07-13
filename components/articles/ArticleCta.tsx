"use client";

import Link from "next/link";
import { useBooking } from "@/components/booking/BookingProvider";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import type { Segment } from "@/lib/validation/lead";

/**
 * CTA de fin d'article — alimente le tunnel existant, sans nouvelle route ni
 * provider. `qualification` ouvre le formulaire (en pré-remplissant la porte si
 * l'article cible un segment) ; `score` renvoie vers le lead magnet /score.
 */
export function ArticleCta({
  variant,
  segment,
}: {
  variant: "qualification" | "score";
  segment?: Segment;
}) {
  const { open, selectSegment } = useBooking();

  function handleQualification() {
    if (segment) selectSegment(segment);
    open();
  }

  return (
    <aside className="mt-16">
      <Rule className="mb-10" />
      <MonoLabel tone="or-dim" className="block">
        Aller plus loin
      </MonoLabel>

      {variant === "qualification" ? (
        <>
          <p className="mt-4 max-w-[46ch] font-serif text-[17px] leading-relaxed text-blanc">
            Vingt minutes suffisent pour identifier ce qui, chez vous, mérite
            d&apos;être connecté en priorité.
          </p>
          <button
            type="button"
            onClick={handleQualification}
            className="mt-6 rounded-sm bg-or px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-noir transition-opacity hover:opacity-90"
          >
            Échanger sur votre situation
          </button>
        </>
      ) : (
        <>
          <p className="mt-4 max-w-[46ch] font-serif text-[17px] leading-relaxed text-blanc">
            Avant d&apos;en parler, mesurez où vous en êtes : dix questions, un
            score, un plan.
          </p>
          <Link
            href="/score"
            className="mt-6 inline-block rounded-sm border border-line px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-blanc transition-colors hover:border-or-dim hover:text-or"
          >
            Faire le diagnostic
          </Link>
        </>
      )}
    </aside>
  );
}
