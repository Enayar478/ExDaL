"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export interface SearchItem {
  slug: string;
  title: string;
  excerpt: string;
  eyebrow: string;
}

/** Normalise pour une recherche insensible à la casse et aux accents. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Recherche du hall — ouverte par l'icône loupe de l'en-tête. Filtre le Journal
 * côté client (titre, teaser, sur-titre) sur son index statique : aucun appel
 * réseau, résultats instantanés. Fermable au scrim, à la croix ou avec Échap.
 * Le champ prend le focus à l'ouverture (a11y).
 */
export function ManifestoSearch({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: readonly SearchItem[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ferme et repart d'un champ vierge (appelé depuis les gestionnaires
  // d'événements, jamais depuis un effet).
  const close = () => {
    setQuery("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    // Léger délai : laisse la transition d'ouverture démarrer avant le focus.
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [];
    return items.filter((it) => {
      const hay = fold(`${it.title} ${it.excerpt} ${it.eyebrow}`);
      return hay.includes(q);
    });
  }, [query, items]);

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className={`mf-search-overlay${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher dans le Journal"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="mf-search-scrim"
        aria-label="Fermer la recherche"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <div className="mf-search-panel">
        <div className="mf-search-bar">
          <span className="mf-search-glyph" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            className="mf-search-input"
            placeholder="Rechercher dans le Journal…"
            aria-label="Rechercher dans le Journal"
            value={query}
            tabIndex={open ? 0 : -1}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="mf-search-close"
            aria-label="Fermer"
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            <span />
            <span />
          </button>
        </div>

        <div
          className="mf-search-results"
          role="listbox"
          aria-label="Résultats"
        >
          {hasQuery && results.length === 0 && (
            <p className="mf-search-empty">
              Aucun écrit ne correspond. Le Journal s&rsquo;étoffe&nbsp;:
              revenez bientôt.
            </p>
          )}
          {results.map((it) => (
            <Link
              key={it.slug}
              href={`/journal/${it.slug}`}
              className="mf-search-hit"
              tabIndex={open ? 0 : -1}
              onClick={close}
            >
              <span className="mf-search-hit-eyebrow">{it.eyebrow}</span>
              <span className="mf-search-hit-title">{it.title}</span>
              <span className="mf-search-hit-excerpt">{it.excerpt}</span>
            </Link>
          ))}
          {!hasQuery && (
            <p className="mf-search-hint">
              Les articles de fond du Journal — data financière, Pennylane,
              lecture d&rsquo;un bilan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
