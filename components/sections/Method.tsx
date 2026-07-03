import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";

/** Section 6 · La méthode — Labor Illusion + Goal Gradient. On montre le travail invisible. */
const steps = [
  {
    n: "01",
    lead: "L'échange.",
    rest: "Vingt minutes pour comprendre votre situation. Sans engagement, sans jargon.",
  },
  {
    n: "02",
    lead: "Le diagnostic.",
    rest: "Je regarde vos outils, j'identifie où dort la donnée et ce qu'on peut en tirer.",
  },
  {
    n: "03",
    lead: "La construction.",
    rest: "Je bâtis le système — pipelines, réconciliation, tableaux de bord. Le travail difficile, invisible pour vous.",
  },
  {
    n: "04",
    lead: "La lumière.",
    rest: "Vous recevez une clarté qui tient toute seule. Et, si vous le souhaitez, je veille dessus.",
  },
];

export function Method() {
  return (
    <Section labelledBy="method-title" className="bg-noir-2">
      <MonoLabel tone="or-dim">La méthode</MonoLabel>
      <h2
        id="method-title"
        className="mt-6 font-serif text-3xl font-normal leading-tight text-blanc sm:text-[2.5rem]"
      >
        Comment ça se passe.
      </h2>

      <ol className="mt-10">
        {steps.map((step) => (
          <li
            key={step.n}
            className="flex items-baseline gap-5 border-b border-line py-5 last:border-b-0"
          >
            <span className="min-w-[2rem] font-mono text-sm text-or-dim">
              {step.n}
            </span>
            <span className="font-serif text-base leading-relaxed text-brume sm:text-lg">
              <b className="font-normal text-blanc">{step.lead}</b> {step.rest}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
