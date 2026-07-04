import type Lenis from "lenis";

/**
 * Petit singleton pour partager l'instance Lenis entre le fournisseur de smooth
 * scroll et le voyage immersif (utilisé pour le snap magnétique). Les effets
 * enfant s'exécutant avant ceux du parent, on lit l'instance à l'usage, pas au
 * montage.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
