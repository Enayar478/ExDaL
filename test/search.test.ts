import { describe, it, expect } from "vitest";
import {
  fold,
  filterSearchItems,
  type SearchItem,
} from "@/lib/search/fold";

describe("fold — normalisation de recherche", () => {
  it("met en minuscule", () => {
    expect(fold("PENNYLANE")).toBe("pennylane");
  });

  it("retire les accents (é, è, à, ô, ç…)", () => {
    expect(fold("Réconciliation générale")).toBe("reconciliation generale");
    expect(fold("cœur à l'ouvrage")).toBe("cœur a l'ouvrage");
  });

  it("gère la chaîne vide", () => {
    expect(fold("")).toBe("");
  });
});

describe("filterSearchItems — filtrage du Journal", () => {
  const items: readonly SearchItem[] = [
    {
      slug: "a",
      title: "Connecter Pennylane",
      excerpt: "Réconciliation du CRM",
      eyebrow: "Méthode",
    },
    {
      slug: "b",
      title: "Lire un bilan",
      excerpt: "Ratios essentiels",
      eyebrow: "Finance",
    },
  ];

  it("renvoie un tableau vide si la requête est vide ou blanche", () => {
    expect(filterSearchItems(items, "")).toEqual([]);
    expect(filterSearchItems(items, "   ")).toEqual([]);
  });

  it("matche insensible à la casse et aux accents", () => {
    expect(filterSearchItems(items, "PENNYLANE")).toHaveLength(1);
    // Requête sans accent → doit matcher un champ accentué.
    expect(filterSearchItems(items, "reconciliation")).toHaveLength(1);
  });

  it("matche sur le teaser et le sur-titre, pas seulement le titre", () => {
    expect(filterSearchItems(items, "ratios")).toHaveLength(1);
    expect(filterSearchItems(items, "finance")).toHaveLength(1);
  });

  it("ne renvoie rien si aucun champ ne matche", () => {
    expect(filterSearchItems(items, "xyz-inexistant")).toEqual([]);
  });

  it("gère un index vide", () => {
    expect(filterSearchItems([], "pennylane")).toEqual([]);
  });

  it("préserve l'ordre d'entrée des résultats", () => {
    const withCommon: readonly SearchItem[] = [
      { slug: "1", title: "data un", excerpt: "", eyebrow: "" },
      { slug: "2", title: "data deux", excerpt: "", eyebrow: "" },
    ];
    expect(filterSearchItems(withCommon, "data").map((i) => i.slug)).toEqual([
      "1",
      "2",
    ]);
  });
});
