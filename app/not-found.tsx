import type { Metadata } from "next";
import Link from "next/link";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

/**
 * 404, « Écriture introuvable ».
 * Pour un studio dont le métier est de réconcilier la donnée, une page absente
 * n'est pas une impasse : c'est une ligne égarée dans le grand livre. Le « 0 »
 * du nombre devient l'unique point de lumière de la page (l'or reste rare).
 * Trois chemins restent ouverts : l'accueil, le Journal, et l'échange (en-tête).
 */
export default function NotFound() {
  return (
    <BookingProvider>
      <SiteHeader />
      <main>
        <Section
          as="section"
          width="reading"
          className="pt-24 text-center sm:pt-32"
        >
          <MonoLabel tone="or-dim" className="block">
            Erreur 404 · Écriture introuvable
          </MonoLabel>

          {/* Le nombre : 4, 0 (ouverture de lumière), 4 */}
          <div
            className="mt-10 flex items-center justify-center gap-1 sm:gap-3"
            aria-hidden="true"
          >
            <span className="nf-digit">4</span>
            <span className="nf-zero">
              <svg
                className="nf-ring"
                viewBox="0 0 100 100"
                fill="none"
                role="presentation"
              >
                {/* Anneau minéral (la matière sombre) */}
                <circle
                  className="nf-ring-track"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="2.5"
                />
                {/* Amorce d'or au sommet : la lumière qui accroche le bord */}
                <circle
                  className="nf-ring-arc"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="66 198"
                  transform="rotate(-135 50 50)"
                />
                {/* Le point de lumière */}
                <circle className="nf-ring-dot" cx="50" cy="8" r="3.2" />
              </svg>
            </span>
            <span className="nf-digit">4</span>
          </div>

          <h1 className="mt-12 font-serif text-3xl font-light leading-[1.15] text-blanc sm:text-4xl">
            Cette page ne se réconcilie pas.
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] font-serif text-[18px] leading-relaxed text-brume">
            L&apos;adresse demandée n&apos;existe pas, ou plus. Une donnée
            manquante, une ligne égarée dans le grand livre. Rien
            d&apos;irréparable&nbsp;: réconcilier ce qui ne colle pas,
            c&apos;est précisément notre métier.
          </p>

          {/* Chemins de sortie : jamais d'impasse */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="inline-block rounded-sm border border-or-dim/60 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-blanc transition-all hover:border-or"
            >
              Revenir à la lumière
            </Link>
            <Link
              href="/articles"
              className="inline-block rounded-sm border border-line px-6 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-brume transition-all hover:border-or-dim hover:text-blanc"
            >
              Parcourir le Journal
            </Link>
          </div>

          <Rule className="mx-auto mt-16 max-w-[260px]" />
          <p className="mx-auto mt-6 max-w-[46ch] font-serif text-[15px] italic leading-relaxed text-gris">
            Vos chiffres, eux, savent toujours où ils sont.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
