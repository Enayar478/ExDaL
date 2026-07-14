import { ARTICLES } from "@/lib/articles/registry";
import type { Article } from "@/lib/articles/types";

/**
 * Accès au registre d'articles + logique du scheduler d'auto-publication.
 * Fonctions pures : `now` est injectable pour des tests déterministes.
 *
 * Règles de visibilité :
 *   - `draft: true` → jamais visible, jamais construit (peut être commité sans risque).
 *   - `publishedAt` dans le futur → chemin connu (pré-généré) mais rendu en 404
 *     jusqu'à la date ; la revalidation ISR le bascule en ligne le moment venu.
 */

/** Un article est publié si non-brouillon ET sa date de publication est atteinte. */
export function isPublished(article: Article, now: Date = new Date()): boolean {
  if (article.draft) return false;
  return new Date(article.publishedAt).getTime() <= now.getTime();
}

/** Articles publiés, du plus récent au plus ancien. */
export function getPublishedArticles(now: Date = new Date()): Article[] {
  return ARTICLES.filter((article) => isPublished(article, now)).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Article publié par slug, ou `undefined` (inconnu, brouillon, ou pas encore publié). */
export function getArticleBySlug(
  slug: string,
  now: Date = new Date(),
): Article | undefined {
  const article = ARTICLES.find((candidate) => candidate.slug === slug);
  if (!article || !isPublished(article, now)) return undefined;
  return article;
}

/**
 * Slugs à pré-générer (`generateStaticParams`) : tous les non-brouillons, y
 * compris ceux programmés dans le futur, leurs chemins existent, la page les
 * garde en 404 jusqu'à `publishedAt`, puis la revalidation les ouvre.
 */
export function getBuildableSlugs(): string[] {
  return ARTICLES.filter((article) => !article.draft).map(
    (article) => article.slug,
  );
}

/** Articles liés (maillage interne), résolus depuis `relatedSlugs` et publiés. */
export function getRelatedArticles(
  article: Article,
  now: Date = new Date(),
): Article[] {
  if (!article.relatedSlugs?.length) return [];
  return article.relatedSlugs
    .map((slug) => getArticleBySlug(slug, now))
    .filter((related): related is Article => Boolean(related));
}
