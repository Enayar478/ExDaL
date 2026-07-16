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
import {
  isSafeHref,
  isExternalHref,
  isBrokenArticleLink,
} from "@/lib/articles/link-guard";
import { articleSchema } from "@/lib/articles/schema";
import { remarkStatDirective } from "@/lib/articles/markdown/remark-stat-directive";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

/** Frontmatter minimal valide, surchargé pour exercer chaque règle du schéma. */
function validFrontmatter(overrides: Record<string, unknown> = {}) {
  return {
    slug: "un-slug-valide",
    title: "Titre",
    metaTitle: "Meta titre",
    metaDescription: "Une description de meta correcte.",
    excerpt: "Un extrait.",
    eyebrow: "Rubrique",
    publishedAt: "2026-01-01",
    ctaVariant: "qualification",
    body: "Contenu.",
    ...overrides,
  };
}

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
    body: "Contenu de test.",
    ...overrides,
  };
}

describe("intégrité du registre d'articles (Markdown)", () => {
  it("charge et parse tous les fichiers .md du dossier content", () => {
    expect(ARTICLES.length).toBeGreaterThan(0);
  });

  it("garantit des slugs uniques et en kebab-case", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("respecte les bornes SEO et a un corps non vide", () => {
    for (const article of ARTICLES) {
      expect(article.metaTitle.length).toBeLessThanOrEqual(60);
      expect(article.metaDescription.length).toBeLessThanOrEqual(160);
      expect(article.body.trim().length).toBeGreaterThan(0);
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

  it("garde un seul chiffre d'ancrage (::stat) par article", () => {
    for (const article of ARTICLES) {
      const count = article.body.match(/::stat\[/g)?.length ?? 0;
      expect(count).toBeLessThanOrEqual(1);
    }
  });
});

describe("getRelatedArticles (maillage du cocon)", () => {
  const cornerstone = ARTICLES.find(
    (a) => a.slug === "connecter-pennylane-tableau-de-bord",
  )!;
  const allPublished = new Date("2099-01-01");

  it("résout tous les relatedSlugs publiés, dans l'ordre déclaré", () => {
    expect(
      getRelatedArticles(cornerstone, allPublished).map((a) => a.slug),
    ).toEqual([
      "reconcilier-pennylane-crm-paiements",
      "suivre-tresorerie-previsionnelle-pennylane",
      "calculer-bfr-pennylane",
      "automatiser-reporting-mensuel-pme",
      "preparer-chiffres-levee-cession",
    ]);
  });

  it("n'expose QUE les liés déjà publiés à `now` (auto-cicatrisation par date)", () => {
    const slugs = getRelatedArticles(cornerstone, new Date("2026-08-15")).map(
      (a) => a.slug,
    );
    expect(slugs).toEqual([
      "reconcilier-pennylane-crm-paiements",
      "preparer-chiffres-levee-cession",
    ]);
    expect(slugs).not.toContain("calculer-bfr-pennylane");
  });

  it("ne renvoie rien tant qu'aucun lié n'est encore publié", () => {
    expect(getRelatedArticles(cornerstone, new Date("2026-07-15"))).toEqual([]);
  });

  it("ignore un slug absent du registre (jamais de lien mort)", () => {
    const ghost = makeArticle({ relatedSlugs: ["slug-inexistant"] });
    expect(getRelatedArticles(ghost, allPublished)).toEqual([]);
  });

  it("renvoie un tableau vide si l'article n'a pas de relatedSlugs", () => {
    expect(getRelatedArticles(makeArticle())).toEqual([]);
  });
});

describe("estimateReadingMinutes (corps markdown)", () => {
  it("compte les mots de la prose, des titres et des listes", () => {
    expect(countWords("## Titre\n\nun deux trois")).toBe(4);
    expect(countWords("- quatre cinq\n- six")).toBe(3);
  });

  it("retire le balisage inline et l'attribut d'un ::stat", () => {
    expect(countWords("voir la [documentation](https://x.fr) **ici**")).toBe(4);
    // Le label du stat (contenu) compte, la valeur (attribut) ne compte pas.
    expect(countWords('::stat[huit neuf]{value="sept"}')).toBe(2);
  });

  it("renvoie au moins 1 minute", () => {
    expect(estimateReadingMinutes("court")).toBe(1);
  });

  it("estime un temps cohérent pour un article réel", () => {
    const minutes = estimateReadingMinutes(ARTICLES[0].body);
    expect(minutes).toBeGreaterThanOrEqual(5);
    expect(minutes).toBeLessThanOrEqual(12);
  });
});

describe("link-guard (liens auto-cicatrisants du cocon)", () => {
  it("n'autorise que http(s), interne (/...) ou ancre (#...)", () => {
    expect(isSafeHref("https://x.fr")).toBe(true);
    expect(isSafeHref("/articles/foo")).toBe(true);
    expect(isSafeHref("#section")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("mailto:a@b.fr")).toBe(false);
  });

  it("distingue les liens externes", () => {
    expect(isExternalHref("https://x.fr")).toBe(true);
    expect(isExternalHref("/articles/foo")).toBe(false);
  });

  it("marque comme cassé un lien vers un article non publié ou inconnu", () => {
    expect(isBrokenArticleLink("/journal/foo", new Set(["foo"]))).toBe(false);
    expect(isBrokenArticleLink("/journal/foo", new Set())).toBe(true);
    expect(isBrokenArticleLink("/journal/foo", undefined)).toBe(true);
  });

  it("ne touche pas aux liens hors-articles (ex. /score, externes)", () => {
    expect(isBrokenArticleLink("/score", new Set())).toBe(false);
    expect(isBrokenArticleLink("https://x.fr", new Set())).toBe(false);
  });

  it("rejette les URL protocol-relative (//evil.com) comme non sûres", () => {
    expect(isSafeHref("//evil.com/x")).toBe(false);
    expect(isExternalHref("//evil.com/x")).toBe(false);
    // Un lien interne normal reste sûr.
    expect(isSafeHref("/journal/foo")).toBe(true);
  });

  it("gate correctement un lien article suivi d'une ancre ou d'un query", () => {
    const published = new Set(["foo"]);
    expect(isBrokenArticleLink("/journal/foo#section", published)).toBe(false);
    expect(isBrokenArticleLink("/journal/foo?utm=x", published)).toBe(false);
    expect(isBrokenArticleLink("/journal/inconnu#section", published)).toBe(
      true,
    );
  });
});

describe("articleSchema (validation frontmatter, fail-fast)", () => {
  it("accepte un frontmatter complet et valide", () => {
    expect(articleSchema.safeParse(validFrontmatter()).success).toBe(true);
  });

  it("rejette un slug hors kebab-case et pointe le bon champ", () => {
    const result = articleSchema.safeParse(
      validFrontmatter({ slug: "Slug_Invalide" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("slug");
    }
  });

  it("rejette un metaTitle de plus de 60 caractères", () => {
    expect(
      articleSchema.safeParse(validFrontmatter({ metaTitle: "x".repeat(61) }))
        .success,
    ).toBe(false);
  });

  it("rejette une metaDescription de plus de 160 caractères", () => {
    expect(
      articleSchema.safeParse(
        validFrontmatter({ metaDescription: "x".repeat(161) }),
      ).success,
    ).toBe(false);
  });

  it("rejette un ctaVariant hors enum", () => {
    expect(
      articleSchema.safeParse(validFrontmatter({ ctaVariant: "autre" }))
        .success,
    ).toBe(false);
  });

  it("rejette une date de publication non ISO", () => {
    expect(
      articleSchema.safeParse(validFrontmatter({ publishedAt: "pas-une-date" }))
        .success,
    ).toBe(false);
  });

  it("rejette un corps vide (ou uniquement des espaces après trim)", () => {
    expect(
      articleSchema.safeParse(validFrontmatter({ body: "" })).success,
    ).toBe(false);
  });
});

describe("remark-stat-directive (bloc ::stat, unique point d'or)", () => {
  function statNodeOf(markdown: string) {
    const tree = unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkStatDirective)
      .parse(markdown);
    unified().use(remarkStatDirective).runSync(tree);
    let found:
      { hName?: string; hProperties?: Record<string, unknown> } | undefined;
    visit(tree, (node) => {
      const data = (node as { data?: { hName?: string } }).data;
      if (data?.hName === "stat") {
        found = data;
      }
    });
    return found;
  }

  it("transforme ::stat[label]{value} en noeud stat avec la valeur en attribut", () => {
    const data = statNodeOf('::stat[38 000 €]{value="38 000 €"}');
    expect(data?.hName).toBe("stat");
    expect(data?.hProperties?.value).toBe("38 000 €");
  });

  it("rend une valeur vide sans planter si l'attribut value manque", () => {
    const data = statNodeOf("::stat[Un label sans valeur]");
    expect(data?.hName).toBe("stat");
    expect(data?.hProperties?.value).toBe("");
  });

  it("ignore les directives dont le nom n'est pas stat", () => {
    expect(statNodeOf('::autre[x]{value="1"}')).toBeUndefined();
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
