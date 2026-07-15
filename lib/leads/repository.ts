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
  const { error } = await supabase.from("path_signals").insert({ segment });

  if (error) {
    throw new Error(`Enregistrement du signal échoué : ${error.message}`);
  }
}

/** Marque un lead comme ayant réservé un créneau (déclenché par le webhook Cal.com).
 *  Fallback par email, utilisé uniquement si lead_id est absent du payload Cal. */
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

/**
 * Corrèle un booking Cal.com à un lead par son id (méthode robuste).
 * Mise à jour conditionnelle : n'agit que si `cal_booking_uid` est encore NULL,
 * ce qui garantit l'idempotence sur les replays Cal.com.
 *
 * @returns true si le booking a été traité pour la première fois, false si déjà traité.
 */
export async function markLeadBookedById(
  id: string,
  calBookingUid: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "booked",
      booked_at: new Date().toISOString(),
      cal_booking_uid: calBookingUid,
    })
    .eq("id", id)
    .is("cal_booking_uid", null)
    .select("id");

  if (error) {
    throw new Error(`Mise à jour du lead échouée : ${error.message}`);
  }

  return Array.isArray(data) && data.length > 0;
}
