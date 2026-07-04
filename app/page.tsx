import { BookingProvider } from "@/components/booking/BookingProvider";
import { SmoothScroll } from "@/components/tunnel/SmoothScroll";
import { JourneyContent } from "@/components/journey/JourneyContent";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";

/**
 * Landing exdal.fr — un seul voyage immersif, du chaos vers la lumière.
 * On ne scrolle pas verticalement : on s'enfonce sur l'axe Z, palier après
 * palier, jusqu'à déboucher dans la lumière sur la prise de rendez-vous.
 * Le formulaire de qualification fait partie du voyage. Fallback reduced-motion :
 * scroll vertical classique, entièrement lisible et accessible.
 */
export default function Home() {
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
