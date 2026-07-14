import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Accès aux données newsletter (pattern repository).
 * Toute la logique métier dépend de cette interface, pas de Supabase directement.
 */

/**
 * Insère ou met à jour un abonné en état « en attente de confirmation ».
 * Si l'email existe déjà (confirmé ou non), on ne réinitialise pas confirmed_at ·
 * on se contente de renvoyer un email de confirmation silencieusement.
 */
export async function upsertSubscriber(params: {
  email: string;
  source?: string;
  ipHash?: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email: params.email,
        source: params.source ?? null,
        ip_hash: params.ipHash ?? null,
      },
      {
        onConflict: "email",
        // On ne met PAS à jour confirmed_at si la ligne existe déjà :
        // un abonné confirmé ne doit pas perdre son statut en se réinscrivant.
        ignoreDuplicates: false,
      },
    )
    .select("id")
    .single();

  // PGRST116 = pas de ligne retournée (upsert silencieux sur conflit si ignoreDuplicates).
  // On tolère ce cas : l'email sera quand même renvoyé.
  if (error && error.code !== "PGRST116") {
    throw new Error(`Upsert abonné newsletter échoué : ${error.message}`);
  }
}

/**
 * Confirme l'inscription d'un abonné (double opt-in) identifié par son email.
 * Idempotent : si déjà confirmé, la mise à jour ne fait rien.
 */
export async function confirmSubscriber(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase())
    .is("confirmed_at", null); // N'écrase pas une confirmation existante.

  if (error) {
    throw new Error(`Confirmation abonné newsletter échouée : ${error.message}`);
  }
}
