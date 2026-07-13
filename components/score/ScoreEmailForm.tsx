"use client";

import { useState, type FormEvent } from "react";
import { SCORE_COPY } from "@/lib/score/content";
import type { ScoreAnswers } from "@/lib/score/scoring";

type State = "idle" | "loading" | "success" | "error";

/**
 * Capture email de la page de résultat : envoie les réponses au serveur, qui
 * recalcule le score et retourne le plan personnalisé par email.
 * Honeypot anti-bot (`website`) et validation serveur (le score n'est jamais lu
 * depuis le client).
 */
export function ScoreEmailForm({ answers }: { answers: ScoreAnswers }) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;

    const data = new FormData(event.currentTarget);
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          website: data.get("website") ?? "",
          answers,
        }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? "Une erreur est survenue. Réessayez.");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("Impossible de joindre le serveur. Vérifiez votre connexion.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-or">
        Votre plan est en route. Vérifiez votre boîte mail.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {/* Honeypot — masqué visuellement et pour les lecteurs d'écran */}
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
          type="email"
          name="email"
          required
          aria-label="Votre adresse email"
          placeholder="votre@email.fr"
          disabled={state === "loading"}
          className="min-w-0 flex-1 border border-line bg-transparent px-3 py-2 font-mono text-[12px] tracking-[0.04em] text-blanc placeholder:text-gris focus:border-or-dim focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 cursor-pointer border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-brume transition-colors hover:border-or-dim hover:text-or disabled:opacity-50"
        >
          {state === "loading" ? "…" : SCORE_COPY.emailCta}
        </button>
      </div>

      {state === "error" && errorMsg && (
        <p role="alert" className="font-mono text-[11px] tracking-[0.06em] text-brume">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
