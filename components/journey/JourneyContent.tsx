"use client";

import { useState } from "react";
import Image from "next/image";
import { ImmersiveJourney } from "@/components/journey/ImmersiveJourney";

/**
 * Le contenu du voyage : chaque palier reprend le copy validé (refonte tunnel).
 * Le formulaire de qualification EST le voyage — on s'enfonce en répondant, et
 * on débouche dans la lumière sur la prise de rendez-vous (POST /api/lead réel
 * puis redirection vers le créneau Cal.eu prérempli). En reduced-motion, les
 * paliers s'empilent en flux normal : tout reste lisible et navigable.
 *
 * Ordre (arbitré depuis 3 propositions copy + reco growth / psychology-ux) :
 * Hero → Problème → Preuve → Offres → Méthode → Pourquoi (pic) → Qualif ×3 → Arrivée.
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

const stageOptions: { value: Stage; label: string }[] = [
  { value: "pilotage", label: "Je veux piloter clair au quotidien" },
  { value: "cabinet", label: "Je sers des clients sous Pennylane" },
  { value: "operation", label: "Je prépare une levée ou une cession" },
];

const steps: { k: string; title: string; body: string }[] = [
  {
    k: "01",
    title: "L'échange",
    body: "Vingt minutes pour comprendre votre situation. Sans engagement.",
  },
  {
    k: "02",
    title: "Le diagnostic",
    body: "J'identifie où dort la donnée, ce qui est fiable, ce qui manque. Vous repartez avec une image claire — même sans suite.",
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

  async function book() {
    setError(null);
    if (!form.name || !form.email || !form.role || !form.company)
      return setError(
        "Complétez votre identité au palier « faisons connaissance ».",
      );
    if (!form.pennylane) return setError("Indiquez votre usage de Pennylane.");
    if (!form.stage) return setError("Indiquez où vous en êtes.");
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
    <ImmersiveJourney>
      {/* 0 — HERO */}
      <section aria-label="Introduction">
        <Image
          src="/emblem.png"
          alt="Emblème ExDaL — un point de lumière né de la donnée"
          width={240}
          height={240}
          priority
          className="j-emblem"
        />
        <p className="j-eyebrow">De la donnée · la lumière</p>
        <h1 className="j-h1">
          Vos données Pennylane,
          <br />
          enfin <em>lisibles</em>.
        </h1>
        <p className="j-sub">
          Analytics engineer spécialiste Pennylane. Je réconcilie vos ventes,
          votre compta et vos paiements en tableaux de bord fiables — et en
          dossiers que même un investisseur respecte.
        </p>
        <span className="j-shaft" aria-hidden="true" />
      </section>

      {/* 1 — PROBLÈME */}
      <section aria-label="Le problème">
        <p className="j-eyebrow">Le problème</p>
        <h2 className="j-h2">
          Votre donnée sait déjà tout.
          <br />
          <em>Elle ne vous dit rien.</em>
        </h2>
        <p className="j-sub">
          Vos ventes dans un outil, votre compta dans Pennylane, vos paiements
          ailleurs. Chacun a raison dans son coin — ensemble, ils ne vous disent
          rien de clair, et vous pilotez au ressenti. C&rsquo;est suffisant.
          Jusqu&rsquo;au jour où un investisseur, un acquéreur — ou vous-même —
          exige les vrais chiffres. Ce jour-là : la course en urgence, ou la
          facture à cinq chiffres.
        </p>
        <ul className="j-tensions">
          <li className="j-tension">
            Piloter sans voir — les décisions prises trop tard, au jugé.
          </li>
          <li className="j-tension">
            La due diligence subie — des semaines à rassembler ce qui aurait dû
            être prêt.
          </li>
          <li className="j-tension">
            La valeur laissée sur la table — vendre sans pouvoir prouver ce que
            vaut l&rsquo;entreprise.
          </li>
        </ul>
      </section>

      {/* 2 — LA PREUVE (autorité + ancre de valeur 44 000 €) */}
      <section aria-label="La preuve">
        <p className="j-eyebrow">Pourquoi cette compétence est rare</p>
        <p className="j-quote">
          «&nbsp;J&rsquo;ai produit ces chiffres <em>pour de vrai</em>. Sous
          pression.&nbsp;»
        </p>
        <p className="j-sub">
          J&rsquo;ai préparé la donnée financière qui a servi à la cession
          d&rsquo;une entreprise — ARR, MRR, current trading, cohortes — dans le
          calme, avant que l&rsquo;urgence impose son prix. La plupart des data
          engineers n&rsquo;ont jamais lu un compte de résultat. Je fais les
          deux : le pipeline et la finance. C&rsquo;est la seule raison pour
          laquelle ce que je produis tient le jour où ça compte.
        </p>
        <p className="j-anchor">
          Un cabinet de transaction facturait <em>44 000 €</em> pour un livrable
          équivalent.
        </p>
      </section>

      {/* 3 — OFFRES */}
      <section aria-label="Les offres">
        <p className="j-eyebrow">Trois manières de faire parler vos chiffres</p>
        <div className="j-offers">
          <div className="j-offer">
            <span className="j-offer-k">Le Socle · Clarté</span>
            <span className="j-offer-b">
              Pour piloter enfin sur des données fiables.
            </span>
            Réconciliation Pennylane, CRM et paiements ; des tableaux de bord
            que vous lisez en deux minutes.
          </div>
          <div className="j-offer j-offer-mid">
            <span className="j-offer-badge">Le choix évident</span>
            <span className="j-offer-k">Le Pilotage · Maîtrise</span>
            <span className="j-offer-b">
              Pour que vos chiffres travaillent chaque mois.
            </span>
            Le Socle, plus un suivi mensuel : vos métriques à jour sans y
            penser. Le choix de ceux qui n&rsquo;y reviennent plus.
          </div>
          <div className="j-offer">
            <span className="j-offer-k">L&rsquo;Opération · Précision</span>
            <span className="j-offer-b">
              Pour une levée ou une cession qui se tient.
            </span>
            ARR, MRR, current trading, cohortes — les fichiers qu&rsquo;un
            investisseur exige, construits avant qu&rsquo;il les réclame.
          </div>
        </div>
        <p className="j-note">
          Je produis et fiabilise la donnée. La certification des comptes reste
          l&rsquo;affaire de votre expert-comptable.
        </p>
      </section>

      {/* 4 — LA MÉTHODE */}
      <section aria-label="La méthode">
        <p className="j-eyebrow">Comment ça se passe</p>
        <h2 className="j-h2">
          Quatre temps. Un seul difficile —
          <br />
          et il est <em>pour moi</em>.
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

      {/* 5 — LE POURQUOI (pic émotionnel) */}
      <section aria-label="Le pourquoi">
        <p className="j-eyebrow">Ce en quoi je crois</p>
        <p className="j-manifesto">
          Une entreprise ne devrait jamais avancer à l&rsquo;aveugle. Ni au
          quotidien, ni le jour décisif où elle se vend.
          <br />
          La donnée qui vous rend puissant existe déjà. Elle attend seulement
          qu&rsquo;on lui donne la parole.
        </p>
        <p className="j-signature">Ex Datis Lumen</p>
      </section>

      {/* 6 — QUALIFICATION · identité */}
      <section aria-label="Qui êtes-vous">
        <p className="j-qlabel">01 — Faisons connaissance</p>
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

      {/* 7 — QUALIFICATION · Pennylane */}
      <section aria-label="Usage de Pennylane">
        <p className="j-qlabel">02 — Votre outil</p>
        <h2 className="j-h2">
          Vous utilisez <em>Pennylane</em> ?
        </h2>
        <JChoice
          name="pennylane"
          options={pennylaneOptions}
          value={form.pennylane}
          onChange={(v) => set("pennylane", v as Pennylane)}
        />
      </section>

      {/* 8 — QUALIFICATION · stade */}
      <section aria-label="Votre moment">
        <p className="j-qlabel">03 — Votre moment</p>
        <h2 className="j-h2">Où en êtes-vous ?</h2>
        <JChoice
          name="stage"
          options={stageOptions}
          value={form.stage}
          onChange={(v) => set("stage", v as Stage)}
        />
      </section>

      {/* 9 — ARRIVÉE DANS LA LUMIÈRE */}
      <section aria-label="Prendre rendez-vous" className="j-arrival">
        <p className="j-qlabel j-arrived">La lumière</p>
        <h2 className="j-h2">Parlons de vos chiffres.</h2>
        <p className="j-sub">
          Vingt minutes. Vous repartez avec une idée claire de ce que votre
          donnée peut vous dire — que l&rsquo;on travaille ensemble ou non.
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
          {submitting ? "Un instant…" : "Accéder au calendrier"}
        </button>
        <p className="j-consent">
          Sans engagement · Pas de relance commerciale · Réponse sous 48h. En
          continuant, vous acceptez le traitement de vos informations —{" "}
          <a href="/mentions-legales">confidentialité</a>.
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
