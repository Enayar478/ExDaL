import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyCalSignature,
  calWebhookPayload,
  formatWhen,
} from "@/lib/cal-webhook";

const secret = "whsec_test_secret";

function sign(body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyCalSignature", () => {
  it("accepte une signature valide", () => {
    const body = JSON.stringify({ triggerEvent: "BOOKING_CREATED" });
    expect(verifyCalSignature(body, sign(body), secret)).toBe(true);
  });

  it("rejette une signature falsifiée", () => {
    const body = JSON.stringify({ triggerEvent: "BOOKING_CREATED" });
    expect(verifyCalSignature(body, "deadbeef", secret)).toBe(false);
  });

  it("rejette une signature absente", () => {
    expect(verifyCalSignature("{}", null, secret)).toBe(false);
  });
});

describe("calWebhookPayload", () => {
  it("parse un payload BOOKING_CREATED avec attendee", () => {
    const parsed = calWebhookPayload.parse({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        startTime: "2026-07-10T09:00:00Z",
        attendees: [{ name: "Alice", email: "alice@exemple.fr" }],
      },
    });
    expect(parsed.payload.attendees[0].email).toBe("alice@exemple.fr");
  });

  it("rejette un payload sans attendee", () => {
    const result = calWebhookPayload.safeParse({
      triggerEvent: "BOOKING_CREATED",
      payload: { attendees: [] },
    });
    expect(result.success).toBe(false);
  });
});

describe("formatWhen", () => {
  it("formate une date ISO en libellé lisible", () => {
    const label = formatWhen("2026-07-10T09:00:00Z");
    expect(typeof label).toBe("string");
    expect(label).toMatch(/2026/);
  });

  it("retourne undefined pour une entrée invalide", () => {
    expect(formatWhen("pas-une-date")).toBeUndefined();
    expect(formatWhen(undefined)).toBeUndefined();
  });
});
