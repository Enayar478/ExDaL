import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/json-ld";
import type { Article } from "@/lib/articles/types";

/** JSON-LD schema.org `BlogPosting` pour un article. Contenu contrôlé (statique). */
export function ArticleStructuredData({ article }: { article: Article }) {
  const url = `${site.url}/journal/${article.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "fr-FR",
    author: { "@type": "Organization", name: site.legalName, url: site.url },
    publisher: { "@type": "Organization", name: site.legalName, url: site.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  return (
    <script
      type="application/ld+json"
      // Sérialisation durcie : `<`, `>`, `&` échappés pour empêcher toute évasion
      // de la balise <script> (défense en profondeur, même si le contenu est maîtrisé).
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
