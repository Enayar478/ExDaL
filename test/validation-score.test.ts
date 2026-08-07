import { describe, it, expect } from "vitest";
import { scoreSubmission } from "@/lib/validation/score";

const validSubmission = {
  email: "camille@exemple.fr",
  answers: { q1: "q1a", q2: "q2b" },
};

describe("scoreSubmission, consentement marketing (RGPD)", () => {
  it("marketingConsent absent : défaut à false (fail-safe)", () => {
    const parsed = scoreSubmission.parse(validSubmission);
    expect(parsed.marketingConsent).toBe(false);
  });

  it("marketingConsent true est accepté", () => {
    const parsed = scoreSubmission.parse({
      ...validSubmission,
      marketingConsent: true,
    });
    expect(parsed.marketingConsent).toBe(true);
  });

  it("marketingConsent false est accepté", () => {
    const parsed = scoreSubmission.parse({
      ...validSubmission,
      marketingConsent: false,
    });
    expect(parsed.marketingConsent).toBe(false);
  });

  it("marketingConsent d'un type invalide est rejeté", () => {
    const result = scoreSubmission.safeParse({
      ...validSubmission,
      marketingConsent: "oui",
    });
    expect(result.success).toBe(false);
  });
});
