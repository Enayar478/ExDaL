import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyResendSignature,
  resendWebhookPayload,
  extractRecipientEmail,
  type SvixHeaders,
} from "@/lib/resend-webhook";

// whsec_<base64> : la portion base64 décode en clé HMAC réelle.
const SECRET = "whsec_dGVzdC1yZXNlbmQtc2VjcmV0LWtleQ==";
const KEY = Buffer.from("dGVzdC1yZXNlbmQtc2VjcmV0LWtleQ==", "base64");

function sign(id: string, timestamp: string, body: string): string {
  const digest = createHmac("sha256", KEY)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return `v1,${digest}`;
}

function headersFor(id: string, timestamp: string, body: string): SvixHeaders {
  return { id, timestamp, signature: sign(id, timestamp, body) };
}

describe("verifyResendSignature", () => {
  it("accepte un vecteur valide (id, timestamp, corps signés correctement)", () => {
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_test_1";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers = headersFor(id, timestamp, body);

    expect(verifyResendSignature(body, headers, SECRET)).toBe(true);
  });

  it("rejette un digest valide porté par une version de signature inconnue (v1a)", () => {
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_test_v1a";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers = {
      id,
      timestamp,
      signature: sign(id, timestamp, body).replace(/^v1,/, "v1a,"),
    };

    expect(verifyResendSignature(body, headers, SECRET)).toBe(false);
  });

  it("rejette une signature altérée", () => {
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_test_1";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers: SvixHeaders = {
      id,
      timestamp,
      signature: "v1,ZmF1eC1zaWduYXR1cmU=",
    };

    expect(verifyResendSignature(body, headers, SECRET)).toBe(false);
  });

  it("rejette un timestamp hors tolérance (> 5 minutes)", () => {
    const body = JSON.stringify({ type: "email.bounced" });
    const id = "msg_test_1";
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 10 * 60);
    const headers = headersFor(id, staleTimestamp, body);

    expect(verifyResendSignature(body, headers, SECRET)).toBe(false);
  });

  it("rejette si un en-tête svix manque", () => {
    const body = "{}";
    expect(
      verifyResendSignature(body, { id: null, timestamp: "1", signature: "v1,abc" }, SECRET),
    ).toBe(false);
    expect(
      verifyResendSignature(body, { id: "x", timestamp: null, signature: "v1,abc" }, SECRET),
    ).toBe(false);
    expect(
      verifyResendSignature(body, { id: "x", timestamp: "1", signature: null }, SECRET),
    ).toBe(false);
  });

  it("accepte une correspondance parmi plusieurs signatures espacées", () => {
    const body = JSON.stringify({ type: "email.complained" });
    const id = "msg_test_2";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const valid = sign(id, timestamp, body);
    const headers: SvixHeaders = {
      id,
      timestamp,
      signature: `v1,ZmF1eA== ${valid}`,
    };

    expect(verifyResendSignature(body, headers, SECRET)).toBe(true);
  });

  it("rejette un secret qui n'a pas la forme whsec_<base64>", () => {
    const body = "{}";
    const id = "msg_test_3";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers = headersFor(id, timestamp, body);

    expect(verifyResendSignature(body, headers, "not-a-whsec-secret")).toBe(
      false,
    );
  });
});

describe("resendWebhookPayload / extractRecipientEmail", () => {
  it("parse un événement email.bounced et extrait le premier destinataire", () => {
    const parsed = resendWebhookPayload.parse({
      type: "email.bounced",
      created_at: "2026-08-24T10:00:00Z",
      data: {
        email_id: "abc-123",
        to: ["prospect@exemple.fr"],
        from: "bonjour@exdal.fr",
      },
    });

    expect(parsed.type).toBe("email.bounced");
    expect(extractRecipientEmail(parsed)).toBe("prospect@exemple.fr");
  });

  it("accepte data.to sous forme de chaîne unique", () => {
    const parsed = resendWebhookPayload.parse({
      type: "email.complained",
      data: { to: "prospect@exemple.fr" },
    });
    expect(extractRecipientEmail(parsed)).toBe("prospect@exemple.fr");
  });

  it("retourne null sans destinataire exploitable", () => {
    const parsed = resendWebhookPayload.parse({ type: "email.delivered" });
    expect(extractRecipientEmail(parsed)).toBeNull();
  });

  it("rejette un payload sans type", () => {
    const result = resendWebhookPayload.safeParse({ data: {} });
    expect(result.success).toBe(false);
  });
});
