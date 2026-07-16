import { z } from "zod";
import { segment } from "@/lib/validation/lead";

/**
 * Validation du frontmatter d'un article (frontière : fichier .md édité à la main).
 * Fail-fast au chargement du registre : un article mal formé casse le build plutôt
 * que de passer silencieusement en prod. Le `slug` (nom de fichier) et le `body`
 * (corps markdown) sont validés dans le même passage.
 */
export const articleSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en kebab-case."),
  title: z.string().min(1).max(120),
  metaTitle: z.string().min(1).max(60, "metaTitle ≤ 60 caractères."),
  metaDescription: z.string().min(1).max(160, "metaDescription ≤ 160 caractères."),
  excerpt: z.string().min(1).max(400),
  eyebrow: z.string().min(1).max(60),
  segment: segment.optional(),
  publishedAt: z
    .string()
    .refine(
      (v) => !Number.isNaN(new Date(v).getTime()),
      "publishedAt doit être une date ISO valide.",
    ),
  updatedAt: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()))
    .optional(),
  draft: z.boolean().optional(),
  relatedSlugs: z.array(z.string()).optional(),
  ctaVariant: z.enum(["qualification", "score"]),
  body: z.string().min(1, "Le corps de l'article est vide."),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
