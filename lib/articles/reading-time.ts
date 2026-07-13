import type { ArticleBlock } from "@/lib/articles/types";

/**
 * Estimation du temps de lecture — calculée depuis le contenu, jamais saisie à la
 * main. 238 mots/minute = vitesse moyenne de lecture silencieuse d'un adulte
 * (méta-analyse Brysbaert, 2019), rate raisonnable pour de la prose non-fiction.
 */
const WORDS_PER_MINUTE = 238;

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
      return block.text;
    case "quote":
      return `${block.text} ${block.attribution ?? ""}`;
    case "list":
      return block.items.join(" ");
    case "stat":
      return `${block.value} ${block.label}`;
  }
}

/** Nombre de mots d'un article (balisage inline `[lien]`/`**gras**` retiré). */
export function countWords(blocks: readonly ArticleBlock[]): number {
  const text = blocks
    .map(blockText)
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Temps de lecture estimé, en minutes (minimum 1). */
export function estimateReadingMinutes(blocks: readonly ArticleBlock[]): number {
  return Math.max(1, Math.round(countWords(blocks) / WORDS_PER_MINUTE));
}
