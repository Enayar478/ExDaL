import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";

/**
 * Le renommage /articles → /journal doit préserver le SEO déjà en ligne :
 * les anciennes URLs indexées répondent en 308 permanent vers les nouvelles.
 * `redirects()` est une fonction async pure exportée dans la config — testable
 * sans runtime Next.js.
 */
describe("redirections /articles → /journal", () => {
  it("expose une fonction redirects()", () => {
    expect(typeof nextConfig.redirects).toBe("function");
  });

  it("redirige /articles et /articles/:slug en permanent (308)", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({
      source: "/articles",
      destination: "/journal",
      permanent: true,
    });
    expect(redirects).toContainEqual({
      source: "/articles/:slug",
      destination: "/journal/:slug",
      permanent: true,
    });
  });
});
