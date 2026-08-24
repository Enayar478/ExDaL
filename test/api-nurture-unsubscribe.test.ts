/**
 * Tests d'intégration, POST /api/nurture/unsubscribe (PR 4).
 *
 * Point critique : réponse NEUTRE (200) quelle que soit la validité du
 * token, jamais d'oracle exploitable par un tiers ayant intercepté un lien.
 * Couvre aussi le flux one-click (RFC 8058) : token dans l'URL, corps
 * form-urlencoded fixe envoyé par le client mail.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const NURTURE_SECRET = "nurture-secret-de-test-32-caract";

const {
  mockGetServerEnv,
  mockRateLimit,
  mockVerifyUnsubscribeToken,
  mockStopById,
  mockStopByEmail,
} = vi.hoisted(() => ({
  mockGetServerEnv: vi.fn(),
  mockRateLimit: vi.fn(),
  mockVerifyUnsubscribeToken: vi.fn(),
  mockStopById: vi.fn(),
  mockStopByEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mockRateLimit,
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));
vi.mock("@/lib/nurture/token", () => ({
  verifyUnsubscribeToken: mockVerifyUnsubscribeToken,
}));
vi.mock("@/lib/nurture/repository", () => ({
  stopById: mockStopById,
  stopByEmail: mockStopByEmail,
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

const { POST } = await import("@/app/api/nurture/unsubscribe/route");

function jsonRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/nurture/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function oneClickRequest(token: string): NextRequest {
  return new Request(
    `http://localhost/api/nurture/unsubscribe?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "List-Unsubscribe=One-Click",
    },
  ) as unknown as NextRequest;
}

describe("POST /api/nurture/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue({ NURTURE_SECRET });
    mockRateLimit.mockResolvedValue({ allowed: true, remaining: 9 });
    mockStopById.mockResolvedValue(undefined);
    mockStopByEmail.mockResolvedValue(undefined);
  });

  it("503, NURTURE_SECRET non configuré (fail-closed)", async () => {
    mockGetServerEnv.mockReturnValue({ NURTURE_SECRET: undefined });

    const res = await POST(jsonRequest({ token: "x" }));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
    expect(mockStopById).not.toHaveBeenCalled();
  });

  it("429, rate-limit atteint", async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, remaining: 0 });

    const res = await POST(jsonRequest({ token: "x" }));

    expect(res.status).toBe(429);
    expect(mockStopById).not.toHaveBeenCalled();
  });

  it("200, token JSON valide : arrête le parcours par id et par email, sans onlySource", async () => {
    mockVerifyUnsubscribeToken.mockReturnValue({
      valid: true,
      eid: "enrollment-1",
      email: "camille@exemple.fr",
    });

    const res = await POST(jsonRequest({ token: "valide.sig" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockStopById).toHaveBeenCalledWith("enrollment-1", "unsubscribed");
    expect(mockStopByEmail).toHaveBeenCalledWith(
      "camille@exemple.fr",
      "unsubscribed",
    );
    // Pas de 3e argument onlySource : une désinscription arrête TOUT parcours vivant.
    expect(mockStopByEmail.mock.calls[0]).toHaveLength(2);
  });

  it("200, replay (déjà désinscrit) : idempotent, aucune erreur", async () => {
    mockVerifyUnsubscribeToken.mockReturnValue({
      valid: true,
      eid: "enrollment-1",
      email: "camille@exemple.fr",
    });

    const first = await POST(jsonRequest({ token: "valide.sig" }));
    const second = await POST(jsonRequest({ token: "valide.sig" }));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(mockStopById).toHaveBeenCalledTimes(2);
  });

  it("200, token forgé/invalide : réponse neutre, AUCUN effet de bord", async () => {
    mockVerifyUnsubscribeToken.mockReturnValue({
      valid: false,
      reason: "invalid_signature",
    });

    const res = await POST(jsonRequest({ token: "forge.sig" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockStopById).not.toHaveBeenCalled();
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("200, token absent : réponse neutre, aucun effet de bord", async () => {
    const res = await POST(jsonRequest({}));

    expect(res.status).toBe(200);
    expect(mockVerifyUnsubscribeToken).not.toHaveBeenCalled();
    expect(mockStopById).not.toHaveBeenCalled();
  });

  it("200, one-click RFC 8058 (form-urlencoded, token dans l'URL) : accepté", async () => {
    mockVerifyUnsubscribeToken.mockReturnValue({
      valid: true,
      eid: "enrollment-2",
      email: "bob@exemple.fr",
    });

    const res = await POST(oneClickRequest("valide.sig"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockVerifyUnsubscribeToken).toHaveBeenCalledWith("valide.sig");
    expect(mockStopById).toHaveBeenCalledWith("enrollment-2", "unsubscribed");
    expect(mockStopByEmail).toHaveBeenCalledWith(
      "bob@exemple.fr",
      "unsubscribed",
    );
  });
});
