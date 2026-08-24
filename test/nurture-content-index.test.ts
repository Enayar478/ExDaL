/**
 * Tests unitaires, lib/nurture/content/index.ts > emailDefinitionFor.
 */
import { describe, it, expect } from "vitest";
import { emailDefinitionFor } from "@/lib/nurture/content";
import { PILOTAGE_EMAILS } from "@/lib/nurture/content/pilotage";
import { CABINET_EMAILS } from "@/lib/nurture/content/cabinet";
import { PREMIUM_EMAILS } from "@/lib/nurture/content/premium";

describe("emailDefinitionFor", () => {
  it("retrouve la bonne définition pour chaque séquence et étape", () => {
    expect(emailDefinitionFor("pilotage", 0)).toBe(PILOTAGE_EMAILS[0]);
    expect(emailDefinitionFor("cabinet", 3)).toBe(CABINET_EMAILS[3]);
    expect(emailDefinitionFor("premium", 5)).toBe(PREMIUM_EMAILS[5]);
  });

  it("retourne null au-delà de la dernière étape", () => {
    expect(emailDefinitionFor("pilotage", 6)).toBeNull();
  });
});
