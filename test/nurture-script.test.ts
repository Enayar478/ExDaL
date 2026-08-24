/**
 * Tests unitaires, scripts/nurture.mjs.
 *
 * Le script est un outil CLI (parsing d'arguments, I/O réseau Supabase) :
 * seules les fonctions pures qu'il exporte (parsing .env, formatage,
 * masquage, agrégation des indicateurs) sont testées ici. La CLI elle-même
 * n'exécute son `main()` qu'en exécution directe (`node scripts/nurture.mjs`),
 * jamais à l'import, donc cet import ne déclenche aucun effet de bord.
 */
import { describe, it, expect } from "vitest";
import {
  parseEnvFile,
  maskEmail,
  renderTable,
  computeStats,
} from "../scripts/nurture.mjs";

describe("parseEnvFile", () => {
  it("parse des paires KEY=VALUE simples", () => {
    const result = parseEnvFile("SUPABASE_URL=https://x.supabase.co\nFOO=bar");
    expect(result).toEqual({
      SUPABASE_URL: "https://x.supabase.co",
      FOO: "bar",
    });
  });

  it("ignore les lignes vides et les commentaires", () => {
    const result = parseEnvFile("\n# commentaire\nA=1\n\n# autre\nB=2\n");
    expect(result).toEqual({ A: "1", B: "2" });
  });

  it("retire les guillemets simples ou doubles autour de la valeur", () => {
    const result = parseEnvFile('A="hello world"\nB=\'single\'');
    expect(result).toEqual({ A: "hello world", B: "single" });
  });

  it("ignore les lignes sans signe égal", () => {
    const result = parseEnvFile("PAS_UNE_VARIABLE\nOK=1");
    expect(result).toEqual({ OK: "1" });
  });

  it("gère une valeur contenant un signe égal (ex. clé base64 avec padding)", () => {
    const result = parseEnvFile("SECRET=abc=def==");
    expect(result).toEqual({ SECRET: "abc=def==" });
  });
});

describe("maskEmail", () => {
  it("masque la partie locale en conservant les 2 premiers caractères", () => {
    expect(maskEmail("camille@exemple.fr")).toBe("ca***@exemple.fr");
  });

  it("retourne *** si l'entrée n'a pas de domaine", () => {
    expect(maskEmail("pas-un-email")).toBe("***");
  });
});

describe("renderTable", () => {
  it("aligne les colonnes selon la largeur maximale de chaque colonne", () => {
    const table = renderTable(
      ["email", "statut"],
      [
        ["ca***@exemple.fr", "active"],
        ["a***@x.fr", "pending"],
      ],
    );
    const lines = table.split("\n");
    expect(lines[0]).toBe("email             statut");
    expect(lines).toHaveLength(4); // header + séparateur + 2 lignes
  });

  it("gère un tableau vide", () => {
    const table = renderTable(["a", "b"], []);
    expect(table.split("\n")).toHaveLength(2); // header + séparateur seulement
  });
});

describe("computeStats", () => {
  const rows = [
    { sequence: "pilotage", source: "qualification", status: "completed", stop_reason: "booked" },
    { sequence: "pilotage", source: "qualification", status: "stopped", stop_reason: "booked" },
    { sequence: "pilotage", source: "score", status: "active", stop_reason: null },
    { sequence: "cabinet", source: "qualification", status: "unsubscribed", stop_reason: "unsubscribed" },
    { sequence: "premium", source: "score", status: "pending", stop_reason: null },
  ];

  it("compte les entrées par séquence, source et statut", () => {
    const stats = computeStats(rows);
    expect(stats.total).toBe(5);
    expect(stats.bySequence).toEqual({ pilotage: 3, cabinet: 1, premium: 1 });
    expect(stats.bySource).toEqual({ qualification: 3, score: 2 });
    expect(stats.byStatus).toEqual({
      completed: 1,
      stopped: 1,
      active: 1,
      unsubscribed: 1,
      pending: 1,
    });
  });

  it("calcule le taux séquence → booked par stop_reason", () => {
    const stats = computeStats(rows);
    expect(stats.conversionBySequence.pilotage).toEqual({
      total: 3,
      booked: 2,
      rate: 2 / 3,
    });
    expect(stats.conversionBySequence.cabinet).toEqual({
      total: 1,
      booked: 0,
      rate: 0,
    });
  });

  it("compte les désinscriptions via stop_reason=unsubscribed", () => {
    const stats = computeStats(rows);
    expect(stats.unsubscribed).toBe(1);
  });

  it("gère un jeu de données vide sans diviser par zéro", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.conversionBySequence).toEqual({});
    expect(stats.unsubscribed).toBe(0);
  });
});
