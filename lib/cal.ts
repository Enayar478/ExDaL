import type { LeadInput } from "@/lib/validation/lead";

/**
 * Construction de l'URL de réservation Cal.com avec préremplissage.
 * Utilise CAL_LINK : soit un slug « user/event », soit une URL complète.
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
 * @param link    valeur de CAL_LINK (slug ou URL complète)
 * @param lead    données validées du formulaire de qualification
 * @param leadId  identifiant Supabase du lead — transmis en metadata pour
 *                une corrélation robuste dans le webhook (non basée sur l'email)
 */
export function buildCalUrl(
  link: string,
  lead: LeadInput,
  leadId: string,
): string {
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
  url.searchParams.set("metadata[segment]", lead.segment ?? "");
  // Corrélation lead↔booking côté webhook — résistant aux alias et à la casse.
  url.searchParams.set("metadata[lead_id]", leadId);

  return url.toString();
}
