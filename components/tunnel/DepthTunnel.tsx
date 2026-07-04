"use client";

import { Children, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Tunnel de profondeur (axe Z).
 * Chaque section reste centrée et voyage vers la caméra au fil du scroll :
 * elle arrive du lointain (petite, floue, transparente), atteint le centre
 * (nette, plein écran), puis dépasse et s'efface pendant que la suivante émerge.
 * Un halo doré enfle au fond à mesure qu'on s'enfonce.
 *
 * Couche purement visuelle : le HTML sous-jacent est inchangé (SEO/a11y intacts).
 * En `prefers-reduced-motion`, l'effet n'est jamais activé → scroll classique
 * élégant (les plans restent en flux normal, empilés verticalement).
 */
const Z_FAR = -1650; // profondeur d'arrivée (lointain)
const Z_NEAR = 520; // dépassement vers la caméra
const WINDOW = 0.62; // largeur de la fenêtre de vie d'un plan (en progress)

export function DepthTunnel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const clamp = gsap.utils.clamp;
    const layers = Array.from(el.querySelectorAll<HTMLElement>(".tunnel-layer"));
    const halo = el.querySelector<HTMLElement>(".tunnel-halo");
    const n = layers.length;
    if (n === 0) return;

    const render = (p: number) => {
      layers.forEach((layer, i) => {
        const center = n > 1 ? i / (n - 1) : 0;
        let t = (p - center) / WINDOW;
        // Le dernier plan approche puis reste (transition douce vers le contenu).
        if (i === n - 1) t = Math.min(t, 0);
        const dist = Math.abs(t);
        const opacity = clamp(0, 1, 1 - dist * 1.05);

        if (opacity <= 0.01) {
          layer.style.visibility = "hidden";
          return;
        }
        layer.style.visibility = "visible";
        const z = t <= 0 ? Z_FAR * clamp(0, 1, -t) : Z_NEAR * clamp(0, 1, t);
        const blur = clamp(0, 10, dist * 11);
        gsap.set(layer, {
          z,
          opacity,
          filter: `blur(${blur}px)`,
          pointerEvents: opacity > 0.65 ? "auto" : "none",
        });
      });

      if (halo) {
        gsap.set(halo, { scale: 0.5 + p * 1.3, opacity: 0.04 + p * 0.16 });
      }
    };

    el.classList.add("is-active");
    render(0);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: `+=${n * 90}%`,
      pin: true,
      scrub: true,
      onUpdate: (self) => render(self.progress),
      invalidateOnRefresh: true,
    });

    return () => {
      st.kill();
      el.classList.remove("is-active");
      layers.forEach((l) => {
        l.style.cssText = "";
      });
    };
  }, []);

  const items = Children.toArray(children);
  return (
    <div className="tunnel-viewport" ref={ref}>
      <div className="tunnel-halo" aria-hidden="true" />
      {items.map((child, i) => (
        <div className="tunnel-layer" key={i} data-index={i}>
          {child}
        </div>
      ))}
    </div>
  );
}
