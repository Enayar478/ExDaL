import { describe, it, expect } from "vitest";
import {
  leadInput,
  segmentSignal,
  stageToSegment,
} from "@/lib/validation/lead";

const validLead = {
  name: "Camille Verdier",
  email: "Camille@Exemple.FR",
  role: "Directrice financière",
  company: "Acme SAS",
  pennylane: "oui",
  stage: "operation",
};

describe("leadInput", () => {
  it("accepte un formulaire complet et normalise l'email", () => {
    const parsed = leadInput.parse(validLead);
    expect(parsed.email).toBe("camille@exemple.fr");
    expect(parsed.name).toBe("Camille Verdier");
  });

  it("rejette un email invalide", () => {
    const result = leadInput.safeParse({ ...validLead, email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un stade inconnu", () => {
    const result = leadInput.safeParse({ ...validLead, stage: "autre" });
    expect(result.success).toBe(false);
  });

  it("rejette un nom trop court", () => {
    const result = leadInput.safeParse({ ...validLead, name: "A" });
    expect(result.success).toBe(false);
  });

  it("accepte un segment optionnel valide", () => {
    const parsed = leadInput.parse({ ...validLead, segment: "premium" });
    expect(parsed.segment).toBe("premium");
  });

  it("laisse passer le honeypot vide", () => {
    const parsed = leadInput.parse({ ...validLead, website: "" });
    expect(parsed.website).toBe("");
  });
});

describe("segmentSignal", () => {
  it("valide un segment connu", () => {
    expect(segmentSignal.parse({ segment: "cabinet" }).segment).toBe("cabinet");
  });

  it("rejette un segment inconnu", () => {
    expect(segmentSignal.safeParse({ segment: "vip" }).success).toBe(false);
  });
});

describe("stageToSegment", () => {
  it("mappe chaque stade vers son segment commercial", () => {
    expect(stageToSegment("pilotage")).toBe("pme");
    expect(stageToSegment("cabinet")).toBe("cabinet");
    expect(stageToSegment("operation")).toBe("premium");
  });
});
