import { describe, it, expect } from "vitest";
import { buildCalUrl } from "@/lib/cal";
import type { LeadInput } from "@/lib/validation/lead";

const lead: LeadInput = {
  name: "Jean Rivet",
  email: "jean@startup.fr",
  role: "CEO",
  company: "Startup",
  pennylane: "oui",
  stage: "operation",
  segment: "premium",
};

describe("buildCalUrl", () => {
  it("construit une URL cal.com à partir d'un slug", () => {
    const url = new URL(buildCalUrl("exdal/echange-20min", lead));
    expect(url.origin + url.pathname).toBe("https://cal.com/exdal/echange-20min");
    expect(url.searchParams.get("name")).toBe("Jean Rivet");
    expect(url.searchParams.get("email")).toBe("jean@startup.fr");
    expect(url.searchParams.get("metadata[segment]")).toBe("premium");
  });

  it("préremplit des notes lisibles avec rôle, entreprise, Pennylane et stade", () => {
    const url = new URL(buildCalUrl("exdal/echange-20min", lead));
    const notes = url.searchParams.get("notes") ?? "";
    expect(notes).toContain("CEO");
    expect(notes).toContain("Startup");
    expect(notes).toContain("Utilise Pennylane");
    expect(notes).toContain("Levée ou cession");
  });

  it("accepte une URL complète comme base", () => {
    const url = new URL(buildCalUrl("https://cal.exdal.fr/echange", lead));
    expect(url.origin).toBe("https://cal.exdal.fr");
    expect(url.pathname).toBe("/echange");
  });

  it("gère un segment absent sans casser", () => {
    const { segment: _omit, ...noSegment } = lead;
    void _omit;
    const url = new URL(buildCalUrl("exdal/echange", noSegment as LeadInput));
    expect(url.searchParams.get("metadata[segment]")).toBe("");
  });
});
