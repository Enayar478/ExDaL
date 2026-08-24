import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import { site } from "@/lib/site";

/**
 * Brief banquiers : page sur invitation, transmise en direct au réseau
 * personnel du fondateur. Volontairement introuvable : noindex, absente du
 * sitemap, aucun lien interne ne pointe ici. Le lien Cal direct est un choix
 * assumé sur cette page (le banquier le transmet tel quel), contrairement au
 * reste du site où la qualification précède toujours le calendrier.
 */
const CAL_URL = "https://cal.eu/exdal/echange-20min";

export const metadata: Metadata = {
  title: "Aurum",
  robots: { index: false, follow: false },
};

// Les trois situations déclencheuses, formulées du point de vue du banquier.
const situations = [
  {
    numeral: "I",
    title: "Le dirigeant qui pilote au jugé",
    heard:
      "Entre mon CRM, Pennylane et les virements, j'ai trois chiffres de trésorerie et aucun ne raconte la même histoire.",
    why: "C'est souvent au renouvellement d'une ligne, à une demande de financement, ou simplement quand le dirigeant peine à vous sortir un chiffre propre en direct. Le signal n'est pas qu'il va mal : c'est qu'il ne voit pas. Un dirigeant qui pilote à l'aveugle prend de moins bonnes décisions, et ça finit par se voir dans son dossier de crédit.",
    say: "Je connais quelqu'un qui remet ça à plat sur vos outils existants, sans tout reconstruire. Un échange de 20 minutes suffit à savoir si ça vaut le coup, ça s'appelle ExDaL.",
  },
  {
    numeral: "II",
    title: "L'expert-comptable qui ne sait plus quoi répondre à ses clients",
    heard:
      "Mes clients me demandent du pilotage, des tableaux de bord, pas juste la liasse. Je ne peux pas embaucher un data engineer pour ça.",
    why: "Vous connaissez sûrement des cabinets comptables en portefeuille, certains sont clients de la banque au même titre que leurs propres clients. Quand un expert-comptable sent son métier se banaliser et cherche à monter en gamme sans recruter, c'est le bon moment. ExDaL travaille en marque blanche derrière lui : le cabinet garde la relation, le client gagne du pilotage.",
    say: "Il y a un spécialiste Pennylane qui outille des cabinets comme le vôtre en marque blanche, sans que vous ayez à recruter. Ça vaut un échange de 20 minutes.",
  },
  {
    numeral: "III",
    title: "Le dirigeant qui lève ou qui vend",
    heard:
      "Un fonds a montré de l'intérêt. Je réfléchis à céder d'ici 18 mois. Un repreneur m'a approché la semaine dernière.",
    why: "C'est le signal le plus rare et le plus précieux que vous captez. Avant d'entrer en due diligence, la plupart des dirigeants découvrent que leurs fichiers ne tiennent pas la route : ARR mal calculé, cohortes absentes, current trading approximatif. À ce stade, chaque semaine de retard coûte de la valeur ou du temps de négociation.",
    say: "Avant de rentrer en due diligence, faites vérifier vos fichiers par quelqu'un qui en a déjà produit pour une vraie cession. Un appel de 20 minutes suffit à savoir si c'est utile.",
  },
] as const;

export default function AurumPage() {
  return (
    <main>
      <Section as="section" className="pt-24 pb-24 sm:pt-32" width="reading">
        <MonoLabel tone="or-dim" className="block mb-6">
          Lien privé · réservé au réseau
        </MonoLabel>
        <h1 className="max-w-[24ch] font-serif text-3xl font-light leading-[1.15] text-blanc sm:text-4xl">
          Un dossier qui traîne dans un tiroir, ça se règle en un appel.
        </h1>

        <div className="mt-8 space-y-4 font-serif text-[17px] leading-relaxed text-brume">
          <p>
            Je m&apos;appelle Rayane Guerrouah. Je fais un métier de niche : je
            répare la donnée financière des entreprises sous Pennylane,
            jusqu&apos;à produire les fichiers qu&apos;un investisseur ou un
            repreneur exige. Je l&apos;ai fait pour de vrai, sur une cession
            réelle.
          </p>
          <p>
            Cette page n&apos;a qu&apos;un but : vous dire{" "}
            <strong className="font-medium text-blanc">quand</strong> penser à
            moi et{" "}
            <strong className="font-medium text-blanc">quoi dire</strong> à
            votre client. Trois minutes de lecture, trois situations, une
            phrase à retenir pour chacune.
          </p>
        </div>

        <Rule className="mt-12 mb-12" />

        <h2 className="font-serif text-2xl font-light text-blanc">
          Les trois moments où le réflexe s&apos;impose
        </h2>

        <div className="mt-10 space-y-14">
          {situations.map((s) => (
            <article key={s.numeral}>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[13px] text-or-dim">
                  {s.numeral}
                </span>
                <h3 className="font-serif text-xl font-light text-blanc">
                  {s.title}
                </h3>
              </div>

              <MonoLabel tone="gris" className="mt-6 block">
                Ce que vous entendez
              </MonoLabel>
              <blockquote className="mt-2 border-l border-line pl-5 font-serif text-[17px] italic leading-relaxed text-brume">
                « {s.heard} »
              </blockquote>

              <p className="mt-5 font-serif text-[16px] leading-relaxed text-brume">
                <strong className="font-medium text-blanc">
                  Pourquoi c&apos;est le moment.
                </strong>{" "}
                {s.why}
              </p>

              <MonoLabel tone="gris" className="mt-5 block">
                La phrase à dire
              </MonoLabel>
              <blockquote className="mt-2 border-l border-or-dim/50 pl-5 font-serif text-[17px] leading-relaxed text-blanc">
                « {s.say} »
              </blockquote>
            </article>
          ))}
        </div>

        <Rule className="mt-14 mb-12" />

        <h2 className="font-serif text-2xl font-light text-blanc">
          Ce que ça change, des deux côtés
        </h2>
        <div className="mt-6 space-y-4 font-serif text-[16px] leading-relaxed text-brume">
          <p>
            <strong className="font-medium text-blanc">
              Pour votre client
            </strong>{" "}
            : des chiffres qu&apos;il comprend et peut défendre, que ce soit
            devant vous au comité de crédit ou devant un investisseur en due
            diligence. Il arrive préparé au lieu de subir.
          </p>
          <p>
            <strong className="font-medium text-blanc">Pour vous</strong> : un
            client mieux tenu, un dossier plus propre à instruire, et rien
            d&apos;autre.{" "}
            <strong className="font-medium text-blanc">
              ExDaL ne rétrocède aucune commission sur les mises en relation.
            </strong>{" "}
            Ce n&apos;est pas un partenariat commercial, c&apos;est un service
            rendu à un client commun. Votre recommandation reste la vôtre,
            propre, sans arrière-pensée.
          </p>
        </div>

        <Rule className="mt-14 mb-12" />

        <h2 className="font-serif text-2xl font-light text-blanc">
          La mise en relation, en pratique
        </h2>
        <div className="mt-6 space-y-4 font-serif text-[16px] leading-relaxed text-brume">
          <p>Deux façons simples de transmettre :</p>
          <Way label="Le lien direct">
            <a
              href={CAL_URL}
              className="text-or transition-opacity hover:opacity-80"
            >
              cal.eu/exdal/echange-20min
            </a>
            , un échange de 20 minutes, sans engagement.
          </Way>
          <Way label="Par email">
            <a
              href={`mailto:${site.email}`}
              className="text-blanc underline decoration-line underline-offset-4 transition-colors hover:decoration-or-dim"
            >
              {site.email}
            </a>
            , en mettant votre client en copie ou non, comme vous préférez.
          </Way>
        </div>
        <MonoLabel tone="or-dim" className="mt-8 block">
          Réponse sous 48h, toujours
        </MonoLabel>

        <Rule className="mt-14 mb-10" />

        <p className="font-serif text-[15px] leading-relaxed text-gris">
          Le périmètre reste net : ExDaL produit et fiabilise la donnée
          financière. La certification des comptes continue de relever de
          l&apos;expert-comptable du client, ExDaL ne s&apos;y substitue
          jamais.
        </p>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-gris">
          Ex Datis Lumen · exdal.fr
        </p>
      </Section>
    </main>
  );
}

function Way({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="border-l border-line pl-5">
      <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gris">
        {label}
      </span>
      <span className="font-serif text-[16px] text-brume">{children}</span>
    </p>
  );
}
