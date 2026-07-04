"use client";

import { useState } from "react";
import { ImmersiveJourney } from "@/components/journey/ImmersiveJourney";

/**
 * Le contenu du voyage : chaque palier reprend le copy du brief, mot pour mot.
 * Le formulaire de qualification EST le voyage — on s'enfonce en répondant, et
 * on débouche dans la lumière sur la prise de rendez-vous (POST /api/lead réel
 * puis redirection vers le créneau Cal.eu prérempli). En reduced-motion, les
 * paliers s'empilent en flux normal : tout reste lisible et navigable.
 */
type Pennylane = "oui" | "non" | "bientot";
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
  { value: "oui", label: "Oui" },
  { value: "non", label: "Pas encore" },
  { value: "bientot", label: "Je l'envisage" },
];

const stageOptions: { value: Stage; label: string }[] = [
  { value: "pilotage", label: "Piloter au quotidien" },
  { value: "cabinet", label: "Je sers des clients sous Pennylane" },
  { value: "operation", label: "Je prépare une levée ou une vente" },
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
      return setError("Complétez votre identité au palier « faisons connaissance ».");
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
        <p className="j-eyebrow">De la donnée · la lumière</p>
        <h1 className="j-h1">
          De la donnée comptable,
          <br />
          des fichiers dignes d&rsquo;une <em>cession</em>.
        </h1>
        <span className="j-shaft" aria-hidden="true" />
      </section>

      {/* 1 — PROBLÈME */}
      <section aria-label="Le problème">
        <h2 className="j-h2">
          Votre donnée sait déjà tout.
          <br />
          <em>Elle ne vous dit rien.</em>
        </h2>
        <p className="j-sub">
          Vos ventes dans un outil, votre compta dans Pennylane, vos paiements
          ailleurs. Chacun a raison dans son coin — ensemble, ils ne vous disent
          rien de clair.
        </p>
      </section>

      {/* 2 — LA PREUVE */}
      <section aria-label="La preuve">
        <p className="j-quote">
          «&nbsp;J&rsquo;ai préparé la donnée financière qui a servi à la{" "}
          <em>cession d&rsquo;une entreprise</em>. Je connais les chiffres
          qu&rsquo;un investisseur exige — parce que je les ai produits, sous
          pression, pour de vrai.&nbsp;»
        </p>
      </section>

      {/* 3 — LE POURQUOI */}
      <section aria-label="Le pourquoi">
        <h2 className="j-h2">
          Et si vos chiffres vous rendaient <em>puissant</em> ?
        </h2>
        <p className="j-sub">
          Une entreprise ne devrait jamais avancer à l&rsquo;aveugle. La donnée
          qui vous rend puissant existe déjà.
          <br />
          Elle attend seulement qu&rsquo;on lui donne la parole.
        </p>
      </section>

      {/* 4 — OFFRES (ancre de valeur 44 000 €) */}
      <section aria-label="Les offres">
        <h2 className="j-h2">Trois manières de faire parler vos chiffres.</h2>
        <div className="j-offers">
          <div className="j-offer">
            <span className="j-offer-k">Le Socle</span>
            Votre donnée, enfin lisible — au quotidien.
          </div>
          <div className="j-offer j-offer-mid">
            <span className="j-offer-k">Le Pilotage</span>
            La clarté en continu. Le choix de ceux qui n&rsquo;y reviennent plus.
          </div>
          <div className="j-offer">
            <span className="j-offer-k">L&rsquo;Opération</span>
            Vos chiffres prêts pour l&rsquo;investisseur.
          </div>
        </div>
        <p className="j-anchor">
          Un cabinet de transaction facturait <em>44 000 €</em> pour un livrable
          équivalent.
        </p>
      </section>

      {/* 5 — QUALIFICATION · identité */}
      <section aria-label="Qui êtes-vous">
        <p className="j-qlabel">01 — Faisons connaissance</p>
        <h2 className="j-h2">Vous êtes&hellip;</h2>
        <div className="j-fields">
          <JField label="Nom" value={form.name} onChange={(v) => set("name", v)} autoComplete="name" />
          <JField label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
          <JField label="Rôle" value={form.role} onChange={(v) => set("role", v)} autoComplete="organization-title" />
          <JField label="Entreprise" value={form.company} onChange={(v) => set("company", v)} autoComplete="organization" />
        </div>
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

      {/* 6 — QUALIFICATION · Pennylane */}
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

      {/* 7 — QUALIFICATION · stade */}
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

      {/* 8 — ARRIVÉE DANS LA LUMIÈRE */}
      <section aria-label="Prendre rendez-vous" className="j-arrival">
        <p className="j-qlabel j-arrived">Vous êtes arrivé</p>
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
          Sans engagement · 20 minutes · Réponse sous 48h. En continuant, vous
          acceptez le traitement de vos informations —{" "}
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
