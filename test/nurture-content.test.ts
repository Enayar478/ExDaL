/**
 * Tests structurels du contenu des 3 séquences de nurturing.
 * Vérifie le contrat, pas la copy (placeholder en attente de thot-content).
 */
import { describe, it, expect } from "vitest";
import { PILOTAGE_EMAILS } from "@/lib/nurture/content/pilotage";
import { CABINET_EMAILS } from "@/lib/nurture/content/cabinet";
import { PREMIUM_EMAILS } from "@/lib/nurture/content/premium";
import { SEQUENCE_OFFSETS } from "@/lib/nurture/sequences";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";

const SEQUENCES: Record<string, readonly NurtureEmailDefinition[]> = {
  pilotage: PILOTAGE_EMAILS,
  cabinet: CABINET_EMAILS,
  premium: PREMIUM_EMAILS,
};

// Sujets exacts de la copy définitive livrée par thot-content
// (.claude/plans/copy-nurture-emails-*.md), légèrement affinés par rapport au
// brouillon initial du PDF de spec : figés, ne pas reformuler sans consigne.
const EXPECTED_SUBJECTS: Record<string, readonly string[]> = {
  pilotage: [
    "Ce que le résultat ne dit pas encore",
    "Un dirigeant m'a montré son Excel hier",
    "Le piège du reporting que personne ne voit",
    "Comment je construis un tableau de bord qui tient",
    "Vingt minutes, sans engagement",
    "Ce que je n'ai pas encore dit",
  ],
  cabinet: [
    "Un constat, en plus de ce que vous avez demandé",
    "Ce cabinet a arrêté de vendre du temps",
    "Ce que vos clients vous demanderont bientôt",
    "Vous n'avez pas besoin d'embaucher pour ça",
    "Parlons de vos clients, pas juste de Pennylane",
    "À votre rythme",
  ],
  premium: [
    "Ce que le résultat implique vraiment",
    "J'ai préparé ces fichiers, une fois, pour de vrai",
    "Ce qu'un acheteur regarde en premier",
    "Le prix d'une due diligence subie",
    "Vingt minutes, avant que ça ne devienne urgent",
    "Une dernière chose",
  ],
};

describe("contenu des séquences nurture", () => {
  for (const [sequence, emails] of Object.entries(SEQUENCES)) {
    describe(sequence, () => {
      it("contient exactement 6 emails", () => {
        expect(emails).toHaveLength(6);
      });

      it("les steps sont contigus de 0 à 5", () => {
        expect(emails.map((email) => email.step)).toEqual([0, 1, 2, 3, 4, 5]);
      });

      it("les clés suivent le format <séquence>-<step> et sont uniques", () => {
        const keys = emails.map((email) => email.key);
        expect(new Set(keys).size).toBe(keys.length);
        emails.forEach((email) => {
          expect(email.key).toBe(`${sequence}-${email.step}`);
        });
      });

      it("chaque sujet correspond exactement à la spec, sans CR/LF", () => {
        emails.forEach((email, index) => {
          expect(email.subject).toBe(EXPECTED_SUBJECTS[sequence][index]);
          expect(email.subject).not.toMatch(/[\r\n]/);
        });
      });

      it("chaque email a au moins un bloc de contenu", () => {
        emails.forEach((email) => {
          expect(email.blocks.length).toBeGreaterThan(0);
        });
      });

      it("le nombre d'emails correspond au nombre d'offsets de la séquence", () => {
        expect(
          SEQUENCE_OFFSETS[sequence as keyof typeof SEQUENCE_OFFSETS],
        ).toHaveLength(emails.length);
      });
    });
  }
});
