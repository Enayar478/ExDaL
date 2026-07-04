/**
 * Tests d'intégration — POST /api/cal-webhook
 *
 * Cas couverts :
 * - Signature valide + BOOKING_CREATED → 200, markLeadBooked + sendEmail appelés
 * - Signature invalide → 401
 * - CAL_WEBHOOK_SECRET absent (env factice sans secret) → 503 (fail-closed)
 * - triggerEvent inconnu → 200 ignored
 * - Payload sans attendee valide → 422
 * - Rate-limit → 429
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

const FAKE_SECRET = "whsec_test_integration";

// vi.hoisted : les valeurs déclarées ici sont disponibles dans les factories
// de vi.mock (qui sont hoistées en tête de module par Vitest).
const { mockGetServerEnv, mockMarkLeadBooked, mockSendEmail, mockRateLimit } =
  vi.hoisted(() => {
    const FULL_ENV = {
      SUPABASE_URL: "https://db.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
      CAL_WEBHOOK_SECRET: "whsec_test_integration",
      NOTIFICATION_EMAIL: "owner@exdal.fr",
      RESEND_API_KEY: undefined as string | undefined,
      RESEND_FROM_EMAIL: undefined as string | undefined,
    };
    return {
      mockGetServerEnv: vi.fn().mockReturnValue(FULL_ENV),
      mockMarkLeadBooked: vi.fn().mockResolvedValue(undefined),
      mockSendEmail: vi.fn().mockResolvedValue(true),
      mockRateLimit: vi
        .fn()
        .mockReturnValue({ allowed: true, remaining: 29 }),
    };
  });

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/leads/repository", () => ({
  markLeadBooked: mockMarkLeadBooked,
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: mockSendEmail }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mockRateLimit,
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

const { POST } = await import("@/app/api/cal-webhook/route");

// --- Constantes d'environnement réutilisées dans les tests ---

const FAKE_ENV_FULL = {
  SUPABASE_URL: "https://db.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
  CAL_WEBHOOK_SECRET: FAKE_SECRET,
  NOTIFICATION_EMAIL: "owner@exdal.fr",
  RESEND_API_KEY: undefined as string | undefined,
  RESEND_FROM_EMAIL: undefined as string | undefined,
};

const FAKE_ENV_NO_SECRET = {
  ...FAKE_ENV_FULL,
  CAL_WEBHOOK_SECRET: undefined,
};

// --- Helpers ---

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function bookingCreatedPayload(
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    triggerEvent: "BOOKING_CREATED",
    payload: {
      startTime: "2026-07-15T10:00:00Z",
      attendees: [{ name: "Alice Dupont", email: "alice@prospect.fr" }],
      responses: { role: "CEO", company: "Startup SAS" },
      ...((overrides?.payload as Record<string, unknown>) ?? {}),
    },
    ...overrides,
  };
}

function makeRequest(body: unknown, signature: string): NextRequest {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/cal-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cal-signature-256": signature,
    },
    body: raw,
  }) as unknown as NextRequest;
}

function makeSignedRequest(body: unknown, secret = FAKE_SECRET): NextRequest {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/cal-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cal-signature-256": sign(raw, secret),
    },
    body: raw,
  }) as unknown as NextRequest;
}

describe("POST /api/cal-webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue(FAKE_ENV_FULL);
    mockMarkLeadBooked.mockResolvedValue(undefined);
    mockSendEmail.mockResolvedValue(true);
    mockRateLimit.mockReturnValue({ allowed: true, remaining: 29 });
  });

  // --- Happy path ---

  it("200 — BOOKING_CREATED valide : marque le lead et envoie les emails", async () => {
    const body = bookingCreatedPayload();
    const req = makeSignedRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.processed).toBe(true);

    expect(mockMarkLeadBooked).toHaveBeenCalledWith("alice@prospect.fr");

    // 2 emails : confirmation prospect + notif owner
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendEmail.mock.calls[0][0]).toBe("alice@prospect.fr");
    expect(mockSendEmail.mock.calls[1][0]).toBe("owner@exdal.fr");
  });

  it("200 — BOOKING_CREATED sans NOTIFICATION_EMAIL n'envoie qu'un seul email", async () => {
    mockGetServerEnv.mockReturnValue({
      ...FAKE_ENV_FULL,
      NOTIFICATION_EMAIL: undefined,
    });
    const body = bookingCreatedPayload();
    const req = makeSignedRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail.mock.calls[0][0]).toBe("alice@prospect.fr");
  });

  // --- Signature invalide ---

  it("401 — signature invalide", async () => {
    const body = bookingCreatedPayload();
    const req = makeRequest(body, "deadbeefdeadbeef");
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(mockMarkLeadBooked).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("401 — signature absente", async () => {
    const body = bookingCreatedPayload();
    const raw = JSON.stringify(body);
    const req = new Request("http://localhost/api/cal-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    }) as unknown as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  // --- CAL_WEBHOOK_SECRET absent → fail-closed (503) ---

  it("503 — CAL_WEBHOOK_SECRET non configuré → reject fail-closed", async () => {
    mockGetServerEnv.mockReturnValue(FAKE_ENV_NO_SECRET);
    const body = bookingCreatedPayload();
    const req = makeSignedRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
    expect(mockMarkLeadBooked).not.toHaveBeenCalled();
  });

  // --- triggerEvent inconnu ---

  it("200 — triggerEvent inconnu est ignoré sans traitement", async () => {
    const body = {
      triggerEvent: "BOOKING_CANCELLED",
      payload: {
        startTime: "2026-07-15T10:00:00Z",
        attendees: [{ name: "Bob", email: "bob@exemple.fr" }],
      },
    };
    const req = makeSignedRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.ignored).toBe("BOOKING_CANCELLED");
    expect(mockMarkLeadBooked).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  // --- Payload invalide (sans attendee) ---

  it("422 — payload sans attendees (tableau vide)", async () => {
    const body = {
      triggerEvent: "BOOKING_CREATED",
      payload: { attendees: [] },
    };
    const req = makeSignedRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
    expect(mockMarkLeadBooked).not.toHaveBeenCalled();
  });

  it("422 — payload manquant (structure invalide)", async () => {
    const body = { triggerEvent: "BOOKING_CREATED" };
    const req = makeSignedRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  // --- markLeadBooked échoue (best-effort, ne bloque pas les emails) ---

  it("200 — markLeadBooked échoue mais les emails partent quand même", async () => {
    mockMarkLeadBooked.mockRejectedValueOnce(new Error("Supabase timeout"));
    const body = bookingCreatedPayload();
    const req = makeSignedRequest(body);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.processed).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  // --- Rate-limit ---

  it("429 — rate-limit atteint", async () => {
    mockRateLimit.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const body = bookingCreatedPayload();
    const req = makeSignedRequest(body);
    const res = await POST(req);

    expect(res.status).toBe(429);
  });
});
