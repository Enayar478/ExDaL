import type { LeadInput } from "@/lib/validation/lead";

/**
 * Construction de l'URL de réservation Cal.com avec préremplissage.
 * Utilise NEXT_PUBLIC_CAL_LINK : soit un slug « user/event », soit une URL complète.
 * Le créneau lui-même (durée 20 min) est configuré dans Cal.com.
 */
const stageLabels: Record<LeadInput["stage"], string> = {
  pilotage: "Piloter au quotidien",
  cabinet: "Cabinet comptable",
  operation: "Levée ou cession",
};

const pennylaneLabels: Record<LeadInput["pennylane"], string> = {
  oui: "Utilise Pennylane",
  non: "N'utilise pas Pennylane",
  bientot: "Pennylane bientôt / envisagé",
};

function baseCalUrl(link: string): string {
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  return `https://cal.com/${link.replace(/^\/+/, "")}`;
}

/**
 * Retourne l'URL Cal.com préremplie pour un prospect qualifié.
 * @param link  valeur de NEXT_PUBLIC_CAL_LINK
 * @param lead  données validées du formulaire de qualification
 */
export function buildCalUrl(link: string, lead: LeadInput): string {
  const url = new URL(baseCalUrl(link));

  const notes = [
    `Rôle : ${lead.role}`,
    `Entreprise : ${lead.company}`,
    pennylaneLabels[lead.pennylane],
    `Stade : ${stageLabels[lead.stage]}`,
  ].join(" · ");

  url.searchParams.set("name", lead.name);
  url.searchParams.set("email", lead.email);
  url.searchParams.set("notes", notes);
  // Repère de corrélation retrouvé dans le webhook (recoupé sur l'email).
  url.searchParams.set("metadata[segment]", lead.segment ?? "");

  return url.toString();
}
