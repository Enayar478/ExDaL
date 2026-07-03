import type { ReactNode } from "react";

/** Libellé mono en petites capitales (IBM Plex Mono) — eyebrows, mentions. */
export function MonoLabel({
  children,
  className = "",
  tone = "or-dim",
}: {
  children: ReactNode;
  className?: string;
  tone?: "or" | "or-dim" | "gris" | "brume";
}) {
  const tones = {
    or: "text-or",
    "or-dim": "text-or-dim",
    gris: "text-gris",
    brume: "text-brume",
  } as const;

  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.28em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
