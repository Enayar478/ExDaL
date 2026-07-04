"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/components/tunnel/lenis-store";

/**
 * Smooth scroll global (Lenis) synchronisé avec GSAP ScrollTrigger.
 * L'inertie du glissé donne l'immersion du tunnel. Désactivé si l'utilisateur
 * préfère les mouvements réduits (accessibilité + anti-nausée) → scroll natif.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Le tactile reste natif : meilleure fluidité 60fps sur mobile.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);
    setLenis(lenis);

    // Exposé en dev uniquement (debug / tests visuels), jamais en production.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
