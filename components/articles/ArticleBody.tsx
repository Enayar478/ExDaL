import { renderInline } from "@/components/articles/inline";
import type { ArticleBlock } from "@/lib/articles/types";

/**
 * Rend les blocs d'un article dans la DA (clair-obscur, or rare).
 * Server Component : zéro JS envoyé. Discipline DA — l'or n'apparaît QUE sur le
 * bloc `stat` (un seul par article). Titres et emphase en blanc, corps en brume,
 * mono réservé aux micro-libellés (attribution de citation).
 */
export function ArticleBody({
  blocks,
  publishedSlugs,
}: {
  blocks: readonly ArticleBlock[];
  /** Slugs d'articles publiés — un lien vers un slug absent est rendu en texte. */
  publishedSlugs?: ReadonlySet<string>;
}) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => (
        <Block key={index} block={block} publishedSlugs={publishedSlugs} />
      ))}
    </div>
  );
}

function Block({
  block,
  publishedSlugs,
}: {
  block: ArticleBlock;
  publishedSlugs?: ReadonlySet<string>;
}) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-6 font-serif text-[17px] leading-[1.8] text-brume first:mt-0 sm:text-[18px]">
          {renderInline(block.text, publishedSlugs)}
        </p>
      );

    case "h2":
      return (
        <h2
          id={block.id}
          className="mt-14 mb-1 scroll-mt-24 font-serif text-2xl font-light text-blanc sm:text-[28px]"
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          id={block.id}
          className="mt-10 mb-1 scroll-mt-24 font-serif text-lg font-light text-blanc sm:text-xl"
        >
          {block.text}
        </h3>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className="mt-6 flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[0.55em] font-mono text-[11px] text-or-dim"
              >
                {block.ordered ? `${i + 1}.` : "—"}
              </span>
              <span className="font-serif text-[17px] leading-[1.7] text-brume sm:text-[18px]">
                {renderInline(item, publishedSlugs)}
              </span>
            </li>
          ))}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote className="mt-8 border-l border-line pl-6">
          <p className="font-serif text-xl italic leading-[1.6] text-blanc sm:text-2xl">
            {renderInline(block.text, publishedSlugs)}
          </p>
          {block.attribution && (
            <cite className="mt-3 block font-mono text-[11px] uppercase not-italic tracking-[0.14em] text-gris">
              {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "stat":
      // Le seul point d'or du corps — un chiffre d'ancrage par article.
      return (
        <div className="my-10 border-y border-line py-6 text-center">
          <div className="font-serif text-4xl font-light text-or sm:text-5xl">
            {block.value}
          </div>
          <div className="mx-auto mt-3 max-w-[42ch] font-serif text-[15px] leading-relaxed text-brume">
            {block.label}
          </div>
        </div>
      );
  }
}
