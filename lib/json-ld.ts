/**
 * Sérialise un objet en JSON-LD sûr pour une injection dans une balise
 * <script type="application/ld+json"> (via dangerouslySetInnerHTML).
 *
 * `JSON.stringify` n'échappe pas `<`, `>` ni `&` : une valeur contenant
 * `</script>` refermerait la balise et ouvrirait une XSS. On échappe donc ces
 * caractères (plus les séparateurs de ligne U+2028/U+2029) en séquences \uXXXX.
 * Le résultat reste du JSON valide (le navigateur le redécode à l'identique lors
 * du parsing du script), mais ne contient plus aucun chevron littéral capable de
 * fermer la balise.
 *
 * Les données JSON-LD du site sont aujourd'hui maîtrisées (config statique +
 * frontmatter d'article validé Zod) : ce durcissement est une défense en
 * profondeur, robuste le jour où une valeur proviendrait d'une source moins sûre.
 */

// Séparateurs de ligne Unicode, construits par code point : aucun caractère
// invisible dans la source (lisible, non corruptible par un éditeur).
const LINE_SEPARATORS = String.fromCharCode(0x2028) + String.fromCharCode(0x2029);

// Caractères dangereux dans un <script> : `<` `>` `&` ferment/cassent la balise,
// U+2028/U+2029 rompent le parsing. La classe est bâtie dynamiquement pour ne
// jamais coder en dur de caractère invisible.
const DANGEROUS = new RegExp(`[<>&${LINE_SEPARATORS}]`, "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    DANGEROUS,
    (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"),
  );
}
