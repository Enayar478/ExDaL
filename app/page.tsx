import { BookingProvider } from "@/components/booking/BookingProvider";
import { SmoothScroll } from "@/components/tunnel/SmoothScroll";
import { DepthTunnel } from "@/components/tunnel/DepthTunnel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";
import { Hero } from "@/components/sections/Hero";
import { Proof } from "@/components/sections/Proof";
import { Problem } from "@/components/sections/Problem";
import { PathSelector } from "@/components/sections/PathSelector";
import { Offers } from "@/components/sections/Offers";
import { Method } from "@/components/sections/Method";
import { Why } from "@/components/sections/Why";
import { Closing } from "@/components/sections/Closing";

/**
 * Landing exdal.fr — les 8 sections du tunnel, dans l'ordre du brief.
 * Les 3 sections narratives d'ouverture (Hero, Preuve, Problème) sont traversées
 * en « tunnel de profondeur » (axe Z) ; on débouche ensuite sur le contenu dense
 * (sélecteur, offres, méthode…) en scroll classique pour préserver la lisibilité.
 */
export default function Home() {
  return (
    <BookingProvider>
      <SmoothScroll>
        <StructuredData />
        <SiteHeader />
        <main>
          <DepthTunnel>
            <Hero />
            <Proof />
            <Problem />
          </DepthTunnel>
          <PathSelector />
          <Offers />
          <Method />
          <Why />
          <Closing />
        </main>
        <SiteFooter />
      </SmoothScroll>
    </BookingProvider>
  );
}
