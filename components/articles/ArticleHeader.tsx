import { MonoLabel } from "@/components/ui/MonoLabel";
import { formatArticleDate } from "@/lib/articles/format";
import { estimateReadingMinutes } from "@/lib/articles/reading-time";
import type { Article } from "@/lib/articles/types";

/** En-tête d'article : sur-titre mono, H1 serif, ligne méta (date · lecture). */
export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header>
      <MonoLabel tone="or-dim" className="block">
        {article.eyebrow}
      </MonoLabel>
      <h1 className="mt-6 font-serif text-3xl font-light leading-[1.15] text-blanc sm:text-[2.75rem]">
        {article.title}
      </h1>
      <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.12em] text-gris">
        {formatArticleDate(article.publishedAt)}
        <span className="mx-2 text-line">·</span>
        {estimateReadingMinutes(article.body)} min de lecture
      </p>
    </header>
  );
}
