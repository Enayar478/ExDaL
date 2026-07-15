import { describe, it, expect } from "vitest";
import { ARTICLES } from "@/lib/articles/registry";
import type { Article } from "@/lib/articles/types";
import {
  isPublished,
  getPublishedArticles,
  getArticleBySlug,
  getBuildableSlugs,
  getRelatedArticles,
} from "@/lib/articles/get-article";
import {
  countWords,
  estimateReadingMinutes,
} from "@/lib/articles/reading-time";
import { renderInline } from "@/components/articles/inline";
import { isValidElement } from "react";

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

  it("les relatedSlugs ne contiennent jamais le slug de l'article lui-même", () => {
    for (const article of ARTICLES) {
      expect(article.relatedSlugs ?? []).not.toContain(article.slug);
    }
  });
});

describe("getRelatedArticles (maillage du cocon)", () => {
  const cornerstone = ARTICLES.find(
    (a) => a.slug === "connecter-pennylane-tableau-de-bord",
  )!;
  const target = ARTICLES.find(
    (a) => a.slug === "preparer-chiffres-levee-cession",
  )!;
  const allPublished = new Date("2099-01-01");

  it("résout les relatedSlugs publiés à `now`", () => {
    expect(
      getRelatedArticles(cornerstone, allPublished).map((a) => a.slug),
    ).toEqual(["preparer-chiffres-levee-cession"]);
  });

  it("filtre les slugs forward-déclarés absents du registre (pas de lien mort)", () => {
    const cabinets = ARTICLES.find(
      (a) => a.slug === "pennylane-cabinets-automatiser-sans-perdre-controle",
    )!;
    // 4 relatedSlugs déclarés, un seul existe réellement pour l'instant.
    expect(
      getRelatedArticles(cabinets, allPublished).map((a) => a.slug),
    ).toEqual(["connecter-pennylane-tableau-de-bord"]);
  });

  it("n'expose aucun lié tant que sa date de publication n'est pas atteinte", () => {
    const before = new Date(
      new Date(target.publishedAt).getTime() - 86_400_000,
    );
    expect(getRelatedArticles(cornerstone, before)).toEqual([]);
  });

  it("renvoie un tableau vide si l'article n'a pas de relatedSlugs", () => {
    expect(getRelatedArticles(makeArticle())).toEqual([]);
  });
});

describe("estimateReadingMinutes", () => {
  it("compte les mots des paragraphes, listes et stats", () => {
    const words = countWords([
      { type: "p", text: "un deux trois" },
      { type: "list", items: ["quatre cinq", "six"] },
      { type: "stat", value: "sept", label: "huit neuf dix" },
    ]);
    expect(words).toBe(10);
  });

  it("retire le balisage inline du décompte", () => {
    expect(
      countWords([
        { type: "p", text: "voir la [documentation](https://x.fr) **ici**" },
      ]),
    ).toBe(4); // voir / la / documentation / ici
  });

  it("renvoie au moins 1 minute", () => {
    expect(estimateReadingMinutes([{ type: "p", text: "court" }])).toBe(1);
  });

  it("estime un temps cohérent pour un article réel", () => {
    const minutes = estimateReadingMinutes(ARTICLES[0].blocks);
    expect(minutes).toBeGreaterThanOrEqual(6);
    expect(minutes).toBeLessThanOrEqual(9);
  });
});

describe("renderInline, liens auto-cicatrisants du cocon", () => {
  it("rend un lien vers un article PUBLIÉ", () => {
    const nodes = renderInline(
      "voir [le guide](/articles/foo)",
      new Set(["foo"]),
    );
    const link = nodes.find(isValidElement) as {
      type?: string;
      props?: { href?: string };
    };
    expect(link?.type).toBe("a");
    expect(link?.props?.href).toBe("/articles/foo");
  });

  it("rend en TEXTE simple un lien vers un article non publié (pas de lien mort)", () => {
    const nodes = renderInline("voir [le guide](/articles/foo)", new Set());
    expect(nodes.some(isValidElement)).toBe(false);
    expect(nodes.join("")).toBe("voir le guide");
  });

  it("laisse toujours passer les liens internes hors-articles (ex. /score)", () => {
    const nodes = renderInline("faites le [test](/score)", new Set());
    const link = nodes.find(isValidElement) as { props?: { href?: string } };
    expect(link?.props?.href).toBe("/score");
  });

  it("laisse toujours passer les liens externes", () => {
    const nodes = renderInline("voir [la doc](https://x.fr)", new Set());
    const link = nodes.find(isValidElement) as { props?: { target?: string } };
    expect(link?.props?.target).toBe("_blank");
  });
});

describe("isPublished (scheduler)", () => {
  const now = new Date("2026-06-15T12:00:00Z");

  it("publie un article dont la date est passée", () => {
    expect(isPublished(makeArticle({ publishedAt: "2026-06-01" }), now)).toBe(
      true,
    );
  });

  it("masque un article programmé dans le futur", () => {
    expect(isPublished(makeArticle({ publishedAt: "2026-12-01" }), now)).toBe(
      false,
    );
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
  const dayBefore = new Date(
    new Date(article.publishedAt).getTime() - 86_400_000,
  );
  const dayAfter = new Date(
    new Date(article.publishedAt).getTime() + 86_400_000,
  );

  it("exclut l'article tant que sa date n'est pas atteinte", () => {
    expect(getArticleBySlug(article.slug, dayBefore)).toBeUndefined();
    expect(getPublishedArticles(dayBefore)).not.toContainEqual(article);
  });

  it("expose l'article une fois la date atteinte", () => {
    expect(getArticleBySlug(article.slug, dayAfter)?.slug).toBe(article.slug);
    expect(getPublishedArticles(dayAfter).map((a) => a.slug)).toContain(
      article.slug,
    );
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
