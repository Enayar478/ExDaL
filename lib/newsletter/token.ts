import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/env";

/**
 * Tokens de confirmation newsletter signés HMAC-SHA256 (sans lib JWT).
 * Payload : email + expiration (Unix ms). Encodé en base64url.
 * Secret : variable NEWSLETTER_SECRET (fail-fast si absente).
 */

const EXPIRY_MS = 24 * 60 * 60 * 1_000; // 24 heures

interface TokenPayload {
  email: string;
  exp: number; // timestamp Unix ms
}

function getSecret(): string {
  const env = getServerEnv();
  if (!env.NEWSLETTER_SECRET) {
    throw new Error(
      "NEWSLETTER_SECRET manquant, impossible de signer les tokens newsletter.",
    );
  }
  return env.NEWSLETTER_SECRET;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const base64 = remainder ? padded + "=".repeat(4 - remainder) : padded;
  return Buffer.from(base64, "base64").toString("utf8");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Génère un token signé pour la confirmation d'inscription. */
export function generateConfirmToken(email: string): string {
  const secret = getSecret();
  const payload: TokenPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + EXPIRY_MS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

/** Résultat de la vérification d'un token. */
export type VerifyResult =
  | { valid: true; email: string }
  | { valid: false; reason: "malformed" | "expired" | "invalid_signature" };

/** Vérifie le token et retourne l'email si valide, sinon la raison du rejet. */
export function verifyConfirmToken(token: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed" };
  }

  const [encodedPayload, receivedSig] = parts;

  // Vérification de la signature en temps constant (anti-timing-attack).
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false, reason: "malformed" };
  }

  const expectedSig = sign(encodedPayload, secret);
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  const receivedBuf = Buffer.from(receivedSig, "utf8");

  const sigsMatch =
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf);

  if (!sigsMatch) {
    return { valid: false, reason: "invalid_signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as TokenPayload;
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (!payload.email || typeof payload.exp !== "number") {
    return { valid: false, reason: "malformed" };
  }

  if (Date.now() > payload.exp) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, email: payload.email };
}
