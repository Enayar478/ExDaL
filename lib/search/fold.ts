/**
 * Logique pure de la recherche du Journal — extraite du composant pour être
 * testable sous vitest (environnement node, aucun DOM) et comptée dans la
 * couverture (`lib/**`). Le composant `ManifestoSearch` n'en est que l'UI.
 */

export interface SearchItem {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly eyebrow: string;
}

/** Normalise pour une recherche insensible à la casse et aux accents. */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filtre les items dont le titre, le teaser ou le sur-titre contiennent la
 * requête (comparaison « foldée » : casse et accents ignorés). Requête vide
 * ou blanche → aucun résultat (l'UI affiche alors une invite).
 */
export function filterSearchItems<T extends SearchItem>(
  items: readonly T[],
  query: string,
): T[] {
  const q = fold(query.trim());
  if (!q) return [];
  return items.filter((it) =>
    fold(`${it.title} ${it.excerpt} ${it.eyebrow}`).includes(q),
  );
}
