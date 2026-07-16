/**
 * Garde des liens internes du cocon (fonctions pures, testables sans React).
 *
 * On n'autorise que les URL http(s), internes (`/...`) ou ancres (`#...`).
 * Un lien vers un article (`/journal/<slug>`) n'est un vrai lien que si l'article
 * cible est publié : sinon il retombe en texte simple. Le maillage se forge donc
 * à l'avance (cocon) sans jamais créer de lien mort ; chaque lien s'active seul
 * quand sa cible sort (la revalidation ISR reconstruit la page).
 */

export function isSafeHref(href: string): boolean {
  return (
    /^https?:\/\//.test(href) ||
    // Interne uniquement : `//evil.com` (protocol-relative) est exclu car il
    // navigue en réalité vers un domaine externe sans passer par isExternalHref.
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith("#")
  );
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** Vrai si le lien vise un article non publié (ou inconnu) : à rendre en texte. */
export function isBrokenArticleLink(
  href: string,
  publishedSlugs?: ReadonlySet<string>,
): boolean {
  const match = /^\/journal\/([^/#?]+)/.exec(href);
  if (!match) return false;
  return !publishedSlugs?.has(match[1]);
}
