import type { Metadata } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { SmoothScroll } from "@/components/tunnel/SmoothScroll";
import { JourneyContent } from "@/components/journey/JourneyContent";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Le parcours",
  description:
    "De vos données Pennylane jusqu'aux décisions : le parcours ExDaL, palier après palier, jusqu'à la prise de rendez-vous.",
  alternates: { canonical: "/tunnel" },
  openGraph: {
    type: "website",
    url: "/tunnel",
    title: "Le parcours. ExDaL",
    description:
      "De vos données Pennylane jusqu'aux décisions : le parcours ExDaL, jusqu'à la prise de rendez-vous.",
  },
};

/**
 * Le parcours immersif (déplacé depuis / vers /tunnel lors de la refonte accueil
 * manifeste). Ici, on ne découvre plus la marque : on avance. C'est la porte de
 * ceux qui ont décidé de passer à l'action — on s'enfonce sur l'axe Z, palier
 * après palier, jusqu'à déboucher dans la lumière sur la prise de rendez-vous.
 * Le formulaire de qualification fait partie du voyage. Fallback reduced-motion :
 * scroll vertical classique, entièrement lisible et accessible.
 */
export default function TunnelPage() {
  return (
    <BookingProvider>
      <SmoothScroll>
        <StructuredData />
        <SiteHeader />
        <main>
          <JourneyContent />
        </main>
        <SiteFooter />
      </SmoothScroll>
    </BookingProvider>
  );
}
