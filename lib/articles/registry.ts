import type { Article } from "@/lib/articles/types";
import { connecterPennylaneTableauDeBord } from "@/lib/articles/content/connecter-pennylane-tableau-de-bord";

/**
 * Source unique des articles piliers. Chaque article vit dans son propre fichier
 * sous `content/` et s'ajoute ici. L'ordre n'importe pas : le tri se fait par
 * date de publication (voir `get-article.ts`).
 *
 * Cocon sémantique : relier les articles entre eux via `relatedSlugs` à mesure
 * que la toile se construit (pilier ↔ satellites autour des 3 portes du tunnel).
 */
export const ARTICLES: readonly Article[] = [connecterPennylaneTableauDeBord];
