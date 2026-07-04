/**
 * Tests d'intégration — POST /api/segment
 *
 * Le handler enregistre un signal de segmentation (clic sur une porte).
 * Il est silencieux côté UX : un 500 ne bloque pas l'utilisateur.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/leads/repository", () => ({
  insertPathSignal: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 19 }),
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

const { POST } = await import("@/app/api/segment/route");
const { insertPathSignal } = await import("@/lib/leads/repository");
const { rateLimit } = await import("@/lib/rate-limit");

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/segment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/segment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertPathSignal).mockResolvedValue(undefined);
    vi.mocked(rateLimit).mockReturnValue({ allowed: true, remaining: 19 });
  });

  // --- Happy path ---

  it("200 — segment valide (pme)", async () => {
    const req = makeRequest({ segment: "pme" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.recorded).toBe(true);
    expect(insertPathSignal).toHaveBeenCalledWith("pme");
  });

  it("200 — segment valide (cabinet)", async () => {
    const req = makeRequest({ segment: "cabinet" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(insertPathSignal).toHaveBeenCalledWith("cabinet");
  });

  it("200 — segment valide (premium)", async () => {
    const req = makeRequest({ segment: "premium" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(insertPathSignal).toHaveBeenCalledWith("premium");
  });

  // --- Erreurs de validation ---

  it("400 — corps non-JSON", async () => {
    const req = new Request("http://localhost/api/segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{{invalide}}",
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("422 — segment inconnu", async () => {
    const req = makeRequest({ segment: "vip" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
    expect(insertPathSignal).not.toHaveBeenCalled();
  });

  it("422 — champ segment absent", async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  // --- Erreur Supabase ---

  it("500 — insertPathSignal rejette", async () => {
    vi.mocked(insertPathSignal).mockRejectedValueOnce(new Error("DB error"));
    const req = makeRequest({ segment: "pme" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });

  // --- Rate-limit ---

  it("429 — rate-limit atteint", async () => {
    vi.mocked(rateLimit).mockReturnValueOnce({ allowed: false, remaining: 0 });
    const req = makeRequest({ segment: "pme" });
    const res = await POST(req);

    expect(res.status).toBe(429);
  });
});
