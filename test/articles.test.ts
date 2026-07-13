import { describe, it, expect } from "vitest";
import { ARTICLES } from "@/lib/articles/registry";
import type { Article } from "@/lib/articles/types";
import {
  isPublished,
  getPublishedArticles,
  getArticleBySlug,
  getBuildableSlugs,
} from "@/lib/articles/get-article";

/** Fabrique un article minimal valide, surchargeable pour les cas de test. */
function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "test-article",
    title: "Titre de test",
    metaTitle: "Titre de test",
    metaDescription: "Description de test.",
    excerpt: "Extrait de test.",
    eyebrow: "Test",
    publishedAt: "2026-01-01",
    readingMinutes: 5,
    ctaVariant: "qualification",
    blocks: [{ type: "p", text: "Contenu." }],
    ...overrides,
  };
}

describe("intégrité du registre d'articles", () => {
  it("expose au moins un article", () => {
    expect(ARTICLES.length).toBeGreaterThan(0);
  });

  it("garantit des slugs uniques et en kebab-case", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("respecte les bornes SEO (title ≤ 60, description ≤ 160)", () => {
    for (const article of ARTICLES) {
      expect(article.metaTitle.length).toBeLessThanOrEqual(60);
      expect(article.metaDescription.length).toBeLessThanOrEqual(160);
      expect(article.blocks.length).toBeGreaterThan(0);
    }
  });

  it("attribue des identifiants d'ancre uniques par article", () => {
    for (const article of ARTICLES) {
      const ids = article.blocks
        .filter((b): b is Extract<typeof b, { id: string }> => "id" in b)
        .map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("n'a que des dates de publication valides", () => {
    for (const article of ARTICLES) {
      expect(Number.isNaN(new Date(article.publishedAt).getTime())).toBe(false);
    }
  });
});

describe("isPublished (scheduler)", () => {
  const now = new Date("2026-06-15T12:00:00Z");

  it("publie un article dont la date est passée", () => {
    expect(isPublished(makeArticle({ publishedAt: "2026-06-01" }), now)).toBe(true);
  });

  it("masque un article programmé dans le futur", () => {
    expect(isPublished(makeArticle({ publishedAt: "2026-12-01" }), now)).toBe(false);
  });

  it("masque un brouillon même si sa date est passée", () => {
    expect(
      isPublished(makeArticle({ publishedAt: "2026-01-01", draft: true }), now),
    ).toBe(false);
  });

  it("publie pile à l'instant de la date de publication", () => {
    const exact = new Date("2026-06-15T12:00:00Z");
    expect(
      isPublished(makeArticle({ publishedAt: "2026-06-15T12:00:00Z" }), exact),
    ).toBe(true);
  });
});

describe("accès au registre avec now injecté", () => {
  const article = ARTICLES[0];
  const dayBefore = new Date(new Date(article.publishedAt).getTime() - 86_400_000);
  const dayAfter = new Date(new Date(article.publishedAt).getTime() + 86_400_000);

  it("exclut l'article tant que sa date n'est pas atteinte", () => {
    expect(getArticleBySlug(article.slug, dayBefore)).toBeUndefined();
    expect(getPublishedArticles(dayBefore)).not.toContainEqual(article);
  });

  it("expose l'article une fois la date atteinte", () => {
    expect(getArticleBySlug(article.slug, dayAfter)?.slug).toBe(article.slug);
    expect(getPublishedArticles(dayAfter).map((a) => a.slug)).toContain(article.slug);
  });

  it("renvoie undefined pour un slug inconnu", () => {
    expect(getArticleBySlug("slug-qui-nexiste-pas", dayAfter)).toBeUndefined();
  });

  it("trie les articles publiés du plus récent au plus ancien", () => {
    const dates = getPublishedArticles(dayAfter).map((a) =>
      new Date(a.publishedAt).getTime(),
    );
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  it("getBuildableSlugs inclut les non-brouillons (y compris programmés)", () => {
    const slugs = getBuildableSlugs();
    expect(slugs).toContain(article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
