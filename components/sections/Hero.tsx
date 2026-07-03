import { BookingButton } from "@/components/booking/BookingButton";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Container } from "@/components/ui/Container";

/** Section 1 · Hero — Anchoring + Curiosity Gap. On ancre haut, on intrigue. */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-24 pt-28 sm:pb-32 sm:pt-40"
    >
      {/* Lueur unique, rare — la source lumineuse du clair-obscur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #d9b26a 0%, transparent 70%)" }}
      />
      <Container className="relative">
        <MonoLabel tone="or-dim">De la donnée · la lumière</MonoLabel>

        <h1
          id="hero-title"
          className="mt-8 max-w-[16ch] font-serif text-[2.6rem] font-normal leading-[1.12] tracking-tight text-blanc sm:text-6xl"
        >
          De la donnée comptable, des fichiers dignes d&rsquo;une{" "}
          <em className="italic text-or">cession</em>.
        </h1>

        <p className="mt-8 max-w-[46ch] font-serif text-lg italic leading-relaxed text-brume sm:text-xl">
          L&rsquo;artisan discret de la data financière. Je transforme votre
          Pennylane brut en tableaux de bord fiables — et en dossiers que même un
          investisseur respecte.
        </p>

        <div className="mt-10">
          <BookingButton />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
            Sans engagement · Un échange de 20 minutes · Réponse sous 48h
          </p>
        </div>
      </Container>
    </section>
  );
}
