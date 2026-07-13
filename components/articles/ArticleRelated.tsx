import Link from "next/link";
import { MonoLabel } from "@/components/ui/MonoLabel";
import type { Article } from "@/lib/articles/types";

/**
 * Maillage interne — articles liés (cocon sémantique). N'affiche rien s'il n'y
 * a aucun lié publié, pour ne pas laisser de section vide.
 */
export function ArticleRelated({ related }: { related: readonly Article[] }) {
  if (related.length === 0) return null;

  return (
    <nav
      className="mt-16 border-t border-line pt-10"
      aria-label="Articles liés"
    >
      <MonoLabel tone="gris" className="block">
        À lire aussi
      </MonoLabel>
      <ul className="mt-5 flex flex-col gap-4">
        {related.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/journal/${article.slug}`}
              className="group font-serif text-[17px] text-brume transition-colors hover:text-or"
            >
              {article.title}
              <span className="ml-2 text-or-dim transition-transform group-hover:translate-x-0.5 inline-block">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
