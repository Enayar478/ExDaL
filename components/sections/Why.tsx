import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";

/** Section 7 · Le pourquoi — Peak-End Rule. On finit fort et calme, sur la conviction. */
export function Why() {
  return (
    <Section labelledBy="why-title">
      <MonoLabel tone="or-dim">Le pourquoi</MonoLabel>
      <div className="mt-6 border border-line p-7 sm:p-9">
        <p
          id="why-title"
          className="font-serif text-xl leading-relaxed text-brume sm:text-2xl"
        >
          Je crois qu&rsquo;une entreprise ne devrait jamais avancer à
          l&rsquo;aveugle. Ni au quotidien, ni le jour décisif où elle se vend. La
          donnée qui vous rend puissant existe déjà.
          <span className="mt-3 block text-or">
            Elle attend seulement qu&rsquo;on lui donne la parole.
          </span>
        </p>
        <p className="mt-7 font-mono text-[13px] uppercase tracking-[0.18em] text-blanc">
          Ex Datis Lumen
        </p>
      </div>
    </Section>
  );
}
