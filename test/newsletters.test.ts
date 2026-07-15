import { describe, it, expect } from "vitest";
import { NEWSLETTERS, LUMEN } from "@/lib/newsletters";

describe("catalogue des newsletters", () => {
  it("expose au moins une newsletter, dont Lumen", () => {
    expect(NEWSLETTERS.length).toBeGreaterThan(0);
    expect(NEWSLETTERS).toContain(LUMEN);
  });

  it("garantit des slugs uniques et en kebab-case", () => {
    const slugs = NEWSLETTERS.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("respecte les bornes SEO (metaTitle ≤ 60, metaDescription ≤ 160)", () => {
    for (const nl of NEWSLETTERS) {
      expect(nl.metaTitle.length).toBeLessThanOrEqual(60);
      expect(nl.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });

  it("fournit la copy essentielle et 3 bénéfices non vides", () => {
    for (const nl of NEWSLETTERS) {
      expect(nl.title.length).toBeGreaterThan(0);
      expect(nl.lede.length).toBeGreaterThan(0);
      expect(nl.tagline.length).toBeGreaterThan(0);
      expect(nl.ctaLabel.length).toBeGreaterThan(0);
      expect(nl.source.length).toBeGreaterThan(0);
      expect(nl.benefits.length).toBe(3);
      for (const b of nl.benefits) {
        expect(b.title.length).toBeGreaterThan(0);
        expect(b.body.length).toBeGreaterThan(0);
      }
    }
  });
});
