import { BookingProvider } from "@/components/booking/BookingProvider";
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
 * Le tout enveloppé du BookingProvider : chaque CTA ouvre le même formulaire
 * de qualification, chaque porte du sélecteur alimente la segmentation.
 */
export default function Home() {
  return (
    <BookingProvider>
      <StructuredData />
      <SiteHeader />
      <main>
        <Hero />
        <Proof />
        <Problem />
        <PathSelector />
        <Offers />
        <Method />
        <Why />
        <Closing />
      </main>
      <SiteFooter />
    </BookingProvider>
  );
}
