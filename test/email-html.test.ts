import { describe, it, expect } from "vitest";
import { escapeHtml, maskEmail } from "@/lib/email/html";
import { ownerNotification, prospectConfirmation } from "@/lib/email/templates";

describe("escapeHtml", () => {
  it("neutralise les balises et attributs dangereux", () => {
    const payload = `<img src=x onerror="alert(1)">`;
    const escaped = escapeHtml(payload);
    expect(escaped).not.toContain("<img");
    expect(escaped).toContain("&lt;img");
    expect(escaped).toContain("&quot;");
  });

  it("échappe les esperluettes et apostrophes", () => {
    expect(escapeHtml("Renard & O'Brien")).toBe("Renard &amp; O&#039;Brien");
  });

  it("laisse un texte simple intact", () => {
    expect(escapeHtml("Camille Verdier")).toBe("Camille Verdier");
  });
});

describe("maskEmail", () => {
  it("masque la partie locale au-delà de 2 caractères", () => {
    expect(maskEmail("camille@exemple.fr")).toBe("ca***@exemple.fr");
  });

  it("retourne *** pour une entrée sans domaine", () => {
    expect(maskEmail("pas-un-email")).toBe("***");
  });
});

describe("templates — pas d'injection HTML", () => {
  const hostile = {
    name: `<script>alert(1)</script>`,
    email: "evil@x.fr",
    role: `<img src=x onerror=alert(1)>`,
    company: `Acme"&<b>`,
    when: "jeudi 10 juillet 2026 à 09:00",
  };

  it("ownerNotification échappe tous les champs externes", () => {
    const { html } = ownerNotification(hostile);
    // Aucune balise active injectée (les chevrons sont échappés → inertes).
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
  });

  it("prospectConfirmation échappe le nom", () => {
    const { html } = prospectConfirmation(hostile);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
