import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import {
  getAllArticlesForAdmin,
  getPublishedArticles,
} from "@/lib/articles/get-article";
import { estimateReadingMinutes } from "@/lib/articles/reading-time";
import { formatArticleDate } from "@/lib/articles/format";
import type { Article } from "@/lib/articles/types";
import type { Segment } from "@/lib/validation/lead";

// Jamais statique (contenu programmé/brouillon), jamais indexé.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Panneau éditorial",
  robots: { index: false, follow: false },
};

type Status = "publie" | "programme" | "brouillon";

const GRAPPE: Record<Segment, string> = {
  pme: "Pilotage",
  cabinet: "Cabinets",
  premium: "Levée-cession",
};

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function StatusChip({ status, iso }: { status: Status; iso: string }) {
  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]";
  if (status === "publie") {
    return (
      <span className={`${base} text-brume`}>
        <span className="h-1 w-1 rounded-full bg-brume" aria-hidden />
        Publié
      </span>
    );
  }
  if (status === "programme") {
    return (
      <span
        className={`${base} border border-or-dim/40 bg-or-dim/[0.06] text-or-dim`}
      >
        <span className="h-1 w-1 rounded-full bg-or-dim" aria-hidden />
        Programmé · {shortDate(iso)}
      </span>
    );
  }
  return (
    <span className={`${base} border border-dashed border-line text-gris`}>
      <span className="h-1 w-1 rounded-full bg-gris" aria-hidden />
      Brouillon
    </span>
  );
}

function Row({ article, status }: { article: Article; status: Status }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-t border-line py-5 transition-colors hover:border-or-dim sm:grid-cols-[1fr_130px_110px_70px_150px] sm:items-center">
      <Link href={`/admin/articles/${article.slug}`} className="group min-w-0">
        <MonoLabel tone="or-dim" className="block">
          {article.eyebrow}
        </MonoLabel>
        <p className="mt-1 font-serif text-[17px] text-blanc transition-colors group-hover:text-or">
          {article.title}
        </p>
      </Link>
      <span className="hidden font-mono text-[11px] text-brume sm:block">
        {article.segment ? GRAPPE[article.segment] : "·"}
      </span>
      <span className="hidden font-mono text-[11px] text-gris sm:block">
        {formatArticleDate(article.publishedAt)}
      </span>
      <span className="hidden font-mono text-[11px] text-gris sm:block">
        {estimateReadingMinutes(article.body)} min
      </span>
      <div className="justify-self-end sm:justify-self-start">
        <StatusChip status={status} iso={article.publishedAt} />
      </div>
    </div>
  );
}

function Group({
  title,
  articles,
  status,
}: {
  title: string;
  articles: Article[];
  status: Status;
}) {
  if (articles.length === 0) return null;
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between">
        <MonoLabel tone="or-dim">{title}</MonoLabel>
        <span className="font-mono text-[11px] text-gris">
          {articles.length}
        </span>
      </div>
      <Rule className="mt-3" />
      {articles.map((article) => (
        <Row key={article.slug} article={article} status={status} />
      ))}
    </section>
  );
}

export default function AdminDashboardPage() {
  const articles = getAllArticlesForAdmin();
  // `getPublishedArticles` lit l'heure dans lib (pas dans le composant) : la
  // page reste pure au sens du linter, tout en étant rendue par requête.
  const published = getPublishedArticles(); // déjà triés du plus récent au plus ancien
  const publishedSlugs = new Set(published.map((a) => a.slug));

  const drafts = articles
    .filter((a) => a.draft)
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const scheduled = articles
    .filter((a) => !a.draft && !publishedSlugs.has(a.slug))
    .slice()
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
    );
  const next = scheduled[0];

  return (
    <div className="min-h-screen">
      <div className="border-b border-line py-6">
        <Container
          width="wide"
          className="flex items-center justify-between gap-4"
        >
          <span className="font-serif text-lg text-blanc">
            ExDaL <span className="text-gris">/</span>{" "}
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-or-dim">
              Panneau éditorial
            </span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris">
            Usage interne, non indexé
          </span>
        </Container>
      </div>

      <Container width="wide" className="py-12">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-8 sm:grid-cols-4">
          <Metric
            label="Publiés"
            value={String(published.length)}
            tone="blanc"
          />
          <Metric
            label="Programmés"
            value={String(scheduled.length)}
            tone="or-dim"
          />
          <Metric
            label="Brouillons"
            value={String(drafts.length)}
            tone="gris"
          />
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris">
              Prochain à sortir
            </dt>
            <dd className="mt-2 font-serif text-[15px] leading-snug text-brume">
              {next ? (
                <>
                  <span className="text-or-dim">
                    {shortDate(next.publishedAt)}
                  </span>{" "}
                  · {next.title}
                </>
              ) : (
                "Aucun"
              )}
            </dd>
          </div>
        </dl>

        <Group title="Programmés" articles={scheduled} status="programme" />
        <Group title="Publiés" articles={published} status="publie" />
        <Group title="Brouillons" articles={drafts} status="brouillon" />

        {articles.length === 0 && (
          <p className="mt-12 font-serif text-[17px] italic text-gris">
            Aucun article dans le cocon.
          </p>
        )}
      </Container>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blanc" | "or-dim" | "gris";
}) {
  const color = {
    blanc: "text-blanc",
    "or-dim": "text-or-dim",
    gris: "text-gris",
  }[tone];
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris">
        {label}
      </dt>
      <dd className={`mt-2 font-serif text-3xl font-light italic ${color}`}>
        {value}
      </dd>
    </div>
  );
}
