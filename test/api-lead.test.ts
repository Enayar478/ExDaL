/**
 * Tests d'intégration — POST /api/lead
 *
 * On importe le handler Next.js directement et on le pilote avec de vraies
 * instances Request (cast en NextRequest), sans démarrer de serveur HTTP.
 * Les dépendances externes (Supabase, Cal.com, rate-limit, env) sont mockées.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// --- Mocks déclarés AVANT l'import du handler ---

// Environnement serveur complet (inclut CAL_LINK côté serveur uniquement).
const { mockGetServerEnv } = vi.hoisted(() => {
  return {
    mockGetServerEnv: vi.fn().mockReturnValue({
      SUPABASE_URL: "https://db.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
      CAL_LINK: "exdal/20min",
    }),
  };
});

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));

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
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(raw.length),
      ...headers,
    },
    body: raw,
  }) as unknown as NextRequest;
}

describe("POST /api/lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertLead).mockResolvedValue({ id: "lead-uuid-42" });
    vi.mocked(rateLimit).mockReturnValue({ allowed: true, remaining: 4 });
    mockGetServerEnv.mockReturnValue({
      SUPABASE_URL: "https://db.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
      CAL_LINK: "exdal/20min",
    });
  });

  // --- Happy path ---

  it("200 — lead valide : enregistre et renvoie une calUrl avec metadata[lead_id]", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(typeof json.data.calUrl).toBe("string");
    expect(json.data.calUrl).toContain("cal.com");
    // La corrélation lead↔booking doit être présente dans l'URL Cal.
    const calUrl = new URL(json.data.calUrl);
    expect(calUrl.searchParams.get("metadata[lead_id]")).toBe("lead-uuid-42");
    expect(insertLead).toHaveBeenCalledOnce();
  });

  // --- Segment déduit du stade ---

  it("200 — segment déduit du stade quand absent du payload", async () => {
    const req = makeRequest({ ...validBody, stage: "pilotage" });
    const res = await POST(req);

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
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
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

  // --- CAL_LINK manquant ---

  it("503 — CAL_LINK absent de l'env serveur", async () => {
    mockGetServerEnv.mockReturnValue({
      SUPABASE_URL: "https://db.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
      CAL_LINK: undefined,
    });
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

  // --- Limite de taille du corps ---

  it("413 — corps trop volumineux (Content-Length)", async () => {
    // Corps valide mais Content-Length truqué à une valeur > MAX_BODY_BYTES
    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(9 * 1024), // 9 Ko > 8 Ko limit
      },
      body: JSON.stringify(validBody),
    }) as unknown as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(413);
  });
});
