/**
 * Tests unitaires, lib/leads/repository.ts
 *
 * Le point clé RGPD : `marketing_consent_at` n'est horodaté CÔTÉ SERVEUR que
 * si `marketingConsent` vaut `true`. Sinon il reste `null`, jamais une valeur
 * client, jamais une date par défaut.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LeadInput } from "@/lib/validation/lead";

const singleMock = vi.fn();
const selectMock = vi.fn(() => ({ single: singleMock }));
const insertMock = vi.fn(() => ({ select: selectMock }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({ from: fromMock }),
}));

const { insertLead } = await import("@/lib/leads/repository");

const baseLead: LeadInput = {
  name: "Camille Verdier",
  email: "camille@exemple.fr",
  role: "Directrice financière",
  company: "Acme SAS",
  pennylane: "oui",
  stage: "operation",
  marketingConsent: false,
  website: "",
};

describe("insertLead, consentement marketing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { id: "lead-uuid-1" }, error: null });
  });

  it("consentement true : persiste marketing_consent=true et un horodatage serveur", async () => {
    await insertLead({ ...baseLead, marketingConsent: true });

    const payload = insertMock.mock.calls[0][0];
    expect(payload.marketing_consent).toBe(true);
    expect(typeof payload.marketing_consent_at).toBe("string");
    // Format ISO 8601, horodatage serveur.
    expect(new Date(payload.marketing_consent_at).toString()).not.toBe(
      "Invalid Date",
    );
  });

  it("consentement false : persiste marketing_consent=false et aucun horodatage", async () => {
    await insertLead({ ...baseLead, marketingConsent: false });

    const payload = insertMock.mock.calls[0][0];
    expect(payload.marketing_consent).toBe(false);
    expect(payload.marketing_consent_at).toBeNull();
  });
});
