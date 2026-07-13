import type { Metadata } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getPublishedArticles } from "@/lib/articles/get-article";

// Revalidation horaire : l'index révèle les articles programmés à leur échéance.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Data financière, Pennylane, préparation d'une levée ou d'une cession : nos articles pour lire ce que vos chiffres vous disent.",
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    url: "/articles",
    title: "Journal. ExDaL",
    description:
      "Data financière, Pennylane, préparation d'une levée ou d'une cession — nos articles de fond.",
  },
};

export default function ArticlesIndexPage() {
  const articles = getPublishedArticles();

  return (
    <BookingProvider>
      <SiteHeader />
      <main>
        <Section as="section" className="pt-28 sm:pt-36" width="reading">
          <MonoLabel tone="or-dim" className="block">
            Le journal
          </MonoLabel>
          <h1 className="mt-6 font-serif text-4xl font-light leading-[1.1] text-blanc sm:text-5xl">
            Ce que vos chiffres vous disent
          </h1>
          <p className="mt-6 max-w-[52ch] font-serif text-[18px] leading-relaxed text-brume">
            Des articles de fond sur la data financière, Pennylane et la
            préparation d&apos;une levée ou d&apos;une cession. Le savoir avant
            la mission.
          </p>

          {articles.length > 0 ? (
            <div className="mt-12">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="mt-12 font-serif text-[17px] italic text-gris">
              Les premiers articles arrivent bientôt.
            </p>
          )}
        </Section>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
