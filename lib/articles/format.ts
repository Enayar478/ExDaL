/** Formate une date ISO en date longue française (ex. « 13 juillet 2026 »). */
export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
