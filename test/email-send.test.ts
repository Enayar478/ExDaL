/**
 * Tests unitaires, lib/email/send.ts.
 *
 * Se concentre sur l'extension "options" (PR 4, nurturing) : replyTo et
 * headers doivent être transmis à Resend quand fournis, et le comportement
 * doit rester strictement inchangé quand ils sont absents (rétrocompatibilité
 * des appelants existants : score, newsletter, cal-webhook).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend, mockGetServerEnv } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockGetServerEnv: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: mockSend } };
  }),
}));
vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

const { sendEmail } = await import("@/lib/email/send");

const CONTENT = { subject: "Sujet", html: "<p>Corps</p>", text: "Corps" };

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue({
      RESEND_API_KEY: "re_test_key",
      RESEND_FROM_EMAIL: "envoi@exdal.fr",
    });
    mockSend.mockResolvedValue({ data: { id: "resend-id-1" }, error: null });
  });

  it("sans options : rétrocompatible, ni replyTo ni headers transmis", async () => {
    const result = await sendEmail("dest@exemple.fr", CONTENT);

    expect(result).toBe(true);
    const payload = mockSend.mock.calls[0][0];
    expect(payload.to).toBe("dest@exemple.fr");
    expect(payload.replyTo).toBeUndefined();
    expect(payload.headers).toBeUndefined();
  });

  it("transmet replyTo et headers quand fournis", async () => {
    const result = await sendEmail("dest@exemple.fr", CONTENT, {
      replyTo: "contact@exdal.fr",
      headers: {
        "List-Unsubscribe": "<https://exdal.fr/api/nurture/unsubscribe?token=x>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    expect(result).toBe(true);
    const payload = mockSend.mock.calls[0][0];
    expect(payload.replyTo).toBe("contact@exdal.fr");
    expect(payload.headers).toEqual({
      "List-Unsubscribe": "<https://exdal.fr/api/nurture/unsubscribe?token=x>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });

  it("replyTo fourni mais undefined (env optionnelle absente) : non transmis", async () => {
    await sendEmail("dest@exemple.fr", CONTENT, { replyTo: undefined });

    const payload = mockSend.mock.calls[0][0];
    expect(payload.replyTo).toBeUndefined();
  });

  it("Resend non configuré : n'appelle pas Resend, retourne false", async () => {
    mockGetServerEnv.mockReturnValue({
      RESEND_API_KEY: undefined,
      RESEND_FROM_EMAIL: undefined,
    });

    const result = await sendEmail("dest@exemple.fr", CONTENT, {
      replyTo: "contact@exdal.fr",
    });

    expect(result).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("Resend renvoie une erreur : retourne false", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "invalid" } });

    const result = await sendEmail("dest@exemple.fr", CONTENT);

    expect(result).toBe(false);
  });

  it("Resend lève une exception : retourne false sans propager", async () => {
    mockSend.mockRejectedValue(new Error("network down"));

    const result = await sendEmail("dest@exemple.fr", CONTENT);

    expect(result).toBe(false);
  });
});
