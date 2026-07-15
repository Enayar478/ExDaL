import type { Article } from "@/lib/articles/types";
// Grappe A, pilotage (PME/startups)
import { connecterPennylaneTableauDeBord } from "@/lib/articles/content/connecter-pennylane-tableau-de-bord";
import { suivreTresoreriePrevisionnellePennylane } from "@/lib/articles/content/suivre-tresorerie-previsionnelle-pennylane";
import { calculerBfrPennylane } from "@/lib/articles/content/calculer-bfr-pennylane";
import { reconcilierPennylaneCrmPaiements } from "@/lib/articles/content/reconcilier-pennylane-crm-paiements";
import { automatiserReportingMensuelPme } from "@/lib/articles/content/automatiser-reporting-mensuel-pme";
// Grappe B, cabinets comptables
import { pennylaneCabinetsAutomatiserSansPerdreControle } from "@/lib/articles/content/pennylane-cabinets-automatiser-sans-perdre-controle";
import { apiPennylaneCabinetComptable } from "@/lib/articles/content/api-pennylane-cabinet-comptable";
import { offreDataCabinetExpertiseComptable } from "@/lib/articles/content/offre-data-cabinet-expertise-comptable";
import { expertComptableAugmente } from "@/lib/articles/content/expert-comptable-augmente";
// Grappe C, levée / cession (premium)
import { preparerChiffresLeveeCession } from "@/lib/articles/content/preparer-chiffres-levee-cession";
import { anatomieDueDiligenceFinanciere } from "@/lib/articles/content/anatomie-due-diligence-financiere";
import { mrrArrCohortesPrevisionnel } from "@/lib/articles/content/mrr-arr-cohortes-previsionnel";
import { construireDataRoomFinanciere } from "@/lib/articles/content/construire-data-room-financiere";
import { currentTradingPreparerCession } from "@/lib/articles/content/current-trading-preparer-cession";

/**
 * Source unique des articles piliers et satellites. Chaque article vit dans son
 * propre fichier sous `content/` et s'ajoute ici. L'ordre n'importe pas : le tri
 * se fait par date de publication (voir `get-article.ts`).
 *
 * Cocon sémantique : les articles se relient via `relatedSlugs` (pilier vers
 * satellites et retour). Les liens vers un article non encore publié sont
 * neutralisés puis s'activent seuls à sa date (scheduler + revalidation ISR).
 */
export const ARTICLES: readonly Article[] = [
  // Grappe A
  connecterPennylaneTableauDeBord,
  suivreTresoreriePrevisionnellePennylane,
  calculerBfrPennylane,
  reconcilierPennylaneCrmPaiements,
  automatiserReportingMensuelPme,
  // Grappe B
  pennylaneCabinetsAutomatiserSansPerdreControle,
  apiPennylaneCabinetComptable,
  offreDataCabinetExpertiseComptable,
  expertComptableAugmente,
  // Grappe C
  preparerChiffresLeveeCession,
  anatomieDueDiligenceFinanciere,
  mrrArrCohortesPrevisionnel,
  construireDataRoomFinanciere,
  currentTradingPreparerCession,
];
