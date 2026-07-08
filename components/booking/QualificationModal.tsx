"use client";

import { useEffect, useRef, useState } from "react";
import type { PennylaneUsage, Segment, Stage } from "@/lib/validation/lead";
import { ChoiceGroup } from "@/components/booking/ChoiceGroup";
import { MonoLabel } from "@/components/ui/MonoLabel";

interface FormState {
  name: string;
  email: string;
  role: string;
  company: string;
  pennylane: PennylaneUsage | "";
  stage: Stage | "";
  website: string; // honeypot
}

const emptyForm: FormState = {
  name: "",
  email: "",
  role: "",
  company: "",
  pennylane: "",
  stage: "",
  website: "",
};

const pennylaneOptions = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
  { value: "bientot", label: "Bientôt / je l'envisage" },
] as const;

const stageOptions = [
  { value: "pilotage", label: "Piloter mon activité au quotidien" },
  { value: "cabinet", label: "Fiabiliser le reporting de mes clients" },
  { value: "operation", label: "Préparer une levée ou une cession" },
] as const;

export function QualificationModal({
  open,
  onClose,
  defaultStage,
  segment,
}: {
  open: boolean;
  onClose: () => void;
  defaultStage?: Stage;
  segment?: Segment;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Synchronise l'état d'ouverture avec l'élément <dialog> natif.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Stade effectif : choix explicite, sinon la porte pré-sélectionnée du sélecteur.
  const effectiveStage = form.stage || defaultStage || "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.role || !form.company) {
      setError("Merci de compléter votre identité.");
      return;
    }
    if (!form.pennylane) {
      setError("Indiquez votre usage de Pennylane.");
      return;
    }
    if (!effectiveStage) {
      setError("Indiquez à quel stade vous êtes.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, stage: effectiveStage, segment }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Une erreur est survenue. Réessayez.");
        setSubmitting(false);
        return;
      }

      // Redirection vers le créneau Cal.com prérempli.
      window.location.assign(result.data.calUrl);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="qualif-title"
      className="fixed left-1/2 top-1/2 m-0 max-h-[90dvh] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-noir-2 p-0 text-blanc backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <header className="flex items-baseline justify-between border-b border-line px-7 py-5">
          <MonoLabel tone="or">Échanger sur votre situation</MonoLabel>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="font-mono text-xs text-gris transition-colors hover:text-blanc"
          >
            Fermer ✕
          </button>
        </header>

        <div className="flex flex-col gap-7 px-7 py-7">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1">
              <MonoLabel tone="gris">1. Qui êtes-vous ?</MonoLabel>
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom"
                value={form.name}
                onChange={(v) => update("name", v)}
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                autoComplete="email"
              />
              <Field
                label="Rôle"
                value={form.role}
                onChange={(v) => update("role", v)}
                autoComplete="organization-title"
              />
              <Field
                label="Entreprise"
                value={form.company}
                onChange={(v) => update("company", v)}
                autoComplete="organization"
              />
            </div>
          </fieldset>

          <ChoiceGroup
            legend="2. Utilisez-vous Pennylane ?"
            name="pennylane"
            options={pennylaneOptions}
            value={form.pennylane}
            onChange={(v) => update("pennylane", v as PennylaneUsage)}
          />

          <ChoiceGroup
            legend="3. À quel stade êtes-vous ?"
            name="stage"
            options={stageOptions}
            value={effectiveStage}
            onChange={(v) => update("stage", v as Stage)}
          />

          {/* Honeypot anti-spam, invisible pour l'humain */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {error && (
            <p role="alert" className="font-mono text-xs text-or-dim">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-line px-7 py-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-or px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-noir transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Un instant…" : "Réserver l'échange"}
          </button>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
            Sans engagement. 20 minutes. Réponse sous 48h.
          </p>
        </footer>
      </form>
    </dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gris">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="border border-line bg-noir px-3 py-2.5 font-serif text-[15px] text-blanc outline-none transition-colors placeholder:text-gris focus:border-or-dim"
      />
    </label>
  );
}
