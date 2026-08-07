import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <main>
      <Section as="section" className="pt-28 sm:pt-36">
        {/* En-tête */}
        <MonoLabel tone="or-dim" className="block mb-6">
          Conformité RGPD
        </MonoLabel>
        <h1 className="font-serif text-3xl font-light text-blanc sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 font-mono text-[13px] text-gris">
          Dernière mise à jour : août 2026
        </p>

        <Rule className="mt-10 mb-12" />

        <article className="space-y-10">
          <Prose>
            <p>
              {site.name} traite peu de données. C&apos;est un choix, pas une
              contrainte : on ne demande que ce qui sert réellement à préparer
              l&apos;échange avec vous. Cette page dit tout, simplement : ce
              qui est collecté, pourquoi, combien de temps, qui y a accès, et
              comment reprendre la main quand vous le voulez.
            </p>
          </Prose>

          <Rule />

          {/* Responsable de traitement */}
          <Block id="responsable" label="Responsable de traitement">
            <h2
              id="responsable"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Qui est responsable de vos données
            </h2>
            <Prose>
              <p>
                <strong className="font-medium text-blanc">
                  {site.legalName} ({site.name})
                </strong>{" "}
                est responsable du traitement décrit ici.
              </p>
              <Field label="Raison sociale">
                [À COMPLÉTER : raison sociale exacte]
              </Field>
              <Field label="Forme juridique">
                [À COMPLÉTER : statut juridique, ex. EI, EURL…]
              </Field>
              <Field label="SIRET">[À COMPLÉTER : numéro SIRET]</Field>
              <Field label="Adresse">
                [À COMPLÉTER : adresse du siège social]
              </Field>
              <Field label="Contact">
                <a
                  href="mailto:bonjour@exdal.fr"
                  className="text-brume hover:text-blanc transition-colors"
                >
                  bonjour@exdal.fr
                </a>
              </Field>
              <p className="mt-3">
                L&apos;identité complète de l&apos;éditeur figure aussi sur la
                page{" "}
                <Link
                  href="/mentions-legales"
                  className="text-brume hover:text-blanc transition-colors"
                >
                  Mentions légales
                </Link>
                .
              </p>
            </Prose>
          </Block>

          <Rule />

          {/* Ce qui est collecté */}
          <Block id="donnees" label="Données collectées">
            <h2
              id="donnees"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Ce que nous collectons, et pourquoi
            </h2>
            <Prose>
              <p>
                <strong className="font-medium text-blanc">
                  Le formulaire de qualification.
                </strong>{" "}
                Quand vous demandez un échange, nous vous demandons votre nom,
                votre email professionnel, votre rôle, le nom de votre
                entreprise, votre usage de Pennylane et le stade de votre
                projet (pilotage courant, levée, cession). Ces réponses
                servent à préparer la conversation et à préremplir votre
                créneau de rendez-vous. Rien de plus n&apos;est demandé à ce
                stade, et rien n&apos;est demandé sans raison.
              </p>
              <p>
                <strong className="font-medium text-blanc">
                  Le Score de Préparation à la Cession.
                </strong>{" "}
                Vos réponses au diagnostic restent anonymes tant que vous ne
                demandez rien de plus. Si vous laissez votre email pour
                recevoir votre plan détaillé, nous l&apos;associons à vos
                réponses le temps de vous envoyer ce plan, une seule fois.
              </p>
              <p>
                <strong className="font-medium text-blanc">
                  La newsletter Lumen.
                </strong>{" "}
                Un email suffit pour s&apos;inscrire. L&apos;inscription passe
                par une confirmation en double opt-in : tant que vous
                n&apos;avez pas cliqué sur le lien reçu, vous n&apos;êtes pas
                abonné. La désinscription se fait en un clic, depuis
                n&apos;importe quel email envoyé.
              </p>
              <p>
                <strong className="font-medium text-blanc">
                  Le nurturing par email.
                </strong>{" "}
                Si, et seulement si, vous cochez une case de consentement
                explicite (jamais précochée), vous recevez une courte série
                d&apos;emails de conseil liés à votre situation : entre 3 et 6
                messages, étalés sur environ trois semaines. Chaque email
                contient un lien de désinscription. Le moment où vous donnez
                votre accord est horodaté. Se désinscrire arrête l&apos;envoi
                le jour même, définitivement : aucune relance ne suit.
              </p>
            </Prose>
          </Block>

          <Rule />

          {/* Durée de conservation */}
          <Block id="conservation" label="Conservation">
            <h2
              id="conservation"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Combien de temps nous gardons vos données
            </h2>
            <Prose>
              <ul className="list-none space-y-2">
                {[
                  "Prospect qui n'a pas donné suite : 12 mois à compter du dernier contact, puis suppression.",
                  "Prospect qui a réservé un rendez-vous : 3 ans à compter de la date du rendez-vous.",
                  "Réponses au Score de Préparation (et email, si vous l'avez laissé) : mêmes durées que ci-dessus, selon qu'un rendez-vous a suivi ou non.",
                  "Inscription à la newsletter non confirmée : 30 jours, puis suppression automatique.",
                  "Désinscription (newsletter ou nurturing) : effective le jour même. Les emails suivants ne partent pas.",
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <span className="text-or-dim mt-px">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Prose>
          </Block>

          <Rule />

          {/* Destinataires */}
          <Block id="acces" label="Accès aux données">
            <h2
              id="acces"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Qui a accès à vos données
            </h2>
            <Prose>
              <p>
                Un cercle restreint de prestataires, choisis pour leur sérieux
                et, autant que possible, pour leur implantation européenne :
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    name: "Supabase",
                    role: "Base de données où vivent vos informations",
                    location: "Union européenne",
                  },
                  {
                    name: "Cal.com",
                    role: "Prise de rendez-vous",
                    location: "Instance européenne",
                  },
                  {
                    name: "Resend",
                    role: "Envoi des emails (confirmation, plan, nurturing, newsletter)",
                    location: "Union européenne",
                  },
                  {
                    name: "PostHog Cloud EU",
                    role: "Mesure d'audience",
                    location: "Union européenne",
                  },
                  {
                    name: "Vercel",
                    role: "Hébergement du site",
                    location: "États-Unis",
                  },
                ].map((provider) => (
                  <div key={provider.name} className="border-l border-line pl-4">
                    <p className="font-medium text-blanc">{provider.name}</p>
                    <p className="text-brume text-sm mt-0.5">
                      {provider.role}
                    </p>
                    <p className="font-mono text-[11px] text-gris mt-1">
                      {provider.location}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Aucun de ces prestataires ne revend vos données ni ne les
                exploite pour son propre compte. La règle qui guide chaque
                choix technique chez {site.name} : pas de transfert hors Union
                européenne, sauf nécessité absolue.
              </p>
            </Prose>
          </Block>

          <Rule />

          {/* Mesure d'audience */}
          <Block id="audience" label="Mesure d'audience">
            <h2
              id="audience"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              La mesure d&apos;audience, sans vous suivre
            </h2>
            <Prose>
              <p>
                {site.url.replace(/^https?:\/\//, "")} utilise PostHog Cloud
                EU en mode cookieless. Concrètement : aucun cookie, aucun
                stockage sur votre appareil, aucune identification
                individuelle. Nous voyons des tendances (les pages
                consultées, les parcours empruntés), jamais qui vous êtes.
              </p>
              <p className="mt-3">
                Cette configuration est exemptée de consentement par la
                doctrine de la CNIL, précisément parce qu&apos;elle ne trace
                personne. Une solution plus simple, plus intrusive, existait.
                Nous avons choisi celle-ci.
              </p>
            </Prose>
          </Block>

          <Rule />

          {/* Droits */}
          <Block id="droits" label="Vos droits">
            <h2
              id="droits"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Vos droits
            </h2>
            <Prose>
              <p>Vous disposez, sur vos données, des droits suivants :</p>
              <ul className="list-none mt-3 space-y-1.5">
                {[
                  ["Accès", "savoir ce que nous détenons sur vous"],
                  ["Rectification", "corriger une information inexacte"],
                  ["Effacement", "demander la suppression de vos données"],
                  ["Opposition", "vous opposer à un traitement"],
                  [
                    "Portabilité",
                    "récupérer vos données dans un format lisible par machine",
                  ],
                ].map(([right, desc]) => (
                  <li key={right} className="flex gap-2 items-start">
                    <span className="text-or-dim mt-px">·</span>
                    <span>
                      <strong className="font-medium text-blanc">
                        {right}
                      </strong>{" "}
                      : {desc}.
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                Pour exercer l&apos;un de ces droits, écrivez à{" "}
                <a
                  href="mailto:bonjour@exdal.fr"
                  className="text-brume hover:text-blanc transition-colors"
                >
                  bonjour@exdal.fr
                </a>
                . Nous répondons sous 48h.
              </p>
              <p className="mt-3">
                Si vous estimez que vos droits ne sont pas respectés, vous
                pouvez adresser une réclamation à la{" "}
                <strong className="font-medium text-blanc">CNIL</strong> (
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brume hover:text-blanc transition-colors"
                >
                  cnil.fr
                </a>
                ).
              </p>
            </Prose>
          </Block>

          <Rule className="mt-4" />

          {/* Note de bas de page */}
          <Prose>
            <p>
              Cette page évoluera avec le service. La date en haut de page
              indique toujours sa dernière mise à jour.
            </p>
          </Prose>
          <p className="font-mono text-[11px] text-gris">
            {site.name}. {site.legalName}. {site.url}
          </p>
        </article>
      </Section>
    </main>
  );
}

/* Composants internes à la page, pas de primitives UI à créer pour eux */

function Block({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-8">
      <MonoLabel tone="gris" className="block mb-3">
        {label}
      </MonoLabel>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="mt-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gris mr-2">
        {label} :
      </span>
      <span className="text-brume">{children}</span>
    </p>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="text-[15px] leading-relaxed text-brume space-y-2">
      {children}
    </div>
  );
}
