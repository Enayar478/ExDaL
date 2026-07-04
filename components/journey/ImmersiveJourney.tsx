"use client";

import { Children, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Voyage immersif — « vers la lumière, dans les profondeurs ».
 * Viewport fixe en perspective : on ne scrolle pas verticalement, on s'enfonce
 * sur l'axe Z. Chaque palier (slab) surgit du lointain, fonce au centre (net,
 * plein écran), puis nous traverse pendant que le suivant émerge. Un halo doré
 * enfle à mesure qu'on approche de la lumière (la prise de RDV).
 *
 * Couche purement visuelle : le HTML/copie est inchangé (SEO/a11y intacts).
 * `prefers-reduced-motion` → aucun effet, scroll vertical classique (paliers
 * empilés, entièrement lisibles et navigables au clavier).
 */
const Z_FAR = 3000; // éloignement d'arrivée
const Z_NEAR = 900; // dépassement vers la caméra
const LEAD = 0.5; // marge pour que le dernier palier arrive avant la fin

export function ImmersiveJourney({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const slabs = Children.toArray(children);
  const n = slabs.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const clamp = gsap.utils.clamp;
    const layers = Array.from(root.querySelectorAll<HTMLElement>(".journey-slab"));
    const light = root.querySelector<HTMLElement>(".journey-light");
    const bar = root.querySelector<HTMLElement>(".journey-bar");
    const track = root.querySelector<HTMLElement>(".journey-track");
    if (!track || layers.length === 0) return;

    root.classList.add("is-active");
    track.style.height = `${n * 100}svh`;

    let raf = 0;
    const render = (ratio: number) => {
      const travel = ratio * (n - 1 + LEAD);
      layers.forEach((layer, i) => {
        const p = travel - i;
        const z = p <= 0 ? p * Z_FAR : p * Z_NEAR;
        let opacity: number;
        if (p < -1) opacity = clamp(0, 1, 1 + (p + 1) * 1.2);
        else if (p <= 0) opacity = 1;
        else opacity = clamp(0, 1, 1 - p * 1.4);
        const blur = p < 0 ? Math.min(14, -p * 10) : Math.min(14, p * 12);

        if (opacity <= 0.005) {
          layer.style.visibility = "hidden";
          return;
        }
        layer.style.visibility = "visible";
        layer.style.transform = `translate(-50%, -50%) translateZ(${z.toFixed(0)}px)`;
        layer.style.opacity = opacity.toFixed(3);
        layer.style.filter = `blur(${blur.toFixed(2)}px)`;
        layer.style.zIndex = String(Math.round(1000 - Math.abs(p) * 10));
        layer.style.pointerEvents = Math.abs(p) < 0.4 ? "auto" : "none";
      });

      if (light) {
        light.style.opacity = (0.12 + ratio * 0.88).toFixed(3);
        light.style.transform = `scale(${(1 + ratio * 2.2).toFixed(3)})`;
      }
      if (bar) bar.style.transform = `scaleX(${ratio.toFixed(4)})`;

      // Palier actif (pour les points de progression) — throttlé via rAF.
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          setActive(clamp(0, n - 1, Math.round(travel)));
        });
      }
    };

    render(0);
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });

    return () => {
      st.kill();
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("is-active");
      track.style.height = "";
      layers.forEach((l) => {
        l.style.cssText = "";
      });
    };
  }, [n]);

  return (
    <div className="journey" ref={rootRef}>
      <div className="journey-viewport">
        <div className="journey-light" aria-hidden="true" />
        <div className="journey-stage">
          {slabs.map((slab, i) => (
            <div className="journey-slab" key={i} data-index={i}>
              {slab}
            </div>
          ))}
        </div>

        {/* Repères de descente — décoratifs, masqués aux lecteurs d'écran */}
        <div className="journey-progress" aria-hidden="true">
          <span className="journey-bar" />
        </div>
        <div className="journey-dots" aria-hidden="true">
          {slabs.map((_, i) => (
            <span
              key={i}
              className={`journey-dot${i === active ? " on" : ""}`}
            />
          ))}
        </div>
        <div
          className={`journey-hint${active > 0 ? " gone" : ""}`}
          aria-hidden="true"
        >
          Avancez vers la lumière<span>↓</span>
        </div>
      </div>

      {/* Piste de scroll : donne la longueur du voyage (hauteur pilotée en JS) */}
      <div className="journey-track" aria-hidden="true" />
    </div>
  );
}
