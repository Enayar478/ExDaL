"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { site } from "@/lib/site";

interface NavLink {
  href: string;
  label: string;
  note: string;
}

// Les portes du hall. « Le parcours » (conversion) et « Le Journal » (découverte)
// sont les deux voies maîtresses ; le reste complète la carte.
const LINKS: readonly NavLink[] = [
  { href: "/tunnel", label: "Le parcours", note: "De vos chiffres à vos décisions" },
  { href: "/journal", label: "Le Journal", note: "Ce que vos chiffres vous disent" },
  { href: "/score", label: "Le Score", note: "Votre préparation à la cession" },
];

/**
 * Panneau de navigation du hall (ouvert par le burger). La carte complète :
 * les portes du studio, la newsletter Lumen, le contact direct. Fermable au clic
 * hors panneau, à la croix ou avec Échap. Focus déplacé à l'ouverture (a11y).
 */
export function ManifestoMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`mf-menu${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="mf-menu-scrim"
        aria-label="Fermer le menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div className="mf-menu-panel" ref={panelRef}>
        <button
          type="button"
          className="mf-menu-close"
          aria-label="Fermer"
          ref={closeRef}
          tabIndex={open ? 0 : -1}
          onClick={onClose}
        >
          <span />
          <span />
        </button>

        <nav className="mf-menu-nav" aria-label="Sections">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mf-menu-link"
              tabIndex={open ? 0 : -1}
              onClick={onClose}
            >
              <span className="mf-menu-link-label">{l.label}</span>
              <span className="mf-menu-link-note">{l.note}</span>
            </Link>
          ))}
        </nav>

        <div className="mf-menu-foot">
          <p className="mf-menu-eyebrow">Lumen, la newsletter</p>
          <p className="mf-menu-lede">
            Ce que vos chiffres vous disent, si vous savez les lire. Bimensuelle.
            Sobre.
          </p>
          <div className="mf-menu-news">
            <NewsletterForm source="accueil" />
          </div>
          <a
            href={`mailto:${site.email}`}
            className="mf-menu-contact"
            tabIndex={open ? 0 : -1}
          >
            {site.email}
          </a>
        </div>
      </div>
    </div>
  );
}
