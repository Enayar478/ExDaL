"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CrystalCanvas } from "@/components/manifesto/CrystalCanvas";
import { ManifestoMenu } from "@/components/manifesto/ManifestoMenu";
import {
  ManifestoSearch,
  type SearchItem,
} from "@/components/manifesto/ManifestoSearch";
import { site } from "@/lib/site";

/**
 * L'accueil — le hall d'entrée du studio. Pas de vente : de l'atmosphère, le
 * manifeste, et des portes vers le reste. Le fond cristallise la donnée en cube
 * de lumière ; par-dessus, en HTML natif (lisible sans le canvas), la promesse
 * de marque et la porte maîtresse « Entrer » (le parcours). L'en-tête offre la
 * carte (burger) et la recherche du Journal ; la navigation complète vit dans
 * le panneau du burger.
 */
export function Manifesto({ searchItems }: { searchItems: SearchItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="mf-root">
      <CrystalCanvas />
      <div className="mf-halo" aria-hidden="true" />
      <div className="mf-vignette" aria-hidden="true" />

      <div className="mf-wrap">
        {/* En-tête : burger (carte) · logotype cérémonial · recherche du Journal */}
        <header className="mf-top">
          <button
            type="button"
            className="mf-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
          </button>

          <Link
            href="/"
            className="mf-mark"
            aria-label="Ex Datis Lumen — accueil"
          >
            Ex Datis
            <span className="mf-mark-l2">Lumen</span>
          </Link>

          <button
            type="button"
            className="mf-search-btn"
            aria-label="Rechercher dans le Journal"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
          >
            <span className="mf-search-icon" aria-hidden="true" />
          </button>
        </header>

        {/* Le manifeste — la promesse, en HTML natif (SEO/a11y) */}
        <div className="mf-manifesto">
          <h1 className="mf-h1">
            <span className="mf-line">
              <span>Vos chiffres savent</span>
            </span>
            <span className="mf-line">
              <span>déjà tout.</span>
            </span>
            <span className="mf-line">
              <span>
                <em>Donnons-leur la parole.</em>
              </span>
            </span>
          </h1>
          <div className="mf-cta">
            <Link href="/tunnel">
              Entrer <span className="mf-arrow" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Pied — l'emblème, la signature, les portes secondaires */}
        <footer className="mf-bottom">
          <div className="mf-foot-1">
            <div className="mf-foot-brand">
              <div className="mf-foot-mark">
                <Image
                  src="/emblem.png"
                  alt=""
                  width={62}
                  height={62}
                  className="mf-emblem"
                  aria-hidden="true"
                />
                <div className="mf-foot-words">
                  Ex Datis
                  <span className="mf-mark-l2">Lumen</span>
                </div>
              </div>
              <p className="mf-tagline">
                Studio de data financière · spécialiste Pennylane
              </p>
            </div>
            <div className="mf-socials">
              {/* Placeholder : l'URL réelle de la page société sera branchée
                  plus tard (pas de navigation tant qu'elle est inconnue). */}
              <a
                href="#"
                aria-label="LinkedIn (bientôt)"
                onClick={(e) => e.preventDefault()}
              >
                in
              </a>
              <Link href="/journal" aria-label="Le Journal">
                J
              </Link>
              <Link href="/newsletter" aria-label="Newsletter Lumen">
                N
              </Link>
              <a href={`mailto:${site.email}`} aria-label="Contact">
                @
              </a>
            </div>
          </div>
          <div className="mf-foot-2">
            <div>
              © {year} {site.legalName}
            </div>
            <div className="mf-foot-links">
              <Link href="/journal">Journal</Link>
              <Link href="/score">Le Score</Link>
              <Link href="/newsletter">Newsletter</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
            </div>
          </div>
        </footer>
      </div>

      <ManifestoMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ManifestoSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchItems}
      />
    </div>
  );
}
