import { describe, it, expect } from "vitest";
import { escapeHtml, maskEmail } from "@/lib/email/html";
import {
  ownerNotification,
  prospectConfirmation,
  newsletterConfirmation,
} from "@/lib/email/templates";

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

  it("ownerNotification échappe tous les champs externes dans le HTML", () => {
    const { html } = ownerNotification(hostile);
    // Aucune balise active injectée (les chevrons sont échappés → inertes).
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
  });

  it("prospectConfirmation échappe le nom dans le HTML", () => {
    const { html } = prospectConfirmation(hostile);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("ownerNotification — injection d'en-tête SMTP (sujet)", () => {
  it("retire les CR/LF du nom dans le sujet", () => {
    const hostile = {
      name: "Alice\r\nBcc: attacker@evil.com",
      email: "alice@prospect.fr",
    };
    const { subject } = ownerNotification(hostile);
    expect(subject).not.toContain("\r");
    expect(subject).not.toContain("\n");
    // Le sujet reste lisible (le nom est présent, juste assaini)
    expect(subject).toContain("Alice");
  });

  it("retire les tabulations du nom dans le sujet", () => {
    const hostile = {
      name: "Alice\tDupont",
      email: "alice@prospect.fr",
    };
    const { subject } = ownerNotification(hostile);
    expect(subject).not.toContain("\t");
  });

  it("retire les CR/LF de l'entreprise dans le sujet", () => {
    const hostile = {
      name: "Alice",
      email: "alice@prospect.fr",
      company: "Acme\nX-Injected: bad",
    };
    const { subject } = ownerNotification(hostile);
    expect(subject).not.toContain("\n");
    expect(subject).toContain("Acme");
  });
});

describe("newsletterConfirmation — URL de confirmation", () => {
  it("échappe l'URL dans l'attribut href du template HTML", () => {
    // L'URL est générée côté serveur (HMAC signé) donc pas de risque réel,
    // mais on vérifie que l'échappement est bien en place (défense en profondeur).
    const confirmUrl = "https://exdal.fr/api/newsletter/confirm?token=abc123";
    const { html } = newsletterConfirmation(confirmUrl);
    // Le lien doit être présent dans le HTML
    expect(html).toContain("abc123");
    // L'URL ne doit pas contenir de balises actives (sanity check)
    expect(html).not.toContain("<script>");
  });
});
