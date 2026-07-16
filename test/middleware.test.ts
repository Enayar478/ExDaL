import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { middleware } from "@/middleware";

/**
 * Le middleware protège /admin (Basic Auth, fail-closed). Il ne lit que
 * `request.headers.get("authorization")` : un objet minimal suffit à l'exercer.
 */
function requestWith(authorization?: string): NextRequest {
  return {
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "authorization" ? (authorization ?? null) : null,
    },
  } as unknown as NextRequest;
}

function basicHeader(user: string, password: string): string {
  return `Basic ${btoa(`${user}:${password}`)}`;
}

const VALID_PASSWORD = "mot-de-passe-tres-long-2026"; // >= 16 caractères

describe("middleware Basic Auth /admin (fail-closed)", () => {
  const previous = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });
  afterEach(() => {
    if (previous === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous;
  });

  it("renvoie 404 quand ADMIN_PASSWORD n'est pas configuré", () => {
    const res = middleware(requestWith(basicHeader("x", VALID_PASSWORD)));
    expect(res.status).toBe(404);
  });

  it("renvoie 404 quand ADMIN_PASSWORD est trop court (< 16)", () => {
    process.env.ADMIN_PASSWORD = "court";
    const res = middleware(requestWith(basicHeader("x", "court")));
    expect(res.status).toBe(404);
  });

  it("renvoie 401 + WWW-Authenticate sans en-tête Authorization", () => {
    process.env.ADMIN_PASSWORD = VALID_PASSWORD;
    const res = middleware(requestWith(undefined));
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toContain("Basic");
  });

  it("renvoie 401 avec un mauvais mot de passe", () => {
    process.env.ADMIN_PASSWORD = VALID_PASSWORD;
    const res = middleware(requestWith(basicHeader("x", "mauvais-mot-de-passe")));
    expect(res.status).toBe(401);
  });

  it("laisse passer avec le bon mot de passe (utilisateur ignoré)", () => {
    process.env.ADMIN_PASSWORD = VALID_PASSWORD;
    const res = middleware(
      requestWith(basicHeader("nimporte", VALID_PASSWORD)),
    );
    expect(res.status).toBe(200);
  });

  it("renvoie 401 (pas 500) sur un en-tête base64 malformé", () => {
    process.env.ADMIN_PASSWORD = VALID_PASSWORD;
    const res = middleware(requestWith("Basic ###pas-du-base64###"));
    expect(res.status).toBe(401);
  });

  it("renvoie 401 sur un schéma non Basic", () => {
    process.env.ADMIN_PASSWORD = VALID_PASSWORD;
    const res = middleware(requestWith("Bearer un-token"));
    expect(res.status).toBe(401);
  });
});
