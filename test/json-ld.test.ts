import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";

// Séparateurs de ligne Unicode construits par code point (aucun caractère
// invisible dans la source du test).
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe("serializeJsonLd", () => {
  it("neutralise une évasion de balise </script>", () => {
    const out = serializeJsonLd({
      headline: "</script><script>alert(1)</script>",
    });
    // Aucun chevron/esperluette littéral ne subsiste : impossible de fermer la
    // balise <script> ni d'injecter du balisage actif.
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    expect(out).not.toContain("</script");
  });

  it("échappe les séparateurs de ligne U+2028 / U+2029", () => {
    const out = serializeJsonLd({ body: `a${LS}b${PS}c` });
    expect(out).not.toContain(LS);
    expect(out).not.toContain(PS);
  });

  it("reste du JSON valide qui se redécode à l'identique", () => {
    const data = {
      "@context": "https://schema.org",
      headline: 'Titre <b>gras</b> & "guillemets"',
      nested: { url: "https://exdal.fr/journal/a?x=1&y=2" },
      sep: `ligne${LS}suite`,
    };
    // Le navigateur reparse le contenu du <script> comme du JSON : round-trip exact.
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("laisse un contenu simple sémantiquement intact", () => {
    const data = { name: "Ex Datis Lumen", url: "https://exdal.fr" };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
