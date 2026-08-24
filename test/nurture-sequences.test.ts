/**
 * Tests unitaires, lib/nurture/sequences.ts (module pur, zéro mock nécessaire).
 */
import { describe, it, expect } from "vitest";
import {
  SEQUENCE_OFFSETS,
  sendAtFor,
  sequenceForVerdict,
  stageToSequence,
} from "@/lib/nurture/sequences";

describe("SEQUENCE_OFFSETS", () => {
  it("offsets exacts pour pilotage et cabinet", () => {
    expect(SEQUENCE_OFFSETS.pilotage).toEqual([0, 3, 7, 11, 15, 21]);
    expect(SEQUENCE_OFFSETS.cabinet).toEqual([0, 3, 7, 11, 15, 21]);
  });

  it("offsets exacts pour premium (rythme resserré)", () => {
    expect(SEQUENCE_OFFSETS.premium).toEqual([0, 2, 5, 8, 11, 16]);
  });

  it("6 étapes par séquence, offsets strictement croissants", () => {
    for (const offsets of Object.values(SEQUENCE_OFFSETS)) {
      expect(offsets).toHaveLength(6);
      for (let i = 1; i < offsets.length; i += 1) {
        expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
      }
    }
  });
});

describe("sendAtFor", () => {
  const startedAt = new Date("2026-01-01T10:00:00.000Z");

  it("calcule la date d'envoi de l'étape 0 (jour même)", () => {
    const result = sendAtFor("pilotage", 0, startedAt);
    expect(result?.toISOString()).toBe("2026-01-01T10:00:00.000Z");
  });

  it("calcule la date d'envoi d'une étape intermédiaire (pilotage, step 2 => +7j)", () => {
    const result = sendAtFor("pilotage", 2, startedAt);
    expect(result?.toISOString()).toBe("2026-01-08T10:00:00.000Z");
  });

  it("calcule la date d'envoi de la dernière étape (premium, step 5 => +16j)", () => {
    const result = sendAtFor("premium", 5, startedAt);
    expect(result?.toISOString()).toBe("2026-01-17T10:00:00.000Z");
  });

  it("retourne null au-delà de la dernière étape (step 6)", () => {
    expect(sendAtFor("pilotage", 6, startedAt)).toBeNull();
  });

  it("retourne null pour un step négatif", () => {
    expect(sendAtFor("pilotage", -1, startedAt)).toBeNull();
  });

  it("ne mute pas la date passée en paramètre", () => {
    const original = new Date("2026-01-01T10:00:00.000Z");
    const copy = new Date(original);
    sendAtFor("pilotage", 3, original);
    expect(original.toISOString()).toBe(copy.toISOString());
  });
});

describe("sequenceForVerdict", () => {
  it("route les verdicts fragiles vers premium (angle opération)", () => {
    expect(sequenceForVerdict("fondations")).toBe("premium");
    expect(sequenceForVerdict("en-construction")).toBe("premium");
  });

  it("route les verdicts solides vers pilotage", () => {
    expect(sequenceForVerdict("credible")).toBe("pilotage");
    expect(sequenceForVerdict("pret")).toBe("pilotage");
  });
});

describe("stageToSequence", () => {
  it("mappe chaque stade de qualification vers sa séquence", () => {
    expect(stageToSequence("pilotage")).toBe("pilotage");
    expect(stageToSequence("cabinet")).toBe("cabinet");
    expect(stageToSequence("operation")).toBe("premium");
  });
});
