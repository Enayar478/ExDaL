import type { Segment } from "@/lib/validation/lead";

/**
 * Système d'articles piliers — contenu-comme-données typé (pas de MDX).
 * Un article = un objet `Article` immuable ; le rendu (DA) vit dans les
 * composants `components/articles/*`, jamais dans la donnée. Réplique le pattern
 * de `lib/score/content.ts`.
 *
 * Le texte des blocs `p`/`list` accepte un balisage inline minimal et SÛR
 * (interprété en nœuds React, jamais en HTML brut) : `[libellé](url)` pour un
 * lien, `**gras**` pour l'emphase. Voir `components/articles/inline.tsx`.
 */

export type ArticleBlock =
  | { readonly type: "p"; readonly text: string }
  | { readonly type: "h2"; readonly id: string; readonly text: string }
  | { readonly type: "h3"; readonly id: string; readonly text: string }
  | {
      readonly type: "list";
      readonly items: readonly string[];
      readonly ordered?: boolean;
    }
  | {
      readonly type: "quote";
      readonly text: string;
      readonly attribution?: string;
    }
  | { readonly type: "stat"; readonly value: string; readonly label: string };

export interface Article {
  /** Identifiant d'URL, kebab-case. Unique (vérifié par test). */
  readonly slug: string;
  /** Titre H1 / OG. */
  readonly title: string;
  /** Balise <title> SEO (≤ 60 car.). */
  readonly metaTitle: string;
  /** Meta description SEO (≤ 160 car.). */
  readonly metaDescription: string;
  /** Teaser (carte d'index + fallback description OG). */
  readonly excerpt: string;
  /** Sur-titre mono (ex. « Pilotage Pennylane »). */
  readonly eyebrow: string;
  /** Porte du tunnel visée — pré-remplit la qualification depuis le CTA. */
  readonly segment?: Segment;
  /**
   * Date de publication programmée (ISO 8601). L'article n'est visible
   * (index, sitemap, page) qu'une fois cette date atteinte — c'est le
   * cœur du scheduler d'auto-publication échelonnée.
   */
  readonly publishedAt: string;
  /** Dernière modification (ISO 8601), pour le JSON-LD. */
  readonly updatedAt?: string;
  /** Brouillon : jamais construit ni exposé, même si publishedAt est passé. */
  readonly draft?: boolean;
  /** Maillage interne : slugs d'articles liés (cocon sémantique). */
  readonly relatedSlugs?: readonly string[];
  /** CTA de fin d'article : qualification directe ou détour par /score. */
  readonly ctaVariant: "qualification" | "score";
  readonly blocks: readonly ArticleBlock[];
}
