import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <main>
      <Section as="section" className="pt-28 sm:pt-36">
        {/* En-tête */}
        <MonoLabel tone="or-dim" className="block mb-6">
          Conformité RGPD
        </MonoLabel>
        <h1 className="font-serif text-3xl font-light text-blanc sm:text-4xl">
          Mentions légales &amp; Politique de confidentialité
        </h1>
        <p className="mt-4 font-mono text-[13px] text-gris">
          Dernière mise à jour : juillet 2026
        </p>

        <Rule className="mt-10 mb-12" />

        {/* Éditeur / Responsable de traitement */}
        <article className="space-y-10">
          <Block id="editeur" label="Éditeur du site">
            <h2
              id="editeur"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Éditeur du site, Responsable de traitement
            </h2>
            <Prose>
              <p>
                <strong className="font-medium text-blanc">
                  {site.legalName} ({site.name})
                </strong>
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
              <Field label="Responsable de publication">
                [À COMPLÉTER : nom du fondateur]
              </Field>
              <Field label="Contact">
                <a
                  href={`mailto:${site.email}`}
                  className="text-brume hover:text-blanc transition-colors"
                >
                  {site.email}
                </a>
              </Field>
            </Prose>
          </Block>

          <Rule />

          {/* Hébergeur */}
          <Block id="hebergeur" label="Hébergeur">
            <h2
              id="hebergeur"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Hébergeur
            </h2>
            <Prose>
              <p>
                Le site est hébergé par{" "}
                <strong className="font-medium text-blanc">Vercel Inc.</strong>
              </p>
              <Field label="Adresse">
                340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              </Field>
              <Field label="Site">
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brume hover:text-blanc transition-colors"
                >
                  vercel.com
                </a>
              </Field>
            </Prose>
          </Block>

          <Rule />

          {/* Données collectées et finalités */}
          <Block id="donnees" label="Données personnelles">
            <h2
              id="donnees"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Données collectées et finalités
            </h2>
            <Prose>
              <p>
                {site.name} collecte des données personnelles dans le cadre de
                la qualification de prospects et de la prise de rendez-vous. Ces
                données sont strictement limitées à ce qui est nécessaire à ces
                finalités.
              </p>
              <p className="mt-3 font-medium text-blanc">
                Données collectées :
              </p>
              <ul className="list-none mt-2 space-y-1">
                {[
                  "Nom",
                  "Adresse email professionnelle",
                  "Rôle dans l'entreprise",
                  "Nom de l'entreprise",
                  "Usage de Pennylane",
                  "Stade du projet (levée, cession, pilotage courant…)",
                  "Réponses au diagnostic « Score de Préparation » et score associé, lorsque vous demandez à recevoir votre plan par email",
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

          {/* Base légale */}
          <Block id="base-legale" label="Base légale">
            <h2
              id="base-legale"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Base légale du traitement
            </h2>
            <Prose>
              <p>
                Le traitement repose sur deux bases légales au sens de
                l&apos;article 6 du RGPD :
              </p>
              <ul className="list-none mt-3 space-y-2">
                <li className="flex gap-2 items-start">
                  <span className="text-or-dim mt-px">·</span>
                  <span>
                    <strong className="font-medium text-blanc">
                      Intérêt légitime
                    </strong>{" "}
                    (article 6.1.f) : dans le cadre d&apos;une relation
                    commerciale B2B, {site.name} a un intérêt légitime à
                    contacter des professionnels susceptibles d&apos;être
                    intéressés par ses services.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-or-dim mt-px">·</span>
                  <span>
                    <strong className="font-medium text-blanc">
                      Consentement
                    </strong>{" "}
                    (article 6.1.a) : pour toute communication commerciale
                    complémentaire, le consentement est recueilli explicitement
                    (newsletter, par exemple).
                  </span>
                </li>
              </ul>
            </Prose>
          </Block>

          <Rule />

          {/* Destinataires et sous-traitants */}
          <Block id="sous-traitants" label="Sous-traitants">
            <h2
              id="sous-traitants"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Destinataires et sous-traitants
            </h2>
            <Prose>
              <p>
                Vos données peuvent être transmises aux sous-traitants suivants,
                auxquels {site.name} a recours pour assurer ses services :
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    name: "Supabase",
                    role: "Base de données (stockage des leads)",
                    location: "Union européenne, région Paris",
                    transfer: null,
                  },
                  {
                    name: "Cal.com",
                    role: "Prise de rendez-vous",
                    location: "Union européenne",
                    transfer: null,
                  },
                  {
                    name: "Resend",
                    role: "Envoi d'emails transactionnels",
                    location: "États-Unis",
                    transfer: "CCT",
                  },
                  {
                    name: "Vercel Inc.",
                    role: "Hébergement et infrastructure",
                    location: "États-Unis",
                    transfer: "CCT",
                  },
                ].map((st) => (
                  <div key={st.name} className="border-l border-line pl-4">
                    <p className="font-medium text-blanc">{st.name}</p>
                    <p className="text-brume text-sm mt-0.5">{st.role}</p>
                    <p className="font-mono text-[11px] text-gris mt-1">
                      {st.location}
                      {st.transfer
                        ? `. Transfert hors UE encadré par des clauses contractuelles types (${st.transfer})`
                        : null}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-brume">
                Les transferts hors Union européenne vers les États-Unis sont
                encadrés par des clauses contractuelles types (CCT) approuvées
                par la Commission européenne, conformément à l&apos;article 46
                du RGPD.
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
              Durée de conservation
            </h2>
            <Prose>
              <ul className="list-none space-y-2">
                <li className="flex gap-2 items-start">
                  <span className="text-or-dim mt-px">·</span>
                  <span>
                    <strong className="font-medium text-blanc">
                      Prospects n&apos;ayant pas donné suite
                    </strong>{" "}
                    : données conservées 12 mois à compter du dernier contact,
                    puis supprimées.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-or-dim mt-px">·</span>
                  <span>
                    <strong className="font-medium text-blanc">
                      Prospects ayant pris rendez-vous
                    </strong>{" "}
                    : données conservées 3 ans à compter de la date du
                    rendez-vous, conformément aux obligations légales liées à la
                    relation commerciale.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-or-dim mt-px">·</span>
                  <span>
                    <strong className="font-medium text-blanc">
                      Réponses au diagnostic « Score de Préparation »
                    </strong>{" "}
                    : conservées 12 mois à compter de la soumission, puis
                    supprimées.
                  </span>
                </li>
              </ul>
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
              <p>
                Conformément au RGPD (articles 15 à 22), vous disposez des
                droits suivants sur vos données personnelles :
              </p>
              <ul className="list-none mt-3 space-y-1.5">
                {[
                  ["Accès", "connaître les données que nous détenons sur vous"],
                  [
                    "Rectification",
                    "corriger des données inexactes ou incomplètes",
                  ],
                  [
                    "Effacement",
                    "demander la suppression de vos données (droit à l'oubli)",
                  ],
                  [
                    "Opposition",
                    "vous opposer au traitement fondé sur l'intérêt légitime",
                  ],
                  [
                    "Portabilité",
                    "recevoir vos données dans un format structuré et lisible par machine",
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
                Pour exercer ces droits, adressez votre demande à :{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="text-brume hover:text-blanc transition-colors"
                >
                  {site.email}
                </a>
                . Nous nous engageons à répondre dans un délai d&apos;un mois.
              </p>
              <p className="mt-3">
                Si vous estimez que vos droits ne sont pas respectés, vous
                pouvez introduire une réclamation auprès de la{" "}
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

          <Rule />

          {/* Cookies et traçage */}
          <Block id="cookies" label="Cookies">
            <h2
              id="cookies"
              className="font-serif text-xl font-light text-blanc mb-4"
            >
              Cookies et traçage
            </h2>
            <Prose>
              <p>
                Le site n&apos;utilise actuellement aucun cookie de traçage
                publicitaire. Un outil d&apos;analyse d&apos;audience
                (analytics) est en cours d&apos;intégration ; lorsqu&apos;il
                sera actif, vous en serez informé et votre consentement sera
                recueilli conformément aux recommandations de la CNIL avant tout
                dépôt de traceur.
              </p>
              <p className="mt-3">
                Des cookies strictement nécessaires au fonctionnement technique
                du site (session, sécurité) peuvent être déposés sans
                consentement préalable conformément à l&apos;exemption prévue
                par la CNIL.
              </p>
            </Prose>
          </Block>

          <Rule className="mt-4" />

          {/* Note de bas de page */}
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
