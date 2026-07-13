import type { Metadata } from "next";
import { Manifesto } from "@/components/manifesto/Manifesto";
import { StructuredData } from "@/components/StructuredData";

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

export default function Home() {
  return (
    <>
      <StructuredData />
      <Manifesto />
    </>
  );
}
