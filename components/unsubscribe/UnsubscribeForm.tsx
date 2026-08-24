"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * Formulaire de désinscription du nurturing (app/desinscription).
 *
 * AUCUNE action au chargement de la page : les scanners antispam suivent les
 * liens automatiquement, agir dès le GET désabonnerait des gens à leur insu.
 * L'action ne part qu'au clic explicite sur le bouton, en POST vers l'API.
 *
 * La réponse serveur est neutre par construction (jamais d'oracle sur la
 * validité du token) : on affiche donc la même confirmation calme, que le
 * lien soit valide ou non. Seule une vraie panne réseau (fetch qui lève)
 * affiche un message d'erreur distinct, honnête sur ce point précis.
 */
export function UnsubscribeForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>("idle");

  if (!token) {
    return (
      <p className="text-[15px] leading-relaxed text-brume">
        Ce lien ne semble pas complet. Écrivez-nous à{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-brume underline transition-colors hover:text-blanc"
        >
          {site.email}
        </a>{" "}
        pour ne plus recevoir ces emails.
      </p>
    );
  }

  if (status === "done") {
    return (
      <p className="text-[15px] leading-relaxed text-blanc">
        C&apos;est fait. Vous ne recevrez plus ces emails.
      </p>
    );
  }

  async function handleClick() {
    setStatus("submitting");
    try {
      await fetch("/api/nurture/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "submitting"}
        className="w-fit rounded-sm bg-or px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-noir transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Un instant…" : "Me désinscrire"}
      </button>
      {status === "error" && (
        <p role="alert" className="font-mono text-xs text-or-dim">
          Connexion impossible. Vérifiez votre réseau et réessayez.
        </p>
      )}
    </div>
  );
}
