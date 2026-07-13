"use client";

import { useEffect, useState } from "react";

/**
 * Barre de progression de lecture — filet d'or en haut de page qui se remplit
 * au scroll, reprend le motif de la home. Throttlé par requestAnimationFrame ;
 * aucun setState synchrone dans l'effet (init différé en rAF).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // Init différé (pas de setState synchrone dans le corps de l'effet).
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-[2px] bg-line/40"
      role="progressbar"
      aria-label="Progression de lecture"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <span
        className="block h-full origin-left bg-or"
        style={{
          transform: `scaleX(${progress})`,
          boxShadow: "0 0 10px var(--color-or)",
        }}
      />
    </div>
  );
}
