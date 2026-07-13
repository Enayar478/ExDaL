import type { Metadata } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoreTool } from "@/components/score/ScoreTool";
import { Container } from "@/components/ui/Container";
import { SCORE_COPY } from "@/lib/score/content";

export const metadata: Metadata = {
  title: SCORE_COPY.metaTitle,
  description: SCORE_COPY.metaDescription,
  alternates: { canonical: "/score" },
  openGraph: {
    type: "website",
    url: "/score",
    title: `${SCORE_COPY.metaTitle}. ExDaL`,
    description: SCORE_COPY.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SCORE_COPY.metaTitle}. ExDaL`,
    description: SCORE_COPY.metaDescription,
  },
};

/**
 * Lead magnet inbound « Score de Préparation à la Cession ».
 * Page statique et autonome : l'outil s'exécute côté client, sans requête
 * réseau tant que le dirigeant ne s'engage pas (réservation ou email).
 */
export default function ScorePage() {
  return (
    <BookingProvider>
      <SiteHeader />
      <main className="min-h-[70vh] py-20 sm:py-28">
        <Container width="reading">
          <ScoreTool />
        </Container>
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
