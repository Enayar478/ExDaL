"use client";

import { useState, useRef, type FormEvent } from "react";
import { capture } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

type State = "idle" | "loading" | "success" | "error";

interface NewsletterFormProps {
  source?: string;
}

/**
 * Formulaire d'inscription newsletter « Lumen ».
 * Double opt-in : l'email de confirmation est envoyé côté serveur.
 * Honeypot anti-bot : champ `website` masqué, doit rester vide.
 */
export function NewsletterForm({ source = "footer" }: NewsletterFormProps) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          website: data.get("website") ?? "",
          source,
        }),
      });

      const json = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? "Une erreur est survenue. Réessayez.");
        setState("error");
        return;
      }

      capture(ANALYTICS_EVENTS.newsletterInscription, { source });
      setState("success");
    } catch {
      setErrorMsg(
        "Impossible de joindre le serveur. Vérifiez votre connexion.",
      );
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-or">
        Vérifiez votre boite mail pour confirmer.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {/* Honeypot, masqué visuellement et pour les lecteurs d'écran */}
      <input
        type="text"
        name="website"
        defaultValue=""
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />

      <div className="flex gap-2">
        <input
          ref={emailRef}
          type="email"
          name="email"
          required
          aria-label="Votre adresse email"
          placeholder="votre@email.fr"
          disabled={state === "loading"}
          className="
            min-w-0 flex-1
            border border-line bg-transparent
            px-3 py-2
            font-mono text-[12px] tracking-[0.04em] text-blanc
            placeholder:text-gris
            focus:border-or-dim focus:outline-none
            disabled:opacity-50
          "
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="
            shrink-0
            border border-line
            px-4 py-2
            font-mono text-[11px] uppercase tracking-[0.12em] text-brume
            transition-colors
            hover:border-or-dim hover:text-or
            disabled:opacity-50
            cursor-pointer
          "
        >
          {state === "loading" ? "…" : "S'inscrire"}
        </button>
      </div>

      {state === "error" && errorMsg && (
        <p
          role="alert"
          className="font-mono text-[11px] tracking-[0.06em] text-brume"
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
