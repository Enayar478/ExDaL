import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui/Section";
import { Rule } from "@/components/ui/Rule";
import { ArticleHeader } from "@/components/articles/ArticleHeader";
import { ArticleMarkdown } from "@/components/articles/ArticleMarkdown";
import { ArticleCta } from "@/components/articles/ArticleCta";
import { ArticleRelated } from "@/components/articles/ArticleRelated";
import {
  getArticleForPreview,
  getPublishedArticles,
  getRelatedArticles,
} from "@/lib/articles/get-article";

// Preview interne : jamais statique, jamais indexé, hors du scheduler.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Aperçu",
  robots: { index: false, follow: false },
};

function statusLabel(article: {
  draft?: boolean;
  publishedAt: string;
}): string {
  if (article.draft) return "Brouillon";
  const published = new Date(article.publishedAt).getTime() <= Date.now();
  if (published) return "Publié";
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(article.publishedAt));
  return `Programmé le ${date}`;
}

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleForPreview(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);
  const publishedSlugs = new Set(getPublishedArticles().map((a) => a.slug));

  return (
    <BookingProvider>
      <div className="sticky top-0 z-50 flex items-center justify-center gap-4 border-b border-or-dim/40 bg-noir-2/95 px-6 py-3 text-center backdrop-blur">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-or-dim">
          Aperçu interne · {statusLabel(article)}
        </span>
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-brume underline underline-offset-4 transition-colors hover:text-or-dim"
        >
          Retour au panneau
        </Link>
      </div>

      <SiteHeader />
      <main>
        <Section as="section" className="pt-16 sm:pt-20" width="reading">
          <ArticleHeader article={article} />
          <Rule className="mt-10 mb-12" />
          <ArticleMarkdown body={article.body} publishedSlugs={publishedSlugs} />
          <ArticleCta variant={article.ctaVariant} segment={article.segment} />
          <ArticleRelated related={related} />
        </Section>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
