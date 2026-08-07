/**
 * Tests unitaires, lib/score/repository.ts
 *
 * Le point clé RGPD : `marketing_consent_at` n'est horodaté CÔTÉ SERVEUR que
 * si `marketingConsent` vaut `true`. Sinon il reste `null`, jamais une valeur
 * client, jamais une date par défaut.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const singleMock = vi.fn();
const selectMock = vi.fn(() => ({ single: singleMock }));
const insertMock = vi.fn(() => ({ select: selectMock }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({ from: fromMock }),
}));

const { insertScoreSubmission } = await import("@/lib/score/repository");

const baseSubmission = {
  email: "camille@exemple.fr",
  score: 80,
  verdict: "credible",
  answers: { q1: "q1a" },
};

describe("insertScoreSubmission, consentement marketing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { id: "score-uuid-1" }, error: null });
  });

  it("consentement true : persiste marketing_consent=true et un horodatage serveur", async () => {
    await insertScoreSubmission({ ...baseSubmission, marketingConsent: true });

    const payload = insertMock.mock.calls[0][0];
    expect(payload.marketing_consent).toBe(true);
    expect(typeof payload.marketing_consent_at).toBe("string");
    expect(new Date(payload.marketing_consent_at).toString()).not.toBe(
      "Invalid Date",
    );
  });

  it("consentement false : persiste marketing_consent=false et aucun horodatage", async () => {
    await insertScoreSubmission({
      ...baseSubmission,
      marketingConsent: false,
    });

    const payload = insertMock.mock.calls[0][0];
    expect(payload.marketing_consent).toBe(false);
    expect(payload.marketing_consent_at).toBeNull();
  });

  it("consentement absent : traité comme un refus (fail-safe)", async () => {
    await insertScoreSubmission(baseSubmission);

    const payload = insertMock.mock.calls[0][0];
    expect(payload.marketing_consent).toBe(false);
    expect(payload.marketing_consent_at).toBeNull();
  });
});
