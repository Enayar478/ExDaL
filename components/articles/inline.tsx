import type { ReactNode } from "react";

/**
 * Rendu inline SÛR d'un texte d'article : `[libellé](url)` → lien,
 * `**gras**` → emphase. Le texte vient de nos fichiers TS (source de confiance),
 * mais on le transforme en nœuds React — JAMAIS en HTML brut — et on n'autorise
 * que les URL http(s) ou internes (`/...`). Toute autre cible retombe en texte.
 */
const PATTERN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

function isSafeHref(href: string): boolean {
  return (
    /^https?:\/\//.test(href) || href.startsWith("/") || href.startsWith("#")
  );
}

/**
 * Un lien interne vers un article (`/articles/<slug>`) n'est rendu comme lien que
 * si l'article cible est publié. Sinon → texte simple. Le maillage se forge donc
 * à l'avance (cocon) sans jamais créer de lien mort : chaque lien s'active tout
 * seul quand sa cible sort (la revalidation ISR reconstruit la page). Les liens
 * externes et les liens internes hors-articles (ex. /score) passent toujours.
 */
function isBrokenArticleLink(
  href: string,
  publishedSlugs?: ReadonlySet<string>,
): boolean {
  const match = /^\/articles\/([^/#?]+)/.exec(href);
  if (!match) return false;
  return !publishedSlugs?.has(match[1]);
}

export function renderInline(
  text: string,
  publishedSlugs?: ReadonlySet<string>,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  // `PATTERN` a le flag /g : on réinitialise pour être réentrant.
  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, linkLabel, linkHref, bold] = match;
    if (linkLabel !== undefined && linkHref !== undefined) {
      if (
        isSafeHref(linkHref) &&
        !isBrokenArticleLink(linkHref, publishedSlugs)
      ) {
        const external = /^https?:\/\//.test(linkHref);
        nodes.push(
          <a
            key={key++}
            href={linkHref}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-brume underline decoration-line underline-offset-2 transition-colors hover:text-or hover:decoration-or-dim"
          >
            {linkLabel}
          </a>,
        );
      } else {
        // URL non autorisée : on garde le libellé en texte, sans lien.
        nodes.push(linkLabel);
      }
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-medium text-blanc">
          {bold}
        </strong>,
      );
    }

    lastIndex = PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}
