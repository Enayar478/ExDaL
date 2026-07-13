/**
 * Tests d'intégration — POST /api/score
 *
 * On pilote le handler Next.js avec de vraies instances Request (cast NextRequest),
 * sans serveur HTTP. Les dépendances (Supabase, Resend, rate-limit, env) sont mockées.
 * Le point clé : le score est TOUJOURS recalculé serveur, jamais lu depuis le client.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { QUESTIONS } from "@/lib/score/content";

const { mockGetServerEnv } = vi.hoisted(() => ({
  mockGetServerEnv: vi.fn().mockReturnValue({
    SUPABASE_URL: "https://db.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service_role_key_1234567890",
    RESEND_API_KEY: "re_123",
    RESEND_FROM_EMAIL: "hello@exdal.fr",
  }),
}));

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));

vi.mock("@/lib/score/repository", () => ({
  insertScoreSubmission: vi.fn().mockResolvedValue({ id: "score-uuid-1" }),
}));

vi.mock("@/lib/email/send", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 4 }),
  clientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

const { POST } = await import("@/app/api/score/route");
const { insertScoreSubmission } = await import("@/lib/score/repository");
const { sendEmail } = await import("@/lib/email/send");
const { rateLimit } = await import("@/lib/rate-limit");

/** Réponses complètes et valides — chaque question reçoit l'option donnée par `letter`. */
function answersWith(letter: "a" | "b" | "c"): Record<string, string> {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, `${q.id}${letter}`]));
}

const validBody = { email: "camille@exemple.fr", answers: answersWith("a") };

function makeRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(raw.length),
      ...headers,
    },
    body: raw,
  }) as unknown as NextRequest;
}

describe("POST /api/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertScoreSubmission).mockResolvedValue({ id: "score-uuid-1" });
    vi.mocked(sendEmail).mockResolvedValue(true);
    vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 4 });
  });

  it("200 — soumission valide : persiste et envoie le plan", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.delivered).toBe(true);
    expect(insertScoreSubmission).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("200 — recalcule le score CÔTÉ SERVEUR (ignore toute valeur client)", async () => {
    // Le client tente d'injecter un score de 100 ; il ne doit pas être lu.
    const res = await POST(makeRequest({ ...validBody, score: 100 }));
    expect(res.status).toBe(200);

    const call = vi.mocked(insertScoreSubmission).mock.calls[0][0];
    // Toutes les réponses au pire niveau → score serveur = 0, verdict "fondations".
    expect(call.score).toBe(0);
    expect(call.verdict).toBe("fondations");
  });

  it("200 — un sans-faute donne 100 / verdict pret", async () => {
    await POST(makeRequest({ email: "a@b.fr", answers: answersWith("c") }));
    const call = vi.mocked(insertScoreSubmission).mock.calls[0][0];
    expect(call.score).toBe(100);
    expect(call.verdict).toBe("pret");
  });

  it("422 — email invalide", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "pas-un-email" }));
    expect(res.status).toBe(422);
    expect(insertScoreSubmission).not.toHaveBeenCalled();
  });

  it("422 — diagnostic incomplet (une question manquante)", async () => {
    const answers = answersWith("a");
    delete answers.q5;
    const res = await POST(makeRequest({ email: "a@b.fr", answers }));
    expect(res.status).toBe(422);
    expect(insertScoreSubmission).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("422 — honeypot rempli : Zod rejette avant le handler", async () => {
    const res = await POST(makeRequest({ ...validBody, website: "https://spam" }));
    expect(res.status).toBe(422);
    expect(insertScoreSubmission).not.toHaveBeenCalled();
  });

  it("400 — corps non-JSON", async () => {
    const req = new Request("http://localhost/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "pas du json{{{",
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("413 — corps trop volumineux (Content-Length)", async () => {
    const req = new Request("http://localhost/api/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(5 * 1024),
      },
      body: JSON.stringify(validBody),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(413);
  });

  it("429 — rate-limit atteint", async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0 });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("200 — échec de persistance : le plan est quand même envoyé (best-effort)", async () => {
    vi.mocked(insertScoreSubmission).mockRejectedValueOnce(new Error("DB down"));
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.delivered).toBe(true);
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("200 — email non envoyé (Resend down) : réponse neutre", async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce(false);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
  });
});
