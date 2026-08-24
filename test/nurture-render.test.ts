/**
 * Tests unitaires, lib/nurture/render.ts.
 */
import { describe, it, expect } from "vitest";
import { renderNurtureEmail } from "@/lib/nurture/render";
import { escapeHtml } from "@/lib/email/html";
import { PILOTAGE_EMAILS } from "@/lib/nurture/content/pilotage";
import { CABINET_EMAILS } from "@/lib/nurture/content/cabinet";
import { PREMIUM_EMAILS } from "@/lib/nurture/content/premium";

const SEQUENCES = {
  pilotage: PILOTAGE_EMAILS,
  cabinet: CABINET_EMAILS,
  premium: PREMIUM_EMAILS,
};

const UNSUBSCRIBE_URL = "https://exdal.fr/api/nurture/unsubscribe?token=abc123";

describe("renderNurtureEmail", () => {
  for (const [sequence, emails] of Object.entries(SEQUENCES)) {
    for (const def of emails) {
      it(`rend un EmailContent complet pour ${sequence}, étape ${def.step}`, () => {
        const result = renderNurtureEmail(def, {
          unsubscribeUrl: UNSUBSCRIBE_URL,
        });

        expect(result.subject).toBe(def.subject);
        expect(result.subject).not.toMatch(/[\r\n]/);
        expect(result.html).toContain(UNSUBSCRIBE_URL);
        expect(result.text).toContain(UNSUBSCRIBE_URL);
        expect(result.html.startsWith("<!DOCTYPE html>")).toBe(true);
        expect(result.text.length).toBeGreaterThan(0);
      });
    }
  }

  it("insère le prénom quand il est fourni", () => {
    const [def] = PILOTAGE_EMAILS;
    const result = renderNurtureEmail(def, {
      unsubscribeUrl: UNSUBSCRIBE_URL,
      firstName: "Camille",
    });

    expect(result.html).toContain("Bonjour Camille,");
    expect(result.text).toContain("Bonjour Camille,");
  });

  it("ne salue personne quand firstName est absent", () => {
    const [def] = PILOTAGE_EMAILS;
    const result = renderNurtureEmail(def, { unsubscribeUrl: UNSUBSCRIBE_URL });

    expect(result.html).not.toContain("Bonjour");
    expect(result.text).not.toContain("Bonjour");
  });

  it("échappe le prénom pour prévenir une injection HTML", () => {
    const [def] = PILOTAGE_EMAILS;
    const result = renderNurtureEmail(def, {
      unsubscribeUrl: UNSUBSCRIBE_URL,
      firstName: "<script>alert(1)</script>",
    });

    expect(result.html).not.toContain("<script>alert(1)</script>");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("échappe l'URL de désinscription dans le HTML", () => {
    const [def] = PILOTAGE_EMAILS;
    const maliciousUrl =
      'https://exdal.fr/unsub?token="><script>alert(1)</script>';
    const result = renderNurtureEmail(def, { unsubscribeUrl: maliciousUrl });

    expect(result.html).not.toContain("<script>alert(1)</script>");
  });

  it("inclut le preheader en HTML masqué quand il est fourni", () => {
    const def = PILOTAGE_EMAILS.find((email) => email.preheader);
    expect(def).toBeDefined();
    if (!def?.preheader) return;

    const result = renderNurtureEmail(def, { unsubscribeUrl: UNSUBSCRIBE_URL });
    expect(result.html).toContain(escapeHtml(def.preheader));
  });
});
