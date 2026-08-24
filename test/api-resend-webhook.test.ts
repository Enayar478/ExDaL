/**
 * Tests d'intégration, POST /api/resend-webhook
 *
 * Cas couverts :
 * - Signature valide + email.bounced → 200, stopByEmail("...", "bounced")
 * - Signature valide + email.complained → 200, stopByEmail("...", "complained")
 * - Signature altérée → 401
 * - Timestamp hors tolérance → 401
 * - RESEND_WEBHOOK_SECRET absent → 503 (fail-closed)
 * - Type d'événement inconnu → 200 ignored, sans effet
 * - Rate-limit → 429
 * - Payload sans destinataire → 200, sans appel stopByEmail
 * - stopByEmail échoue (best-effort) → 200 quand même
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

const SECRET = "whsec_dGVzdC1yZXNlbmQtc2VjcmV0LWtleQ==";
const KEY = Buffer.from("dGVzdC1yZXNlbmQtc2VjcmV0LWtleQ==", "base64");

const { mockGetServerEnv, mockRateLimit, mockStopByEmail } = vi.hoisted(
  () => {
    const FULL_ENV = {
      SUPABASE_URL: "https://db.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
      RESEND_WEBHOOK_SECRET: "whsec_dGVzdC1yZXNlbmQtc2VjcmV0LWtleQ==",
    };
    return {
      mockGetServerEnv: vi.fn().mockReturnValue(FULL_ENV),
      mockRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 29 }),
      mockStopByEmail: vi.fn().mockResolvedValue(undefined),
    };
  },
);

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mockRateLimit,
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));
vi.mock("@/lib/nurture/repository", () => ({
  stopByEmail: mockStopByEmail,
}));

const { POST } = await import("@/app/api/resend-webhook/route");

const FAKE_ENV_FULL = {
  SUPABASE_URL: "https://db.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
  RESEND_WEBHOOK_SECRET: SECRET,
};

const FAKE_ENV_NO_SECRET = {
  ...FAKE_ENV_FULL,
  RESEND_WEBHOOK_SECRET: undefined,
};

function sign(id: string, timestamp: string, body: string): string {
  const digest = createHmac("sha256", KEY)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return `v1,${digest}`;
}

function bouncedPayload(overrides?: Record<string, unknown>) {
  return {
    type: "email.bounced",
    created_at: "2026-08-24T10:00:00Z",
    data: {
      email_id: "abc-123",
      to: ["prospect@exemple.fr"],
      from: "bonjour@exdal.fr",
      ...((overrides?.data as Record<string, unknown>) ?? {}),
    },
    ...overrides,
  };
}

function makeSignedRequest(
  body: unknown,
  options?: { id?: string; timestamp?: string },
): NextRequest {
  const raw = JSON.stringify(body);
  const id = options?.id ?? "msg_test_1";
  const timestamp = options?.timestamp ?? String(Math.floor(Date.now() / 1000));
  return new Request("http://localhost/api/resend-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": sign(id, timestamp, raw),
    },
    body: raw,
  }) as unknown as NextRequest;
}

describe("POST /api/resend-webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue(FAKE_ENV_FULL);
    mockRateLimit.mockReturnValue({ allowed: true, remaining: 29 });
    mockStopByEmail.mockResolvedValue(undefined);
  });

  it("200, email.bounced avec signature valide : stoppe les parcours vivants", async () => {
    const req = makeSignedRequest(bouncedPayload());
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.processed).toBe(true);
    expect(mockStopByEmail).toHaveBeenCalledWith(
      "prospect@exemple.fr",
      "bounced",
    );
  });

  it("200, email.complained avec signature valide : stoppe les parcours vivants", async () => {
    const req = makeSignedRequest(
      bouncedPayload({ type: "email.complained" }),
    );
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockStopByEmail).toHaveBeenCalledWith(
      "prospect@exemple.fr",
      "complained",
    );
  });

  it("401, signature altérée", async () => {
    const body = bouncedPayload();
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const req = new Request("http://localhost/api/resend-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": "msg_test_1",
        "svix-timestamp": timestamp,
        "svix-signature": "v1,ZmF1eC1zaWduYXR1cmU=",
      },
      body: raw,
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("401, timestamp hors tolérance (> 5 minutes)", async () => {
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 10 * 60);
    const req = makeSignedRequest(bouncedPayload(), {
      timestamp: staleTimestamp,
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("503, RESEND_WEBHOOK_SECRET non configuré → reject fail-closed", async () => {
    mockGetServerEnv.mockReturnValue(FAKE_ENV_NO_SECRET);
    const req = makeSignedRequest(bouncedPayload());
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("200, type d'événement inconnu : ignoré sans effet", async () => {
    const req = makeSignedRequest(
      bouncedPayload({ type: "email.delivered" }),
    );
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.ignored).toBe("email.delivered");
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("429, rate-limit atteint", async () => {
    mockRateLimit.mockReturnValueOnce({ allowed: false, remaining: 0 });
    const req = makeSignedRequest(bouncedPayload());
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("200, payload sans destinataire exploitable : aucun appel stopByEmail", async () => {
    const req = makeSignedRequest({
      type: "email.bounced",
      data: { email_id: "abc-123" },
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.processed).toBe(false);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });

  it("200, stopByEmail échoue (best-effort) : réponse 200 quand même", async () => {
    mockStopByEmail.mockRejectedValueOnce(new Error("Supabase timeout"));
    const req = makeSignedRequest(bouncedPayload());
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.processed).toBe(true);
  });

  it("422, payload sans champ type", async () => {
    const req = makeSignedRequest({ data: {} });
    const res = await POST(req);

    expect(res.status).toBe(422);
    expect(mockStopByEmail).not.toHaveBeenCalled();
  });
});
