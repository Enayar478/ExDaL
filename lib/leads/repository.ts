import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { LeadInput, Segment } from "@/lib/validation/lead";

/**
 * Accès aux données prospect (pattern repository).
 * Toute la logique métier dépend de cette interface, pas de Supabase directement.
 */
export interface StoredLead {
  id: string;
}

export async function insertLead(lead: LeadInput): Promise<StoredLead> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: lead.name,
      email: lead.email,
      role: lead.role,
      company: lead.company,
      pennylane: lead.pennylane,
      stage: lead.stage,
      segment: lead.segment ?? null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Insertion du lead échouée : ${error.message}`);
  }
  return { id: data.id as string };
}

/** Enregistre un clic sur une porte du sélecteur de parcours (segmentation). */
export async function insertPathSignal(segment: Segment): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("path_signals")
    .insert({ segment });

  if (error) {
    throw new Error(`Enregistrement du signal échoué : ${error.message}`);
  }
}

/** Marque un lead comme ayant réservé un créneau (déclenché par le webhook Cal.com). */
export async function markLeadBooked(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ status: "booked", booked_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase())
    .eq("status", "new");

  if (error) {
    throw new Error(`Mise à jour du lead échouée : ${error.message}`);
  }
}
