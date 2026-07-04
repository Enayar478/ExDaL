"use client";

import { Children, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/components/tunnel/lenis-store";

/**
 * Voyage immersif — « vers la lumière, dans les profondeurs ».
 *
 * Deux modes selon l'appareil :
 *  • Desktop (pointeur fin) : scroll fluide piloté (Lenis + ScrollTrigger) avec
 *    snap magnétique — on glisse dans la profondeur puis on se cale sur un palier.
 *  • Tactile (mobile/tablette) : scroll verrouillé (plus de barre de navigateur
 *    qui saute), navigation au SWIPE (haut/bas ou gauche/droite) palier par
 *    palier, chaque arrêt net à 100 % — franc et lisible. Barre de progression.
 *
 * Couche visuelle : le HTML/copie est inchangé (SEO/a11y intacts). En
 * `prefers-reduced-motion`, aucun effet : scroll vertical classique, accessible.
 */
const Z_FAR = 3000;
const Z_NEAR = 900;

export function ImmersiveJourney({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [touch, setTouch] = useState(false);
  const slabs = Children.toArray(children);
  const n = slabs.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
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

    let rafId = 0;
    /** Positionne tous les paliers pour une profondeur `travel` ∈ [0, n-1]. */
    const renderTravel = (travel: number) => {
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

    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 820px)").matches;
    setTouch(isTouch);

    // ── Mode TACTILE : scroll verrouillé + navigation au swipe ──────────────
    if (isTouch) {
      const html = document.documentElement;
      const prevHtmlOverflow = html.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      const prevOverscroll = html.style.overscrollBehavior;
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      viewport.style.touchAction = "none";
      track.style.height = "0px";

      let step = 0;
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
        const target = clamp(0, steps, step + dir);
        if (target === step) return;
        step = target;
        animateTo(step);
      };
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __journey?: unknown }).__journey = {
          go,
          jump: (s: number) => {
            step = clamp(0, steps, s);
            cur = step;
            renderTravel(cur);
          },
          get travel() {
            return cur;
          },
          get step() {
            return step;
          },
          steps,
        };
      }

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
        // vertical prioritaire ; sinon horizontal. Vers le haut / la gauche = avancer.
        if (ady >= adx) go(dy < 0 ? 1 : -1);
        else go(dx < 0 ? 1 : -1);
      };
      const onHint = () => go(1);

      // Navigation clavier (accessibilité + flèches/PageUp-Down)
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
      window.addEventListener("keydown", onKey);
      const hint = root.querySelector<HTMLElement>(".journey-hint");
      hint?.addEventListener("click", onHint);

      return () => {
        cancelAnimationFrame(animId);
        if (rafId) cancelAnimationFrame(rafId);
        viewport.removeEventListener("touchstart", onStart);
        viewport.removeEventListener("touchend", onEnd);
        window.removeEventListener("keydown", onKey);
        hint?.removeEventListener("click", onHint);
        html.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        html.style.overscrollBehavior = prevOverscroll;
        viewport.style.touchAction = "";
        root.classList.remove("is-active");
        track.style.height = "";
        layers.forEach((l) => (l.style.cssText = ""));
      };
    }

    // ── Mode DESKTOP : scroll fluide + snap magnétique ──────────────────────
    track.style.height = `${n * 100}svh`;
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => renderTravel(self.progress * steps),
    });

    const scrollableMax = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let snapTimer = 0;
    const snapToNearest = () => {
      if (steps <= 0) return;
      const max = scrollableMax();
      const idx = clamp(0, steps, Math.round((window.scrollY / max) * steps));
      const targetY = (idx / steps) * max;
      if (Math.abs(targetY - window.scrollY) < 3) return;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetY, {
          duration: 0.5,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    };
    const onScrollIdle = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snapToNearest, 150);
    };
    window.addEventListener("scroll", onScrollIdle, { passive: true });

    return () => {
      st.kill();
      window.clearTimeout(snapTimer);
      window.removeEventListener("scroll", onScrollIdle);
      if (rafId) cancelAnimationFrame(rafId);
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
