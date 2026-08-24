import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests unitaires, lib/nurture/token.ts.
 *
 * Point critique : confusion de protocole interdite entre le token nurture
 * (désinscription) et le token newsletter (confirmation double opt-in).
 * Un token de l'un ne doit jamais être accepté comme valide par l'autre,
 * y compris si NURTURE_SECRET et NEWSLETTER_SECRET étaient par erreur
 * identiques (le champ `scope`/l'absence de `eid` fait alors barrage).
 */

describe("generateUnsubscribeToken / verifyUnsubscribeToken, secrets distincts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      getServerEnv: () => ({
        NURTURE_SECRET: "nurture-secret-valide-32-chars-x",
        NEWSLETTER_SECRET: "newsletter-secret-valide-32-char",
      }),
    }));
  });

  afterEach(() => {
    vi.doUnmock("@/lib/env");
  });

  it("génère un token et le vérifie avec succès (aller-retour)", async () => {
    const { generateUnsubscribeToken, verifyUnsubscribeToken } =
      await import("@/lib/nurture/token");

    const token = generateUnsubscribeToken("enrollment-1", "test@exemple.fr");
    const result = verifyUnsubscribeToken(token);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.eid).toBe("enrollment-1");
      expect(result.email).toBe("test@exemple.fr");
    }
  });

  it("normalise l'email en minuscules", async () => {
    const { generateUnsubscribeToken, verifyUnsubscribeToken } =
      await import("@/lib/nurture/token");

    const token = generateUnsubscribeToken("enrollment-1", "TEST@EXEMPLE.FR");
    const result = verifyUnsubscribeToken(token);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.email).toBe("test@exemple.fr");
    }
  });

  it("rejette un token altéré (signature falsifiée)", async () => {
    const { generateUnsubscribeToken, verifyUnsubscribeToken } =
      await import("@/lib/nurture/token");

    const token = generateUnsubscribeToken("enrollment-1", "test@exemple.fr");
    const [payload] = token.split(".");
    const tampered = `${payload}.faussesignature`;

    const result = verifyUnsubscribeToken(tampered);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("invalid_signature");
    }
  });

  it("rejette un token malformé (pas de point)", async () => {
    const { verifyUnsubscribeToken } = await import("@/lib/nurture/token");

    const result = verifyUnsubscribeToken("pasdepointdanscetoken");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("malformed");
    }
  });

  it("n'expire jamais (contrairement au token newsletter)", async () => {
    vi.useFakeTimers();
    const { generateUnsubscribeToken, verifyUnsubscribeToken } =
      await import("@/lib/nurture/token");

    const token = generateUnsubscribeToken("enrollment-1", "test@exemple.fr");
    vi.advanceTimersByTime(365 * 24 * 60 * 60 * 1_000); // un an

    const result = verifyUnsubscribeToken(token);
    expect(result.valid).toBe(true);
    vi.useRealTimers();
  });

  it("un token nurture est rejeté par verifyConfirmToken newsletter (secret distinct)", async () => {
    const { generateUnsubscribeToken } = await import("@/lib/nurture/token");
    const { verifyConfirmToken } = await import("@/lib/newsletter/token");

    const token = generateUnsubscribeToken("enrollment-1", "test@exemple.fr");
    const result = verifyConfirmToken(token);

    expect(result.valid).toBe(false);
  });

  it("un token newsletter est rejeté par verifyUnsubscribeToken nurture (secret distinct)", async () => {
    const { generateConfirmToken } = await import("@/lib/newsletter/token");
    const { verifyUnsubscribeToken } = await import("@/lib/nurture/token");

    const token = generateConfirmToken("test@exemple.fr");
    const result = verifyUnsubscribeToken(token);

    expect(result.valid).toBe(false);
  });
});

describe("confusion de protocole, même si les secrets étaient partagés par erreur", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      getServerEnv: () => ({
        NURTURE_SECRET: "secret-partage-par-erreur-32-cha",
        NEWSLETTER_SECRET: "secret-partage-par-erreur-32-cha",
      }),
    }));
  });

  afterEach(() => {
    vi.doUnmock("@/lib/env");
  });

  it("un token nurture reste rejeté par verifyConfirmToken (le champ exp attendu est absent)", async () => {
    const { generateUnsubscribeToken } = await import("@/lib/nurture/token");
    const { verifyConfirmToken } = await import("@/lib/newsletter/token");

    const token = generateUnsubscribeToken("enrollment-1", "test@exemple.fr");
    const result = verifyConfirmToken(token);

    expect(result.valid).toBe(false);
  });

  it("un token newsletter reste rejeté par verifyUnsubscribeToken (le champ eid attendu est absent)", async () => {
    const { generateConfirmToken } = await import("@/lib/newsletter/token");
    const { verifyUnsubscribeToken } = await import("@/lib/nurture/token");

    const token = generateConfirmToken("test@exemple.fr");
    const result = verifyUnsubscribeToken(token);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("malformed");
    }
  });
});
