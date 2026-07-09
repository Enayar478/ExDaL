"use client";

import { useState } from "react";
import Image from "next/image";
import { ImmersiveJourney } from "@/components/journey/ImmersiveJourney";

/**
 * Le contenu du voyage : chaque palier reprend le copy validé (refonte tunnel).
 * Le formulaire de qualification EST le voyage : on s'enfonce en répondant, et
 * on débouche dans la lumière sur la prise de rendez-vous (POST /api/lead réel
 * puis redirection vers le créneau Cal.eu prérempli). En reduced-motion, les
 * paliers s'empilent en flux normal : tout reste lisible et navigable.
 *
 * Parcours adaptatif : la BIFURCATION (palier 1) capte le profil du visiteur,
 * et les paliers suivants s'adaptent (titre + symptômes du Problème, illustration
 * de la Preuve, ancre de valeur, offre recommandée). Même parcours pour tous ;
 * seul le texte s'ajuste.
 * Arc : Hero, Bifurcation, Problème (douleur), Le gain (espoir), Preuve
 * (crédibilité), Offre, Méthode, Pourquoi, Identité, Pennylane, Arrivée.
 */
type Pennylane = "oui" | "bientot" | "non";
type Stage = "pilotage" | "cabinet" | "operation";

interface FormState {
  name: string;
  email: string;
  role: string;
  company: string;
  pennylane: Pennylane | "";
  stage: Stage | "";
  website: string; // honeypot
}

const empty: FormState = {
  name: "",
  email: "",
  role: "",
  company: "",
  pennylane: "",
  stage: "",
  website: "",
};

const pennylaneOptions: { value: Pennylane; label: string }[] = [
  { value: "oui", label: "Oui, notre outil principal" },
  { value: "bientot", label: "Pas encore, je l'envisage" },
  { value: "non", label: "Nous utilisons autre chose" },
];

// La question de bifurcation : elle capte le profil et pilote tout l'adaptatif.
const stageOptions: { value: Stage; label: string }[] = [
  { value: "pilotage", label: "Piloter mon activité au quotidien" },
  { value: "cabinet", label: "Fiabiliser le reporting de mes clients" },
  { value: "operation", label: "Préparer une levée ou une cession" },
];

// Symptômes concrets, propres à chaque profil (le visiteur doit se reconnaître).
const symptoms: Record<Stage, string[]> = {
  pilotage: [
    "Vos exports Pennylane finissent dans un Excel rafistolé, chaque fin de mois.",
    "Vos équipes ressaisissent à la main des chiffres déjà présents dans votre CRM ou vos paiements.",
    "Vous décidez au ressenti, faute d'un tableau de bord fiable sous les yeux.",
  ],
  cabinet: [
    "Chaque client réclame son reporting, et chacun repart d'un fichier refait à la main.",
    "Vos collaborateurs passent des heures à consolider ce que Pennylane pourrait sortir seul.",
    "Vous vendez du conseil, mais votre équipe produit surtout de la ressaisie.",
  ],
  operation: [
    "Impossible de sortir un ARR ou une cohorte propre sans y passer la nuit.",
    "La due diligence approche, et rien n'est prêt : ni le current trading, ni l'historique fiable.",
    "Sans dossier qui tient, vous négociez la valeur de l'entreprise à l'aveugle.",
  ],
};

// Titre du palier Problème, propre à chaque profil (la 2e ligne, en or).
const problemTitle: Record<Stage, { top: string; punch: string }> = {
  pilotage: {
    top: "Vos chiffres savent tout.",
    punch: "Vous pilotez à l'aveugle.",
  },
  cabinet: {
    top: "La donnée de vos clients est là.",
    punch: "Votre équipe la ressaisit.",
  },
  operation: {
    top: "Tout est dans vos chiffres.",
    punch: "Rien n'est prêt pour l'investisseur.",
  },
};

// Preuve : même vécu réel (une cession préparée pour de vrai), orienté profil.
const proof: Record<Stage, string> = {
  pilotage:
    "La rigueur qu'exige une cession, où les chiffres tiennent sous le regard d'un investisseur, je la mets au service de votre pilotage.",
  cabinet:
    "La donnée que je produis a tenu face à une due diligence. C'est ce niveau de fiabilité que méritent les reportings de vos clients.",
  operation:
    "J'ai préparé la donnée financière qui a servi à la cession d'une entreprise : ARR, MRR, current trading, cohortes. Dans le calme, avant que l'urgence impose son prix.",
};

// Ancre de valeur, collée à l'offre. 44 000 € pour la cession (chiffre réel du
// brief) ; ailleurs, une ancre d'aversion à la perte, sans chiffre inventé.
const valueAnchorAlt: Record<"pilotage" | "cabinet", string> = {
  pilotage:
    "Chaque mois au ressenti coûte plus qu'on ne croit : des heures, des erreurs, des décisions prises trop tard.",
  cabinet:
    "La ressaisie de vos équipes coûte, mois après mois, plus qu'un reporting fiabilisé une bonne fois.",
};

// Les trois offres. Le parcours n'en met en avant qu'UNE, celle du profil ;
// les deux autres sont évoquées en progression (jamais un menu à re-choisir).
const offers: Record<
  string,
  { name: string; benefit: string; detail: string }
> = {
  socle: {
    name: "Le Socle",
    benefit: "Piloter sur des données fiables.",
    detail:
      "Réconciliation Pennylane, CRM et paiements, en tableaux de bord clairs.",
  },
  pilotage: {
    name: "Le Pilotage",
    benefit: "Vos chiffres à jour chaque mois.",
    detail: "Le Socle, plus un suivi mensuel, sans y penser.",
  },
  operation: {
    name: "L'Opération",
    benefit: "Une levée ou une cession qui se tient.",
    detail: "ARR, MRR, cohortes : les fichiers qu'un investisseur exige.",
  },
};

// L'offre recommandée pour chaque profil.
const recommendedOffer: Record<Stage, keyof typeof offers> = {
  pilotage: "socle",
  cabinet: "pilotage",
  operation: "operation",
};

// La gamme, présentée comme une progression (contexte), pas comme un choix.
const offerLadder: Record<Stage, string> = {
  pilotage:
    "La suite, le moment venu : Le Pilotage pour un suivi mensuel, puis L'Opération pour une levée ou une cession.",
  cabinet:
    "Le Pilotage part du Socle. Pour une levée ou une cession, il y a L'Opération.",
  operation: "L'Opération intègre tout le quotidien : Le Socle et Le Pilotage.",
};

const steps: { k: string; title: string; body: string }[] = [
  {
    k: "01",
    title: "L'échange",
    body: "Comprendre votre situation, de vive voix.",
  },
  {
    k: "02",
    title: "Le diagnostic",
    body: "J'identifie où dort la donnée, ce qui est fiable, ce qui manque. Vous repartez avec une image claire, même sans suite.",
  },
  {
    k: "03",
    title: "La construction",
    body: "Le travail invisible : pipelines, réconciliation, fiabilisation.",
  },
  {
    k: "04",
    title: "La lumière",
    body: "Une clarté qui tient seule. Et, si vous le souhaitez, je veille dessus.",
  },
];

export function JourneyContent() {
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // Profil retenu pour l'adaptatif (défaut : pilotage, le segment le plus large).
  const profile: Stage = form.stage || "pilotage";
  const rec = offers[recommendedOffer[profile]];

  async function book() {
    setError(null);
    if (!form.stage)
      return setError(
        "Dites-moi d'abord ce qui vous amène, au tout début du parcours.",
      );
    if (!form.name || !form.email || !form.role || !form.company)
      return setError(
        "Complétez votre identité au palier « faisons connaissance ».",
      );
    if (!form.pennylane) return setError("Indiquez votre usage de Pennylane.");
    if (form.website) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Une erreur est survenue. Réessayez.");
        setSubmitting(false);
        return;
      }
      window.location.assign(json.data.calUrl);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <ImmersiveJourney gateIndex={1} gateOpen={Boolean(form.stage)}>
      {/* 0 — HERO (2 colonnes sur desktop : texte à gauche, emblème à droite) */}
      <section aria-label="Introduction" className="j-hero">
        <Image
          src="/emblem.png"
          alt="Emblème ExDaL, un point de lumière né de la donnée"
          width={240}
          height={240}
          priority
          className="j-emblem j-hero-emblem"
        />
        <div className="j-hero-text">
          <h1 className="j-h1">
            Pennylane tient vos comptes.
            <br />
            J&rsquo;en tire <em>vos décisions</em>.
          </h1>
          <p className="j-sub">
            Studio de data financière, spécialiste Pennylane.
          </p>
          <span className="j-shaft" aria-hidden="true" />
        </div>
      </section>

      {/* 1 — BIFURCATION (capte le profil, pilote l'adaptatif) */}
      <section aria-label="Ce qui vous amène">
        <p className="j-eyebrow">Commençons par vous</p>
        <h2 className="j-h2">Qu&rsquo;est-ce qui vous amène&nbsp;?</h2>
        <p className="j-sub">La suite s&rsquo;adapte à votre réponse.</p>
        <JChoice
          name="stage"
          options={stageOptions}
          value={form.stage}
          onChange={(v) => set("stage", v as Stage)}
        />
        <p className="j-fieldnote">
          Un doute&nbsp;? Prenez le cas le plus proche, on affinera à
          l&rsquo;échange.
        </p>
      </section>

      {/* 2 — PROBLÈME (douleur, adaptée au profil) */}
      <section aria-label="Le problème">
        <p className="j-eyebrow">Ce que je vois</p>
        <h2 className="j-h2">
          {problemTitle[profile].top}
          <br />
          <em>{problemTitle[profile].punch}</em>
        </h2>
        <ul className="j-tensions">
          {symptoms[profile].map((s) => (
            <li key={s} className="j-tension">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* 3 — LE GAIN (l'espoir : ce que ça change, sans chiffre inventé) */}
      <section aria-label="Ce que ça change">
        <p className="j-eyebrow">Ce que ça change</p>
        <h2 className="j-h2">Le calcul est simple.</h2>
        <dl className="j-ledger">
          <div className="j-ledger-row">
            <dt className="j-ledger-fig">Des heures</dt>
            <dd className="j-ledger-label">
              d&rsquo;analyse et de ressaisie en moins, chaque semaine.
            </dd>
          </div>
          <div className="j-ledger-row">
            <dt className="j-ledger-fig">Zéro</dt>
            <dd className="j-ledger-label">
              double-saisie, zéro fichier tampon. Fini les erreurs coûteuses.
            </dd>
          </div>
          <div className="j-ledger-row">
            <dt className="j-ledger-fig">D&rsquo;avance</dt>
            <dd className="j-ledger-label">
              les chiffres qu&rsquo;on réclame en urgence sont déjà prêts.
            </dd>
          </div>
        </dl>
      </section>

      {/* 4 — LA PREUVE (crédibilité : même vécu réel, orienté profil) */}
      <section aria-label="La preuve">
        <p className="j-eyebrow">Une compétence rare</p>
        <p className="j-quote">
          «&nbsp;J&rsquo;ai produit ces chiffres <em>pour de vrai</em>. Sous
          pression.&nbsp;»
        </p>
        <p className="j-sub">{proof[profile]}</p>
        <p className="j-sub">
          Data et finance : je fais les deux. C&rsquo;est ce qui fait
          qu&rsquo;un dossier tient le jour où ça compte.
        </p>
      </section>

      {/* 5 — OFFRE RECOMMANDÉE (répond au profil) + ancre + gamme */}
      <section aria-label="Votre offre">
        <p className="j-eyebrow">Ce que je vous recommande</p>
        <div className="j-offer-solo">
          <span className="j-offer-badge">Pour vous</span>
          <span className="j-offer-k">{rec.name}</span>
          <span className="j-offer-b">{rec.benefit}</span>
          {rec.detail}
        </div>
        {profile === "operation" ? (
          <p className="j-anchor">
            Un cabinet de transaction facturait <em>44&nbsp;000&nbsp;€</em> pour
            le même dossier.
          </p>
        ) : (
          <p className="j-anchor">
            {valueAnchorAlt[profile as "pilotage" | "cabinet"]}
          </p>
        )}
        <p className="j-ladder">{offerLadder[profile]}</p>
        <p className="j-note">
          Je fiabilise la donnée ; la certification des comptes reste votre
          expert-comptable.
        </p>
      </section>

      {/* 6 — LA MÉTHODE */}
      <section aria-label="La méthode">
        <p className="j-eyebrow">La méthode</p>
        <h2 className="j-h2">
          Quatre temps. Un seul difficile.
          <br />
          Et il est <em>pour moi</em>.
        </h2>
        <ol className="j-steps">
          {steps.map((s) => (
            <li key={s.k} className="j-step">
              <span className="j-step-k">{s.k}</span>
              <span className="j-step-t">{s.title}</span>
              <span className="j-step-b">{s.body}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 7 — LE POURQUOI (pic émotionnel) */}
      <section aria-label="Le pourquoi">
        <p className="j-manifesto">
          Une entreprise ne devrait jamais avancer à l&rsquo;aveugle. Ni au
          quotidien, ni le jour décisif où elle se vend.
          <br />
          La donnée qui vous rend puissant existe déjà. Elle attend seulement
          qu&rsquo;on lui donne la parole.
        </p>
        <p className="j-signature">Ex Datis Lumen</p>
      </section>

      {/* 8 — QUALIFICATION identité */}
      <section aria-label="Qui êtes-vous">
        <p className="j-qlabel">01. Faisons connaissance</p>
        <h2 className="j-h2">Vous êtes&hellip;</h2>
        <div className="j-fields">
          <JField
            label="Nom"
            value={form.name}
            onChange={(v) => set("name", v)}
            autoComplete="name"
          />
          <JField
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            autoComplete="email"
          />
          <JField
            label="Rôle"
            value={form.role}
            onChange={(v) => set("role", v)}
            autoComplete="organization-title"
          />
          <JField
            label="Entreprise"
            value={form.company}
            onChange={(v) => set("company", v)}
            autoComplete="organization"
          />
        </div>
        <p className="j-fieldnote">
          Ces informations préparent notre échange, pour que les vingt minutes
          vous appartiennent.
        </p>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </section>

      {/* 9 — QUALIFICATION Pennylane */}
      <section aria-label="Usage de Pennylane">
        <p className="j-qlabel">02. Votre outil</p>
        <h2 className="j-h2">
          Vous utilisez <em>Pennylane</em>&nbsp;?
        </h2>
        <JChoice
          name="pennylane"
          options={pennylaneOptions}
          value={form.pennylane}
          onChange={(v) => set("pennylane", v as Pennylane)}
        />
      </section>

      {/* 10 — ARRIVÉE DANS LA LUMIÈRE */}
      <section aria-label="Prendre rendez-vous" className="j-arrival">
        <p className="j-qlabel j-arrived">La lumière</p>
        <h2 className="j-h2">Parlons de vos chiffres.</h2>
        <p className="j-sub">
          Vingt minutes. Vous repartez avec une lecture claire de ce que votre
          donnée peut vous dire, que l&rsquo;on travaille ensemble ou non.
          L&rsquo;échange ne coûte rien. Le temps perdu chaque mois, si.
        </p>
        {error && (
          <p role="alert" className="j-error">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={book}
          disabled={submitting}
          className="j-btn"
        >
          {submitting ? "Un instant…" : "Réserver l'échange"}
        </button>
        <p className="j-consent">
          Sans engagement. Pas de relance commerciale. Réponse sous 48&nbsp;h.
          En continuant, vous acceptez le traitement de vos informations.{" "}
          <a href="/mentions-legales">Confidentialité</a>.
        </p>
      </section>
    </ImmersiveJourney>
  );
}

function JField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="j-field">
      <span className="j-field-l">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

function JChoice({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="j-opts" role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const picked = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={picked}
            onClick={() => onChange(o.value)}
            className={`j-opt${picked ? " picked" : ""}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
