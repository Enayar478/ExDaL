/**
 * Tests d'intégration, POST /api/newsletter
 *
 * On pilote le handler Next.js avec de vraies instances Request (cast NextRequest),
 * sans serveur HTTP. Les dépendances (Supabase, Resend, rate-limit, tokens) sont mockées.
 *
 * Non-régression nurturing (PR 3) : l'inscription à la newsletter Lumen est un
 * parcours distinct du nurturing commercial (qualification/score). Elle ne doit
 * JAMAIS créer d'enrollment, quel que soit le contenu du payload.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 4 }),
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

vi.mock("@/lib/newsletter/repository", () => ({
  upsertSubscriber: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/newsletter/token", () => ({
  generateConfirmToken: vi.fn().mockReturnValue("token.signature"),
}));

vi.mock("@/lib/email/send", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/nurture/repository", () => ({
  createEnrollment: vi.fn().mockResolvedValue({ created: true, id: "enrollment-1" }),
}));

const { POST } = await import("@/app/api/newsletter/route");
const { upsertSubscriber } = await import("@/lib/newsletter/repository");
const { generateConfirmToken } = await import("@/lib/newsletter/token");
const { sendEmail } = await import("@/lib/email/send");
const { rateLimit } = await import("@/lib/rate-limit");
const { createEnrollment } = await import("@/lib/nurture/repository");

const validBody = { email: "camille@exemple.fr", source: "footer" };

function makeRequest(
  body: unknown,
  headers?: Record<string, string>,
): NextRequest {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(raw.length),
      ...headers,
    },
    body: raw,
  }) as unknown as NextRequest;
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertSubscriber).mockResolvedValue(undefined);
    vi.mocked(generateConfirmToken).mockReturnValue("token.signature");
    vi.mocked(sendEmail).mockResolvedValue(true);
    vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 4 });
  });

  it("200, inscription valide : upsert et envoi de l'email de confirmation", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.queued).toBe(true);
    expect(upsertSubscriber).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  // --- Non-régression nurturing (PR 3) ---

  it("200, inscription valide : ne crée JAMAIS d'enrollment nurture", async () => {
    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    expect(createEnrollment).not.toHaveBeenCalled();
  });

  it("200, inscription depuis un lead-magnet (source différente) : toujours aucun enrollment", async () => {
    const res = await POST(
      makeRequest({ email: "dirigeant@exemple.fr", source: "lead-magnet" }),
    );

    expect(res.status).toBe(200);
    expect(createEnrollment).not.toHaveBeenCalled();
  });

  it("422, honeypot rempli : aucun enrollment (Zod rejette avant le handler)", async () => {
    const res = await POST(
      makeRequest({ ...validBody, website: "https://spam.example" }),
    );

    expect(res.status).toBe(422);
    expect(createEnrollment).not.toHaveBeenCalled();
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("422, email invalide", async () => {
    const res = await POST(makeRequest({ email: "pas-un-email" }));
    expect(res.status).toBe(422);
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("400, corps non-JSON", async () => {
    const req = new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "pas du json{{{",
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("429, rate-limit atteint", async () => {
    vi.mocked(rateLimit).mockImplementation(async (key: string) =>
      key === "newsletter:1.2.3.4"
        ? { allowed: false, remaining: 0 }
        : { allowed: true, remaining: 59 },
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("500, upsertSubscriber échoue", async () => {
    vi.mocked(upsertSubscriber).mockRejectedValueOnce(new Error("DB down"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    expect(createEnrollment).not.toHaveBeenCalled();
  });
});
