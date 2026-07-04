import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * Tests unitaires du module lib/newsletter/token.ts
 * On mock getServerEnv pour contrôler le secret sans env réel.
 */

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    NEWSLETTER_SECRET: "test-secret-valide-32-chars-xxxx",
  }),
}));

// Import après le mock pour que les imports internes du module utilisent le mock.
const { generateConfirmToken, verifyConfirmToken } =
  await import("@/lib/newsletter/token");

describe("generateConfirmToken / verifyConfirmToken", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("génère un token valide et le vérifie avec succès", () => {
    const email = "test@exemple.fr";
    const token = generateConfirmToken(email);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(2);

    const result = verifyConfirmToken(token);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.email).toBe(email);
    }
  });

  it("normalise l'email en minuscules", () => {
    const token = generateConfirmToken("TEST@EXEMPLE.FR");
    const result = verifyConfirmToken(token);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.email).toBe("test@exemple.fr");
    }
  });

  it("rejette un token avec signature falsifiée", () => {
    const token = generateConfirmToken("test@exemple.fr");
    const [payload] = token.split(".");
    const tampered = `${payload}.faussesignature`;

    const result = verifyConfirmToken(tampered);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("invalid_signature");
    }
  });

  it("rejette un token malformé (pas de point)", () => {
    const result = verifyConfirmToken("pasdepointdanscetoken");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("malformed");
    }
  });

  it("rejette un token expiré", () => {
    vi.useFakeTimers();
    const token = generateConfirmToken("test@exemple.fr");

    // Avancer de 25 heures (> 24h d'expiration)
    vi.advanceTimersByTime(25 * 60 * 60 * 1_000);

    const result = verifyConfirmToken(token);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("expired");
    }
  });

  it("accepte un token non encore expiré (23h59)", () => {
    vi.useFakeTimers();
    const token = generateConfirmToken("test@exemple.fr");

    // Avancer de 23h59 (< 24h d'expiration)
    vi.advanceTimersByTime(23 * 60 * 60 * 1_000 + 59 * 60 * 1_000);

    const result = verifyConfirmToken(token);
    expect(result.valid).toBe(true);
  });

  it("rejette un payload JSON invalide (payload base64 non-JSON)", async () => {
    // On forge un token avec un payload qui n'est pas du JSON valide
    const { createHmac } = await import("node:crypto");
    const secret = "test-secret-valide-32-chars-xxxx";
    const badPayload = Buffer.from("pas du json").toString("base64url");
    const sig = createHmac("sha256", secret)
      .update(badPayload)
      .digest("base64url");
    const token = `${badPayload}.${sig}`;

    const result = verifyConfirmToken(token);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("malformed");
    }
  });
});
