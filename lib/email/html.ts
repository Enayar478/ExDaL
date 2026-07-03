/**
 * Échappement HTML des valeurs externes avant interpolation dans un email.
 * Les champs nom/rôle/entreprise proviennent du prospect via Cal.com : ils ne
 * doivent jamais être interpolés bruts dans du HTML (risque XSS dans la boîte mail).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Masque une adresse email pour les logs (RGPD : minimisation des données).
 * `camille@exemple.fr` → `ca***@exemple.fr`.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}
