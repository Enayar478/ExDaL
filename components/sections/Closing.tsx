import { BookingButton } from "@/components/booking/BookingButton";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";

/** Section 8 · Closing — Réciprocité. Un seul appel à l'action, calme, répété. */
export function Closing() {
  return (
    <Section id="contact" labelledBy="closing-title" className="text-center">
      <div className="flex flex-col items-center">
        <MonoLabel tone="or-dim">Parlons-en</MonoLabel>
        <h2
          id="closing-title"
          className="mt-6 font-serif text-3xl font-normal leading-tight text-blanc sm:text-[2.75rem]"
        >
          Parlons de vos chiffres.
        </h2>
        <p className="mt-6 max-w-[52ch] font-serif text-lg italic leading-relaxed text-brume">
          Un échange de 20 minutes. Vous repartez avec une idée claire de ce que
          votre donnée peut vous dire — que l&rsquo;on travaille ensemble ou non.
        </p>
        <div className="mt-10">
          <BookingButton />
        </div>
      </div>
    </Section>
  );
}
