import { MonoLabel } from "@/components/ui/MonoLabel";
import { Container } from "@/components/ui/Container";

/** Section 5 · Les offres — Centre-Stage Effect + Hick's Law. L'offre du milieu au centre. */
interface Offer {
  anchor: string;
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  center?: boolean;
}

const offers: Offer[] = [
  {
    anchor: "offre-socle",
    eyebrow: "Le Socle · Clarté",
    title: "Votre donnée, enfin lisible.",
    body: "Réconciliation Pennylane + CRM + paiements dans un entrepôt unique, et des tableaux de bord fiables qui tournent seuls. Vous ouvrez votre écran, vous voyez où vous en êtes. Chaque jour, pas à la fin du mois.",
    to: "→ Pour piloter au quotidien.",
  },
  {
    anchor: "offre-pilotage",
    eyebrow: "Le Pilotage · au centre",
    title: "La clarté, en continu.",
    body: "Le Socle, plus un suivi mensuel : vos métriques clés maintenues, vos évolutions surveillées, un point régulier. La tranquillité de savoir que vos chiffres sont toujours à jour et justes — sans y penser.",
    to: "→ Le choix de ceux qui ne veulent plus jamais y revenir.",
    center: true,
  },
  {
    anchor: "offre-operation",
    eyebrow: "L'Opération · Maîtrise",
    title: "Vos chiffres, prêts pour l'investisseur.",
    body: "Préparation et automatisation des fichiers d'une levée ou d'une cession : ARR, MRR, current trading, cohortes. Les documents qui font tenir un deal, produits par quelqu'un qui l'a déjà fait.",
    to: "→ Pour le jour qui compte le plus.",
  },
];

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article
      id={offer.anchor}
      className={`flex scroll-mt-24 flex-col border p-6 sm:p-7 ${
        offer.center
          ? "border-or-dim bg-noir-3 sm:-my-4 sm:shadow-[0_0_60px_-20px_rgba(217,178,106,0.25)]"
          : "border-line bg-noir"
      }`}
    >
      <MonoLabel tone="or-dim">{offer.eyebrow}</MonoLabel>
      <h3
        className={`mt-4 font-serif text-xl font-normal leading-snug sm:text-2xl ${
          offer.center ? "text-or" : "text-blanc"
        }`}
      >
        {offer.title}
      </h3>
      <p className="mt-4 flex-1 font-serif text-[15px] leading-relaxed text-brume">
        {offer.body}
      </p>
      <p className="mt-5 font-mono text-xs leading-relaxed text-brume">
        {offer.to}
      </p>
    </article>
  );
}

export function Offers() {
  return (
    <section
      id="offres"
      aria-labelledby="offers-title"
      className="py-20 sm:py-28"
    >
      <Container width="wide">
        <MonoLabel tone="or-dim">Les offres</MonoLabel>
        <h2
          id="offers-title"
          className="mt-6 font-serif text-3xl font-normal leading-tight text-blanc sm:text-[2.5rem]"
        >
          Trois manières de faire parler vos chiffres.
        </h2>

        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.anchor} offer={offer} />
          ))}
        </div>

        <p className="mt-8 border-t border-line pt-6 font-serif text-sm italic leading-relaxed text-gris">
          Je produis et fiabilise la donnée. La certification des comptes reste
          l&rsquo;affaire de votre expert-comptable — je fabrique la machine à
          sortir les bons chiffres, vite et proprement.
        </p>
      </Container>
    </section>
  );
}
