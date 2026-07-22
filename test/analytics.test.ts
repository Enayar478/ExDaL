import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  capture,
  initAnalytics,
  isAnalyticsKey,
  sanitizeProperties,
} from "@/lib/analytics/client";

describe("catalogue d'événements analytics", () => {
  const names = Object.values(ANALYTICS_EVENTS);

  it("nomme chaque événement en snake_case strict", () => {
    for (const name of names) {
      expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });

  it("ne contient aucun doublon", () => {
    expect(new Set(names).size).toBe(names.length);
  });

  it("couvre les moments clés du tunnel", () => {
    expect(names).toContain("qualification_ouverte");
    expect(names).toContain("lead_soumis");
    expect(names).toContain("score_termine");
    expect(names).toContain("newsletter_inscription");
  });
});

describe("isAnalyticsKey", () => {
  it("accepte une clé projet PostHog (préfixe phc_)", () => {
    expect(isAnalyticsKey("phc_abc123")).toBe(true);
  });

  it("rejette une clé absente, vide ou d'un autre format", () => {
    expect(isAnalyticsKey(undefined)).toBe(false);
    expect(isAnalyticsKey("")).toBe(false);
    expect(isAnalyticsKey("phx_abc123")).toBe(false);
    expect(isAnalyticsKey("sk-secret")).toBe(false);
  });
});

/** Concatène récursivement les sources .ts/.tsx d'un dossier. */
function readSources(dir: string): string {
  return readdirSync(dir)
    .map((entry) => {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) return readSources(full);
      return /\.tsx?$/.test(entry) ? readFileSync(full, "utf-8") : "";
    })
    .join("\n");
}

describe("instrumentation branchée", () => {
  it("chaque événement du catalogue est capturé dans le code", () => {
    const source = ["components", "app", "lib"]
      .map((dir) => readSources(path.join(process.cwd(), dir)))
      .join("\n");
    const missing = Object.keys(ANALYTICS_EVENTS).filter(
      (key) => !new RegExp(`ANALYTICS_EVENTS\\.${key}\\b`).test(source),
    );
    expect(missing).toEqual([]);
  });

  it("la CSP autorise les origines PostHog EU (connect-src et script-src)", async () => {
    const groups = await nextConfig.headers!();
    const csp = groups
      .find((g) => g.source === "/:path*")
      ?.headers.find((h) => h.key === "Content-Security-Policy")?.value;
    expect(csp).toBeDefined();
    const directives = Object.fromEntries(
      (csp as string).split("; ").map((d) => {
        const [name, ...values] = d.split(" ");
        return [name, values];
      }),
    );
    expect(directives["connect-src"]).toContain("https://eu.i.posthog.com");
    expect(directives["connect-src"]).toContain(
      "https://eu-assets.i.posthog.com",
    );
    expect(directives["script-src"]).toContain(
      "https://eu-assets.i.posthog.com",
    );
  });
});

describe("sanitizeProperties (garde anti-PII)", () => {
  it("laisse passer les enums courts, nombres et booléens", () => {
    expect(
      sanitizeProperties({ stage: "pilotage", score: 72, actif: true }),
    ).toEqual({ stage: "pilotage", score: 72, actif: true });
  });

  it("écarte toute valeur ressemblant à un email", () => {
    expect(
      sanitizeProperties({ stage: "pilotage", email: "x@exdal.fr" }),
    ).toEqual({ stage: "pilotage" });
  });

  it("écarte les chaînes trop longues pour être un enum", () => {
    expect(sanitizeProperties({ note: "a".repeat(65) })).toEqual({});
  });

  it("reste immuable et no-op sans propriétés", () => {
    const input = { segment: "pme" } as const;
    const output = sanitizeProperties(input);
    expect(output).not.toBe(input);
    expect(sanitizeProperties(undefined)).toBeUndefined();
  });
});

describe("client analytics hors navigateur", () => {
  it("initAnalytics est un no-op sans window (SSR, tests)", () => {
    expect(() => initAnalytics()).not.toThrow();
  });

  it("capture ne jette jamais tant que l'init n'a pas abouti", () => {
    expect(() =>
      capture(ANALYTICS_EVENTS.leadSoumis, { stage: "pilotage" }),
    ).not.toThrow();
  });
});
