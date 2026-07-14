"use client";

import { Children, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { getLenis } from "@/components/tunnel/lenis-store";

/**
 * Voyage immersif, « vers la lumière, dans les profondeurs ».
 *
 * Navigation « pas à pas » verrouillée, IDENTIQUE sur desktop et tactile : le
 * scroll de page est bloqué et l'on avance palier par palier, chaque arrêt net
 * à 100 %, franc et lisible (sur desktop, le scroll libre partait vite en
 * vrille). Les gestes diffèrent seulement selon l'appareil :
 *  • Desktop (pointeur fin) : molette / trackpad + clavier.
 *  • Tactile (mobile/tablette) : swipe (haut/bas ou gauche/droite) + clavier.
 *
 * Couche visuelle : le HTML/copie est inchangé (SEO/a11y intacts). En
 * `prefers-reduced-motion`, aucun effet : scroll vertical classique, accessible.
 */
const Z_FAR = 3000;
const Z_NEAR = 900;

export function ImmersiveJourney({
  children,
  gateIndex = -1,
  gateOpen = true,
  advanceOn = 0,
}: {
  children: React.ReactNode;
  /** Palier au-delà duquel on bloque tant que `gateOpen` est faux (-1 = aucun). */
  gateIndex?: number;
  /** Le verrou est-il levé ? (ex. la bifurcation a reçu un choix) */
  gateOpen?: boolean;
  /** Compteur impératif : à chaque incrément, on glisse d'un palier si l'on est
   *  posé sur le verrou (ex. un choix validé sur la bifurcation → enchaînement auto). */
  advanceOn?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [touch, setTouch] = useState(false);
  const slabs = Children.toArray(children);
  const n = slabs.length;

  // Refs lues par les closures de navigation : le verrou peut s'ouvrir sans
  // recréer l'effet (dépendant de [n]). Synchronisées hors render.
  const gateIndexRef = useRef(gateIndex);
  const gateOpenRef = useRef(gateOpen);
  useEffect(() => {
    gateIndexRef.current = gateIndex;
    gateOpenRef.current = gateOpen;
  }, [gateIndex, gateOpen]);

  // Pont impératif vers la navigation interne (définie dans l'effet [n]) :
  // permet au contenu de demander un enchaînement sans connaître l'état du moteur.
  const goRef = useRef<((dir: number) => void) | null>(null);
  const stepRef = useRef(0);

  // Enchaînement automatique : à chaque incrément de `advanceOn` (un choix validé),
  // si l'on est posé sur le palier-verrou, on glisse vers le suivant. Court délai
  // pour laisser le choix s'afficher avant de partir. No-op en reduced-motion.
  useEffect(() => {
    if (advanceOn <= 0) return;
    if (gateIndex >= 0 && stepRef.current !== gateIndex) return;
    const t = window.setTimeout(() => goRef.current?.(1), 320);
    return () => window.clearTimeout(t);
  }, [advanceOn, gateIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const clamp = gsap.utils.clamp;
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>(".journey-slab"),
    );
    const light = root.querySelector<HTMLElement>(".journey-light");
    const bar = root.querySelector<HTMLElement>(".journey-bar");
    const viewport = root.querySelector<HTMLElement>(".journey-viewport");
    const track = root.querySelector<HTMLElement>(".journey-track");
    const steps = n - 1;
    if (!track || !viewport || layers.length === 0) return;

    // Profondeur maximale atteignable : bornée au verrou tant qu'il est fermé.
    const maxTravel = () =>
      gateIndexRef.current >= 0 && !gateOpenRef.current
        ? Math.min(gateIndexRef.current, steps)
        : steps;

    let rafId = 0;
    /** Positionne tous les paliers pour une profondeur `travel` ∈ [0, n-1]. */
    const renderTravel = (travel: number) => {
      const cap = maxTravel();
      if (travel > cap) travel = cap; // le verrou fige la scène sur le palier bloquant
      const ratio = steps > 0 ? clamp(0, 1, travel / steps) : 0;
      layers.forEach((layer, i) => {
        const p = travel - i;
        const ap = Math.abs(p);
        // Fondu symétrique : seul le palier centré est net ; les voisins
        // disparaissent complètement → arrêt franc, sans flou résiduel.
        const opacity = clamp(0, 1, 1 - ap * 1.25);
        if (opacity <= 0.004) {
          layer.style.visibility = "hidden";
          return;
        }
        layer.style.visibility = "visible";
        const z = p <= 0 ? p * Z_FAR : p * Z_NEAR;
        const blur = Math.min(12, ap * 13);
        layer.style.transform = `translate(-50%, -50%) translateZ(${z.toFixed(0)}px)`;
        layer.style.opacity = opacity.toFixed(3);
        layer.style.filter =
          blur < 0.06 ? "none" : `blur(${blur.toFixed(2)}px)`;
        layer.style.zIndex = String(Math.round(1000 - ap * 10));
        layer.style.pointerEvents = ap < 0.35 ? "auto" : "none";
      });
      if (light) {
        light.style.opacity = (0.1 + ratio * 0.72).toFixed(3);
        light.style.transform = `scale(${(1 + ratio * 2).toFixed(3)})`;
      }
      if (bar) bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          setActive(clamp(0, steps, Math.round(travel)));
        });
      }
    };

    root.classList.add("is-active");
    document.body.classList.add("journey-on");
    renderTravel(0);

    setTouch(
      window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 820px)").matches,
    );

    // ── Navigation « pas à pas » verrouillée (desktop + tactile) ─────────────
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    viewport.style.touchAction = "none";
    track.style.height = "0px";

    // Lenis (scroll fluide global) doit relâcher la molette pendant l'immersion,
    // sinon il se bat avec notre navigation pas à pas.
    const lenis = getLenis();
    lenis?.stop();

    let step = 0;
    stepRef.current = 0;
    let cur = 0; // profondeur courante (animée à la main, sans dépendance ticker)
    let animId = 0;
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const animateTo = (targetTravel: number) => {
      cancelAnimationFrame(animId);
      const from = cur;
      const startTime = performance.now();
      const duration = 620;
      const frame = (now: number) => {
        const k = Math.min(1, (now - startTime) / duration);
        cur = from + (targetTravel - from) * easeInOut(k);
        renderTravel(cur);
        if (k < 1) animId = requestAnimationFrame(frame);
      };
      animId = requestAnimationFrame(frame);
    };
    const go = (dir: number) => {
      const target = clamp(0, maxTravel(), step + dir);
      if (target === step) return;
      step = target;
      stepRef.current = step;
      animateTo(step);
    };
    goRef.current = go;

    //, Tactile : swipe (vertical prioritaire ; haut / gauche = avancer) ·
    let sx = 0,
      sy = 0,
      stime = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      stime = Date.now();
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Date.now() - stime > 900) return;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (Math.max(adx, ady) < 42) return; // simple tap → ignoré
      if (ady >= adx) go(dy < 0 ? 1 : -1);
      else go(dx < 0 ? 1 : -1);
    };

    //, Desktop : molette / trackpad (un cran par geste) ·
    // Verrou de durée FIXE, calé sur l'animation. On NE le prolonge PAS avec les
    // événements suivants : un trackpad émet un flux continu (geste + inertie), et
    // repousser le déverrouillage à chaque événement le figerait indéfiniment.
    let wheelLock = false;
    let wheelUnlock = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock) return;
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 8) return; // ignore les micro-frémissements du pad
      wheelLock = true;
      go(d > 0 ? 1 : -1);
      wheelUnlock = window.setTimeout(() => {
        wheelLock = false;
      }, 720);
    };

    const onHint = () => go(1);

    // Navigation clavier (accessibilité + flèches / PageUp-Down)
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // On laisse les champs de saisie tranquilles.
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      )
        return;
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      }
    };

    viewport.addEventListener("touchstart", onStart, { passive: true });
    viewport.addEventListener("touchend", onEnd, { passive: true });
    viewport.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    const hint = root.querySelector<HTMLElement>(".journey-hint");
    hint?.addEventListener("click", onHint);

    return () => {
      cancelAnimationFrame(animId);
      if (rafId) cancelAnimationFrame(rafId);
      window.clearTimeout(wheelUnlock);
      goRef.current = null;
      viewport.removeEventListener("touchstart", onStart);
      viewport.removeEventListener("touchend", onEnd);
      viewport.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      hint?.removeEventListener("click", onHint);
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevOverscroll;
      viewport.style.touchAction = "";
      lenis?.start();
      root.classList.remove("is-active");
      document.body.classList.remove("journey-on");
      track.style.height = "";
      layers.forEach((l) => (l.style.cssText = ""));
    };
  }, [n]);

  return (
    <div className="journey" ref={rootRef}>
      <div className="journey-viewport">
        <div className="journey-light" aria-hidden="true" />
        <Link href="/" className="journey-brand" aria-label="ExDaL, accueil">
          Ex<span className="lum-gradient">DaL</span>
        </Link>
        <div className="journey-stage">
          {slabs.map((slab, i) => (
            <div className="journey-slab" key={i} data-index={i}>
              {slab}
            </div>
          ))}
        </div>

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
          {touch ? "Glissez vers la lumière" : "Avancez vers la lumière"}
          <span>{touch ? "↑" : "↓"}</span>
        </div>
      </div>

      <div className="journey-track" aria-hidden="true" />
    </div>
  );
}
