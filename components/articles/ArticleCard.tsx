import Link from "next/link";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { formatArticleDate } from "@/lib/articles/format";
import type { Article } from "@/lib/articles/types";

/** Carte d'article pour la page d'index — sobre, cliquable en entier. */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block border-t border-line py-8 transition-colors hover:border-or-dim"
    >
      <MonoLabel tone="or-dim" className="block">
        {article.eyebrow}
      </MonoLabel>
      <h2 className="mt-3 font-serif text-xl font-light leading-snug text-blanc transition-colors group-hover:text-or sm:text-2xl">
        {article.title}
      </h2>
      <p className="mt-3 max-w-[60ch] font-serif text-[15px] leading-relaxed text-brume">
        {article.excerpt}
      </p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
        {formatArticleDate(article.publishedAt)}
        <span className="mx-2 text-line">·</span>
        {article.readingMinutes} min
      </p>
    </Link>
  );
}
