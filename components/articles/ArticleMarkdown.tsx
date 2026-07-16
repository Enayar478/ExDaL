import type { ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import { remarkStatDirective } from "@/lib/articles/markdown/remark-stat-directive";
import {
  isSafeHref,
  isExternalHref,
  isBrokenArticleLink,
} from "@/lib/articles/link-guard";

/**
 * Rend le corps Markdown d'un article dans la DA (clair-obscur, or rare).
 * Server Component : react-markdown parse en nœuds React, sans jamais exécuter
 * de code du contenu ni injecter de HTML brut. Zéro JS envoyé au navigateur.
 *
 * Discipline DA : l'or n'apparaît QUE sur le bloc `::stat` (un par article).
 * Titres/emphase en blanc, corps en brume. Les liens `/journal/<slug>` sont
 * auto-cicatrisants : rendus en texte tant que la cible n'est pas publiée.
 */
const remarkPlugins = [remarkDirective, remarkStatDirective];
const rehypePlugins = [rehypeSlug];

function Stat({ value, children }: { value?: string; children?: ReactNode }) {
  return (
    <div className="my-10 border-y border-line py-6 text-center">
      <div className="font-serif text-4xl font-light text-or sm:text-5xl">
        {value}
      </div>
      <div className="mx-auto mt-3 max-w-[42ch] font-serif text-[15px] leading-relaxed text-brume">
        {children}
      </div>
    </div>
  );
}

function ArticleLink({
  href,
  children,
  publishedSlugs,
}: {
  href?: string;
  children?: ReactNode;
  publishedSlugs?: ReadonlySet<string>;
}) {
  if (!href || !isSafeHref(href) || isBrokenArticleLink(href, publishedSlugs)) {
    return <>{children}</>;
  }
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-brume underline decoration-line underline-offset-2 transition-colors hover:text-or hover:decoration-or-dim"
    >
      {children}
    </a>
  );
}

export function ArticleMarkdown({
  body,
  publishedSlugs,
}: {
  body: string;
  /** Slugs d'articles publiés : un lien vers un slug absent est rendu en texte. */
  publishedSlugs?: ReadonlySet<string>;
}) {
  // Typé `Components` : les params des overrides sont contextuellement typés.
  const base: Components = {
    p: ({ node, ...props }) => (
      <p
        className="mt-6 font-serif text-[17px] leading-[1.8] text-brume first:mt-0 sm:text-[18px]"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="mt-14 mb-1 scroll-mt-24 font-serif text-2xl font-light text-blanc sm:text-[28px]"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="mt-10 mb-1 scroll-mt-24 font-serif text-lg font-light text-blanc sm:text-xl"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        className="mt-6 ml-5 list-disc space-y-3 marker:text-or-dim"
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className="mt-6 ml-5 list-decimal space-y-3 marker:text-or-dim"
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        className="pl-2 font-serif text-[17px] leading-[1.7] text-brume sm:text-[18px]"
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-medium text-blanc" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="mt-8 border-l border-line pl-6 font-serif text-xl italic leading-[1.6] text-blanc sm:text-2xl"
        {...props}
      />
    ),
    a: ({ node: _node, href, children }) => (
      <ArticleLink href={href} publishedSlugs={publishedSlugs}>
        {children}
      </ArticleLink>
    ),
  };

  // `stat` est un élément custom (issu de la directive `::stat`), hors du type
  // Components : react-markdown le rend à l'exécution, on l'ajoute par cast.
  const components = {
    ...base,
    stat: ({ value, children }: { value?: string; children?: ReactNode }) => (
      <Stat value={value}>{children}</Stat>
    ),
  } as Components;

  return (
    <div className="article-body">
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {body}
      </Markdown>
    </div>
  );
}
