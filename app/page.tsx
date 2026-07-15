import type { Metadata } from "next";
import { Manifesto } from "@/components/manifesto/Manifesto";
import { StructuredData } from "@/components/StructuredData";
import { getPublishedArticles } from "@/lib/articles/get-article";
import type { SearchItem } from "@/components/manifesto/ManifestoSearch";

/**
 * Accueil exdal.fr — le hall d'entrée manifeste. Rendu côté serveur : le titre
 * et la promesse sont dans le HTML servi (le fond canvas est purement décoratif,
 * aria-hidden), donc le SEO reste propre. Canonical « / ».
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "ExDaL. Vos chiffres savent déjà tout",
    description:
      "Studio de data financière, spécialiste Pennylane. Vos chiffres savent déjà tout — donnons-leur la parole.",
  },
};

// L'accueil suit le scheduler du Journal : la recherche voit les articles
// programmés à leur échéance (revalidation horaire, comme l'index du Journal).
export const revalidate = 3600;

export default function Home() {
  // Index minimal du Journal, sérialisable, passé à la recherche client-side.
  const searchItems: SearchItem[] = getPublishedArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    eyebrow: article.eyebrow,
  }));

  return (
    <>
      <StructuredData />
      <Manifesto searchItems={searchItems} />
    </>
  );
}
