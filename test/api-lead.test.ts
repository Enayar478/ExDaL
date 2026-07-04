/**
 * Tests d'intégration — POST /api/lead
 *
 * On importe le handler Next.js directement et on le pilote avec de vraies
 * instances Request (cast en NextRequest), sans démarrer de serveur HTTP.
 * Les dépendances externes (Supabase, Cal.com, rate-limit) sont mockées.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";

// --- Mocks déclarés AVANT l'import du handler ---

vi.mock("@/lib/leads/repository", () => ({
  insertLead: vi.fn().mockResolvedValue({ id: "lead-uuid-42" }),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 4 }),
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

// Import différé après les mocks
const { POST } = await import("@/app/api/lead/route");
const { insertLead } = await import("@/lib/leads/repository");
const { rateLimit } = await import("@/lib/rate-limit");

// Lead valide réutilisé dans tous les cas
const validBody = {
  name: "Camille Verdier",
  email: "camille@exemple.fr",
  role: "Directrice financière",
  company: "Acme SAS",
  pennylane: "oui",
  stage: "operation",
};

function makeRequest(
  body: unknown,
  headers?: Record<string, string>,
): NextRequest {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/lead", () => {
  const originalCalLink = process.env.NEXT_PUBLIC_CAL_LINK;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertLead).mockResolvedValue({ id: "lead-uuid-42" });
    vi.mocked(rateLimit).mockReturnValue({ allowed: true, remaining: 4 });
    process.env.NEXT_PUBLIC_CAL_LINK = "exdal/20min";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CAL_LINK = originalCalLink;
  });

  // --- Happy path ---

  it("200 — lead valide : enregistre et renvoie une calUrl", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(typeof json.data.calUrl).toBe("string");
    expect(json.data.calUrl).toContain("cal.com");
    expect(insertLead).toHaveBeenCalledOnce();
  });

  // --- Segment déduit du stade ---

  it("200 — segment déduit du stade quand absent du payload", async () => {
    const req = makeRequest({ ...validBody, stage: "pilotage" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    // insertLead doit avoir reçu segment:"pme" (déduit de stage:"pilotage")
    const call = vi.mocked(insertLead).mock.calls[0][0];
    expect(call.segment).toBe("pme");
  });

  it("200 — segment explicite du sélecteur est préservé", async () => {
    const req = makeRequest({
      ...validBody,
      stage: "pilotage",
      segment: "premium",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const call = vi.mocked(insertLead).mock.calls[0][0];
    expect(call.segment).toBe("premium");
  });

  // --- Erreurs de validation ---

  it("400 — corps non-JSON", async () => {
    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "pas du json{{{",
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("422 — email invalide", async () => {
    const req = makeRequest({ ...validBody, email: "pas-un-email" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
  });

  it("422 — stade inconnu", async () => {
    const req = makeRequest({ ...validBody, stage: "inconnu" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
  });

  it("422 — nom trop court", async () => {
    const req = makeRequest({ ...validBody, name: "X" });
    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  // --- Honeypot ---
  // Le schéma Zod (website: z.string().max(0)) intercepte les valeurs non vides
  // avec une erreur de validation (422) avant même que le handler n'atteigne le
  // check if (lead.website). Le 400 n'est donc jamais atteint pour une valeur
  // non vide — Zod est la première ligne de défense.

  it("422 — honeypot rempli : Zod rejette avant le handler", async () => {
    const req = makeRequest({ ...validBody, website: "https://spam.example" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
    // Zod a rejeté avant insertLead
    expect(insertLead).not.toHaveBeenCalled();
  });

  // --- Variable d'environnement manquante ---

  it("503 — NEXT_PUBLIC_CAL_LINK absent", async () => {
    delete process.env.NEXT_PUBLIC_CAL_LINK;
    const req = makeRequest(validBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
  });

  // --- Erreur Supabase ---

  it("500 — insertLead rejette (Supabase down)", async () => {
    vi.mocked(insertLead).mockRejectedValueOnce(new Error("DB unavailable"));
    const req = makeRequest(validBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });

  // --- Rate-limit ---

  it("429 — rate-limit atteint", async () => {
    vi.mocked(rateLimit).mockReturnValueOnce({ allowed: false, remaining: 0 });
    const req = makeRequest(validBody);
    const res = await POST(req);

    expect(res.status).toBe(429);
  });
});
