import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";

/** Section 3 · Le problème — Loss Aversion. On nomme le coût de l'inaction, calmement. */
const tensions = [
  {
    lead: "Piloter sans voir",
    rest: "les décisions prises trop tard, au jugé.",
  },
  {
    lead: "La due diligence subie",
    rest: "des semaines à rassembler ce qui aurait dû être prêt.",
  },
  {
    lead: "La valeur laissée sur la table",
    rest: "vendre sans pouvoir prouver ce que vaut vraiment l'entreprise.",
  },
];

export function Problem() {
  return (
    <Section labelledBy="problem-title">
      <MonoLabel tone="or-dim">Le problème</MonoLabel>
      <h2
        id="problem-title"
        className="mt-6 font-serif text-3xl font-normal leading-tight text-blanc sm:text-[2.5rem]"
      >
        Votre donnée sait déjà tout. Elle ne vous dit rien.
      </h2>

      <p className="mt-7 max-w-[60ch] font-serif text-lg leading-relaxed text-brume">
        Vos ventes sont dans un outil. Votre compta dans Pennylane. Vos paiements
        ailleurs. Chacun a raison dans son coin, et ensemble ils ne vous disent
        rien de clair. Vous pilotez au ressenti, vous attendez la fin du mois pour
        savoir où vous en êtes, et le jour où un investisseur ou un acheteur
        réclame vos chiffres, c&rsquo;est la course — ou la facture d&rsquo;un
        cabinet de transaction à cinq chiffres.
      </p>

      <ul className="mt-9 flex flex-col gap-4">
        {tensions.map((t) => (
          <li
            key={t.lead}
            className="border-l border-or-dim pl-5 font-mono text-sm leading-relaxed text-brume"
          >
            <b className="font-medium text-blanc">{t.lead}</b> : {t.rest}
          </li>
        ))}
      </ul>
    </Section>
  );
}
