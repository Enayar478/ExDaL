import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getPublishedArticles } from "@/lib/articles/get-article";

// Revalidation horaire : le sitemap suit le scheduler (articles programmés
// ajoutés à leur date de publication, sans redéploiement).
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getPublishedArticles().map((article) => ({
    url: `${site.url}/journal/${article.slug}`,
    lastModified: article.updatedAt ?? article.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: site.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/tunnel`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/score`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/journal`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${site.url}/newsletter`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...articles,
  ];
}
