import Image from "next/image";
import { BookingButton } from "@/components/booking/BookingButton";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Container } from "@/components/ui/Container";

/** Section 1 · Hero — Anchoring + Curiosity Gap. On ancre haut, on intrigue. */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-24 pt-20 sm:pb-32 sm:pt-28"
    >
      <Container width="wide" className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* L'emblème : la source de lumière unique, née de la matière sombre */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <Image
              src="/emblem.png"
              alt="Emblème ExDaL — un point de lumière né de la donnée"
              width={480}
              height={480}
              priority
              className="w-52 max-w-full sm:w-64 lg:w-[460px] [mask-image:radial-gradient(circle_at_center,#000_52%,transparent_74%)]"
            />
          </div>

          <div className="order-2 lg:order-1">
            <MonoLabel tone="or-dim">De la donnée · la lumière</MonoLabel>

            <h1
              id="hero-title"
              className="mt-7 max-w-[16ch] font-serif text-[2.6rem] font-normal leading-[1.12] tracking-tight text-blanc sm:text-6xl"
            >
              De la donnée comptable, des fichiers dignes d&rsquo;une{" "}
              <em className="italic text-or">cession</em>.
            </h1>

            <p className="mt-7 max-w-[46ch] font-serif text-lg italic leading-relaxed text-brume sm:text-xl">
              L&rsquo;artisan discret de la data financière. Je transforme votre
              Pennylane brut en tableaux de bord fiables — et en dossiers que
              même un investisseur respecte.
            </p>

            <div className="mt-10">
              <BookingButton />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
                Sans engagement · Un échange de 20 minutes · Réponse sous 48h
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
