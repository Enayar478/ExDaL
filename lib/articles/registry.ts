import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { articleSchema } from "@/lib/articles/schema";
import type { Article } from "@/lib/articles/types";

/**
 * Source unique des articles : scan des fichiers Markdown de `content/articles/`.
 * Ajouter un article = déposer un `.md`, rien d'autre. Le frontmatter est validé
 * (Zod, fail-fast) au chargement : un fichier mal formé casse le build.
 *
 * Server-only : lecture disque (`fs`), jamais importable côté client ni en runtime
 * Edge. Toute route qui dépend transitivement de ce module reste en runtime Node.
 * (Le tracing Vercel des `.md` est forcé via `outputFileTracingIncludes`.)
 */
const CONTENT_DIR = path.join(process.cwd(), "content/articles");

function loadArticle(filename: string): Article {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  const parsed = articleSchema.safeParse({
    ...data,
    slug,
    body: content.trim(),
  });
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");
    throw new Error(`Frontmatter d'article invalide (${filename}) : ${issues}`);
  }
  return parsed.data;
}

export const ARTICLES: readonly Article[] = fs
  .readdirSync(CONTENT_DIR)
  .filter((file) => file.endsWith(".md"))
  .map(loadArticle)
  .sort((a, b) => a.slug.localeCompare(b.slug));
