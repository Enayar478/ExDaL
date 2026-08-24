import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/env";

/**
 * Tokens de désinscription du nurturing, signés HMAC-SHA256 (sans lib JWT).
 * Secret dédié : NURTURE_SECRET. JAMAIS NEWSLETTER_SECRET.
 *
 * Confusion de protocole interdite : un lien de désinscription nurture ne
 * doit jamais pouvoir être rejoué comme un token de confirmation newsletter,
 * ni l'inverse. Deux garde-fous indépendants assurent cette séparation :
 *   1. Secrets distincts (NURTURE_SECRET vs NEWSLETTER_SECRET) : une
 *      signature calculée avec l'un ne peut valider un payload signé avec
 *      l'autre.
 *   2. Un champ `scope` fixe (« nurture-unsub ») dans le payload, vérifié
 *      APRÈS la signature : même si les deux secrets étaient identiques par
 *      erreur de configuration, un token de l'autre protocole (qui ne porte
 *      pas ce champ, ou une valeur différente) est rejeté.
 *
 * Pas d'expiration (contrairement au token newsletter) : un lien de
 * désinscription doit rester valable indéfiniment, y compris des mois après
 * l'envoi de l'email qui le contenait.
 */

const SCOPE = "nurture-unsub";
const TOKEN_VERSION = 1;

interface TokenPayload {
  v: number;
  scope: string;
  eid: string; // id de l'enrollment concerné
  email: string;
}

function getSecret(): string {
  const env = getServerEnv();
  if (!env.NURTURE_SECRET) {
    throw new Error(
      "NURTURE_SECRET manquant, impossible de signer les tokens de désinscription nurture.",
    );
  }
  return env.NURTURE_SECRET;
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

/** Génère un token de désinscription pour un enrollment et un email donnés. */
export function generateUnsubscribeToken(eid: string, email: string): string {
  const secret = getSecret();
  const payload: TokenPayload = {
    v: TOKEN_VERSION,
    scope: SCOPE,
    eid,
    email: email.trim().toLowerCase(),
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

/** Résultat de la vérification d'un token de désinscription. */
export type VerifyUnsubscribeResult =
  | { valid: true; eid: string; email: string }
  | { valid: false; reason: "malformed" | "invalid_signature" | "invalid_scope" };

/** Vérifie le token et retourne l'enrollment/email visés, sinon la raison du rejet. */
export function verifyUnsubscribeToken(token: string): VerifyUnsubscribeResult {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed" };
  }

  const [encodedPayload, receivedSig] = parts;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false, reason: "malformed" };
  }

  // Vérification de la signature en temps constant (anti-timing-attack).
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

  if (!payload.eid || !payload.email || typeof payload.v !== "number") {
    return { valid: false, reason: "malformed" };
  }

  // Rejet structurel : un token valide d'un autre protocole (ex. confirmation
  // newsletter) n'aura jamais ce scope, même signé avec le même secret.
  if (payload.scope !== SCOPE) {
    return { valid: false, reason: "invalid_scope" };
  }

  return { valid: true, eid: payload.eid, email: payload.email };
}
