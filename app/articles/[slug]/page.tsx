import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Section } from "@/components/ui/Section";
import { Rule } from "@/components/ui/Rule";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { ArticleHeader } from "@/components/articles/ArticleHeader";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleCta } from "@/components/articles/ArticleCta";
import { ArticleRelated } from "@/components/articles/ArticleRelated";
import { ArticleStructuredData } from "@/components/articles/ArticleStructuredData";
import {
  getArticleBySlug,
  getBuildableSlugs,
  getRelatedArticles,
} from "@/lib/articles/get-article";

/**
 * Revalidation ISR horaire = cœur du scheduler d'auto-publication : un article
 * programmé (publishedAt futur) reste en 404 jusqu'à sa date, puis bascule en
 * ligne à la première régénération suivant l'échéance, sans redéploiement.
 */
export const revalidate = 3600;

/** Pré-génère tous les slugs non-brouillons (y compris programmés). */
export function generateStaticParams() {
  return getBuildableSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article", robots: { index: false } };

  const canonical = `/articles/${article.slug}`;
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.metaDescription,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);

  return (
    <BookingProvider>
      <ArticleStructuredData article={article} />
      <ReadingProgress />
      <SiteHeader />
      <main>
        <Section as="section" className="pt-28 sm:pt-36" width="reading">
          <ArticleHeader article={article} />
          <Rule className="mt-10 mb-12" />
          <ArticleBody blocks={article.blocks} />
          <ArticleCta variant={article.ctaVariant} segment={article.segment} />
          <ArticleRelated related={related} />
        </Section>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
