"use client";

import { useEffect, useRef } from "react";

/**
 * Fond du hall d'entrée : des particules de données affluent en spirale depuis
 * les bords, puis cristallisent en un cube filaire 3D — « de la donnée éparse,
 * une structure de lumière ». Purement décoratif (aria-hidden) : le manifeste
 * reste en HTML natif, lisible sans le canvas (SEO/a11y intacts).
 *
 * Performance (objectif 60 fps mobile) :
 *  • Halo pré-rendu une seule fois dans un sprite, dessiné au drawImage — on
 *    évite un createRadialGradient par particule et par frame (le vrai goulot).
 *  • Densité de particules adaptée à la taille d'écran, DPR plafonné.
 *  • Boucle mise en pause quand l'onglet est masqué.
 *
 * Accessibilité : en prefers-reduced-motion, aucune animation — on peint une
 * seule frame statique du cube déjà cristallisé (l'identité visuelle, au repos).
 */

const OR = { r: 217, g: 178, b: 106 }; // #d9b26a — l'or de la DA
const CORE = { r: 246, g: 238, b: 220 }; // #f6eedc — le noyau clair

interface CubeVertex {
  x: number;
  y: number;
  z: number;
  corner?: boolean;
}

interface Particle {
  ang: number;
  radStart: number;
  rad: number;
  spin: number;
  z: number;
  target: CubeVertex;
  r: number;
  glow: number;
  x: number;
  y: number;
  sc: number;
  depth: number;
}

const EDGE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const CORNERS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

/** Sprite de halo radial pré-rendu (or → transparent), dessiné une seule fois. */
function makeGlowSprite(): HTMLCanvasElement {
  const size = 64;
  const s = document.createElement("canvas");
  s.width = size;
  s.height = size;
  const g = s.getContext("2d");
  if (g) {
    const grd = g.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grd.addColorStop(0, `rgba(${OR.r},${OR.g},${OR.b},1)`);
    grd.addColorStop(1, `rgba(${OR.r},${OR.g},${OR.b},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  }
  return s;
}

export function CrystalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const canvas = el; // référence non-nulle stable pour les closures

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const glow = makeGlowSprite();

    let W = 0,
      H = 0,
      CX = 0,
      CY = 0;
    let div = 14; // divisions par arête (densité adaptative)
    let cubeVerts: CubeVertex[] = [];
    let parts: Particle[] = [];
    let order: number[] = [];

    const isCoarse =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 820px)").matches;

    function buildCube() {
      const S = Math.min(W, H) * 0.16; // demi-taille du cube
      div = isCoarse ? 9 : 14;
      const internal = isCoarse ? 90 : 220;
      const verts: CubeVertex[] = [];

      // Particules réparties le long des 12 arêtes (maillage filaire).
      for (const [a, b] of EDGE_PAIRS) {
        for (let i = 0; i < div; i++) {
          const t = i / div;
          verts.push({
            x: (CORNERS[a][0] + (CORNERS[b][0] - CORNERS[a][0]) * t) * S,
            y: (CORNERS[a][1] + (CORNERS[b][1] - CORNERS[a][1]) * t) * S,
            z: (CORNERS[a][2] + (CORNERS[b][2] - CORNERS[a][2]) * t) * S,
          });
        }
      }
      // Nuage interne (densité de données).
      for (let i = 0; i < internal; i++) {
        verts.push({
          x: (Math.random() * 2 - 1) * S * 0.85,
          y: (Math.random() * 2 - 1) * S * 0.85,
          z: (Math.random() * 2 - 1) * S * 0.85,
        });
      }
      // Les 8 sommets, plus lumineux.
      for (const cn of CORNERS) {
        verts.push({ x: cn[0] * S, y: cn[1] * S, z: cn[2] * S, corner: true });
      }
      cubeVerts = verts;
    }

    function initParticles() {
      parts = cubeVerts.map((target) => {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.max(W, H) * (0.7 + Math.random() * 0.8);
        return {
          ang,
          radStart: dist,
          rad: dist,
          spin: (0.6 + Math.random() * 1.1) * (Math.random() < 0.5 ? -1 : 1),
          z: (Math.random() * 2 - 1) * Math.max(W, H) * 0.6,
          target,
          r: target.corner ? 2.4 : 0.45 + Math.random() * 0.85,
          glow: Math.random(),
          x: 0,
          y: 0,
          sc: 1,
          depth: 0,
        };
      });
      order = parts.map((_, i) => i);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W / 2;
      CY = H * 0.46;
      buildCube();
      // On préserve les particules existantes si le compte n'a pas changé
      // (évite un « saut » au redimensionnement) ; sinon on ré-initialise.
      if (parts.length !== cubeVerts.length) initParticles();
      else parts.forEach((p, i) => (p.target = cubeVerts[i]));
      if (reduced) renderFrame(6, 1); // frame statique, cube assemblé
    }

    const FOV = 600;

    /**
     * Peint une frame. `time` pilote la rotation et le pouls ; `assembled`
     * ∈ [0,1] mélange la spirale d'approche et la forme finale du cube.
     */
    function renderFrame(time: number, assembled: number) {
      const c = ctx!;
      const breath = 1 + Math.sin(time * 0.55) * 0.035 * assembled;
      const zoom = (2.6 - 1.6 * assembled) * breath;
      const ry = time * 0.16;
      const rx = Math.sin(time * 0.15) * 0.35 + 0.35;
      const cosY = Math.cos(ry),
        sinY = Math.sin(ry);
      const cosX = Math.cos(rx),
        sinX = Math.sin(rx);

      c.clearRect(0, 0, W, H);

      for (const p of parts) {
        p.ang += p.spin * 0.007 * (1 - assembled * 0.85);
        p.rad = p.radStart * (1 - assembled);
        const spiralX = Math.cos(p.ang) * p.rad;
        const spiralY = Math.sin(p.ang) * p.rad;
        const spiralZ = p.z * (1 - assembled);

        const tg = p.target;
        const x1 = tg.x * cosY - tg.z * sinY;
        const z1 = tg.x * sinY + tg.z * cosY;
        const y1 = tg.y * cosX - z1 * sinX;
        const z2 = tg.y * sinX + z1 * cosX;

        const mx = spiralX * (1 - assembled) + x1 * assembled;
        const my = spiralY * (1 - assembled) + y1 * assembled;
        const mz = spiralZ * (1 - assembled) + z2 * assembled;

        const denom = FOV + mz * zoom + 300;
        const scale = Math.max(0.05, Math.min(3, FOV / Math.max(1, denom)));
        p.x = CX + mx * scale * zoom;
        p.y = CY + my * scale * zoom;
        p.sc = scale;
        p.depth = mz;
      }

      // Arêtes du cube : n'apparaissent qu'une fois la structure formée.
      if (assembled > 0.62) {
        const a = (assembled - 0.62) / 0.38;
        c.lineWidth = 0.6;
        c.strokeStyle = `rgba(${OR.r},${OR.g},${OR.b},${(a * 0.28).toFixed(3)})`;
        for (let e = 0; e < EDGE_PAIRS.length; e++) {
          c.beginPath();
          for (let i = 0; i < div; i++) {
            const p = parts[e * div + i];
            if (!p) continue;
            if (i === 0) c.moveTo(p.x, p.y);
            else c.lineTo(p.x, p.y);
          }
          c.stroke();
        }
      }

      // Particules, des plus lointaines aux plus proches.
      order.sort((a, b) => parts[b].depth - parts[a].depth);
      const flightAlpha = 0.25 + assembled * 0.6;
      for (const idx of order) {
        const p = parts[idx];
        const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 + p.glow * 6.28);
        const depthFade = Math.max(0.25, Math.min(1, p.sc * 1.15));
        const alpha = flightAlpha * pulse * depthFade;
        const radius = Math.max(0.35, p.r * p.sc * (1 + assembled * 0.5));

        // Traînée pendant le vol : donne le sens de la spirale (trait simple,
        // sans gradient — bien moins coûteux qu'un createLinearGradient/frame).
        if (assembled < 0.85) {
          const trail = (1 - assembled) * 0.5;
          const tx = p.x - Math.cos(p.ang) * 22 * trail;
          const ty = p.y - Math.sin(p.ang) * 22 * trail;
          c.strokeStyle = `rgba(${OR.r},${OR.g},${OR.b},${(alpha * 0.22).toFixed(3)})`;
          c.lineWidth = Math.max(0.2, radius * 0.9);
          c.beginPath();
          c.moveTo(tx, ty);
          c.lineTo(p.x, p.y);
          c.stroke();
        }

        // Halo (sprite pré-rendu) + noyau clair.
        const haloR = Math.max(1, radius * 6);
        c.globalAlpha = Math.min(1, alpha * 0.8);
        c.drawImage(glow, p.x - haloR, p.y - haloR, haloR * 2, haloR * 2);
        c.globalAlpha = 1;

        c.fillStyle = `rgba(${CORE.r},${CORE.g},${CORE.b},${(alpha * 0.95).toFixed(3)})`;
        c.beginPath();
        c.arc(p.x, p.y, Math.max(0.4, radius * 0.55), 0, Math.PI * 2);
        c.fill();
      }
    }

    // ── Amorçage ────────────────────────────────────────────────────────────
    resize();
    if (parts.length === 0) initParticles();

    let onResize: (() => void) | null = null;
    let rafId = 0;
    let onVisibility: (() => void) | null = null;

    if (reduced) {
      // Aucune boucle : une frame statique, re-peinte au redimensionnement.
      renderFrame(6, 1);
      onResize = () => resize();
      window.addEventListener("resize", onResize);
    } else {
      let start = 0;
      const loop = (now: number) => {
        if (!start) start = now;
        const t = (now - start) / 1000;
        // Assemblage en easeOut sur ~4 s, puis respiration lente.
        const assembled = Math.min(1, 1 - Math.pow(2, -2.2 * (t * 0.32)));
        renderFrame(t * 0.32, assembled);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      onResize = () => resize();
      window.addEventListener("resize", onResize);

      // Pause quand l'onglet est masqué (économie batterie/CPU).
      onVisibility = () => {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
        } else if (!rafId) {
          rafId = requestAnimationFrame(loop);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onVisibility)
        document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="mf-canvas" aria-hidden="true" />;
}
