import type { Segment } from "@/lib/validation/lead";

/**
 * Système d'articles piliers, contenu en Markdown + frontmatter.
 *
 * Un article vit dans `content/articles/<slug>.md` : un en-tête YAML (frontmatter)
 * porte les métadonnées structurées, le corps est du Markdown pur. Le rendu (DA)
 * se fait par `components/articles/ArticleMarkdown` via react-markdown, sans
 * jamais exécuter de code du contenu (pas de MDX, pas de HTML brut interprété).
 *
 * Balisage du corps : Markdown standard (titres, listes, `[lien](url)`, `**gras**`)
 * plus une seule directive maison pour le chiffre d'ancrage en or :
 *   ::stat{value="38 000 €" label="de créances échues, révélées à la réconciliation."}
 */
export interface Article {
  /** Identifiant d'URL, kebab-case. Dérivé du nom de fichier. */
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
  /** Porte du tunnel visée, pré-remplit la qualification depuis le CTA. */
  readonly segment?: Segment;
  /**
   * Date de publication programmée (ISO 8601). L'article n'est visible qu'une
   * fois cette date atteinte : c'est le cœur du scheduler d'auto-publication.
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
  /** Corps de l'article en Markdown brut. */
  readonly body: string;
}
