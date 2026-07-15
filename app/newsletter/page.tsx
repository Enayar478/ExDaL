import type { Metadata } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui/Section";
import { Rule } from "@/components/ui/Rule";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { NewsletterForm } from "@/components/NewsletterForm";
import { LUMEN, NEWSLETTER_TEASER_FUTUR } from "@/lib/newsletters";

export const metadata: Metadata = {
  title: LUMEN.metaTitle,
  description: LUMEN.metaDescription,
  alternates: { canonical: "/newsletter" },
  openGraph: {
    type: "website",
    url: "/newsletter",
    title: `${LUMEN.metaTitle}`,
    description: LUMEN.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${LUMEN.metaTitle}`,
    description: LUMEN.metaDescription,
  },
};

/**
 * Page de présentation de la newsletter Lumen. Statique, référençable (SEO),
 * et prête à accueillir plus tard d'autres lettres thématiques (cf.
 * `lib/newsletters.ts`, catalogue extensible). L'inscription passe par le
 * même endpoint double opt-in que le reste du site.
 */
export default function NewsletterPage() {
  return (
    <BookingProvider>
      <SiteHeader />
      <main>
        <Section as="section" className="pt-28 sm:pt-36" width="reading">
          <MonoLabel tone="or-dim" className="block">
            {LUMEN.eyebrow}
          </MonoLabel>
          <h1 className="mt-6 font-serif text-4xl font-light leading-[1.1] text-blanc sm:text-5xl">
            {LUMEN.title}
          </h1>
          <p className="mt-6 max-w-[54ch] font-serif text-[18px] leading-relaxed text-brume">
            {LUMEN.lede}
          </p>

          {/* Inscription — la conversion, tout de suite après la promesse. */}
          <div className="mt-10 max-w-[420px]">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-or-dim">
              {LUMEN.ctaLabel}
            </p>
            <NewsletterForm source={LUMEN.source} />
            <p className="mt-3 font-serif text-sm italic text-gris">
              {LUMEN.cadence}
            </p>
          </div>

          <Rule className="my-14" />

          {/* Ce que vous recevez */}
          <MonoLabel tone="or-dim" className="block">
            Ce que vous recevez
          </MonoLabel>
          <dl className="mt-8 flex flex-col gap-8">
            {LUMEN.benefits.map((benefit) => (
              <div key={benefit.title}>
                <dt className="font-serif text-xl font-light text-blanc">
                  {benefit.title}
                </dt>
                <dd className="mt-2 max-w-[52ch] font-serif text-[17px] leading-relaxed text-brume">
                  {benefit.body}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-14 max-w-[52ch] font-serif text-[15px] italic text-gris">
            {NEWSLETTER_TEASER_FUTUR}
          </p>
        </Section>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
