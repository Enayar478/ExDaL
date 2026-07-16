import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";

/**
 * Estimation du temps de lecture, calculée depuis le corps Markdown. On parse
 * avec le vrai processeur (remark + remark-directive) puis on collecte le texte
 * en joignant chaque nœud par un espace (frontières de mots correctes ; les
 * attributs d'une directive `::stat` ne comptent pas, seul son label). 238
 * mots/minute = vitesse moyenne de lecture silencieuse (méta-analyse Brysbaert, 2019).
 */
const WORDS_PER_MINUTE = 238;

const processor = unified().use(remarkParse).use(remarkDirective);

interface MdNode {
  value?: string;
  children?: MdNode[];
}

function collectText(node: MdNode): string {
  if (typeof node.value === "string") return node.value;
  if (node.children) return node.children.map(collectText).join(" ");
  return "";
}

/** Nombre de mots du corps markdown (balisage retiré). */
export function countWords(body: string): number {
  const tree = processor.parse(body) as unknown as MdNode;
  return collectText(tree).trim().split(/\s+/).filter(Boolean).length;
}

/** Temps de lecture estimé, en minutes (minimum 1). */
export function estimateReadingMinutes(body: string): number {
  return Math.max(1, Math.round(countWords(body) / WORDS_PER_MINUTE));
}
