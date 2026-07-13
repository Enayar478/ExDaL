"use client";

import { useEffect, useState } from "react";

/**
 * Anneau de score /100 — le seul vrai point d'or du résultat.
 * L'arc se remplit à l'affichage (respecte prefers-reduced-motion).
 */
export function ScoreDial({ score, label }: { score: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  // Géométrie de l'anneau.
  const size = 200;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animation d'apparition : 0 → score. Le rendu initial reste à 0 pour que
  // la transition CSS (classe `.score-arc`) s'applique après le montage.
  // Le remplissage passe par un requestAnimationFrame (jamais un setState
  // synchrone dans l'effet) ; la transition est neutralisée en reduced-motion.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const dashOffset = circumference * (1 - shown / 100);

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score de préparation : ${clamped} sur 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Rail discret */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        {/* Arc de score */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-or)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="score-arc"
          style={{ filter: "drop-shadow(0 0 8px rgba(217, 178, 106, 0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[3.4rem] font-light leading-none text-or">
          {clamped}
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-gris">
          {label}
        </span>
      </div>
    </div>
  );
}
