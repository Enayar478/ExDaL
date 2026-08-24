/**
 * Gabarit HTML partagé de tous les emails ExDaL (transactionnels + nurturing).
 * Extrait de lib/email/templates.ts pour réutilisation, zéro changement de rendu :
 * les couleurs et le shell() restent strictement identiques à leur version d'origine.
 */
import { site } from "@/lib/site";

// NOIR n'est utilisé que par shell() ci-dessous, pas exporté (pas de consommateur externe).
const NOIR = "#0e1013";
export const BLANC = "#e8e9e6";
export const BRUME = "#a9b0b6";
export const OR = "#d9b26a";
export const LINE = "#22262b";

/** Enveloppe HTML commune à tout email ExDaL (fond sombre, encart or, pied sobre). */
export function shell(inner: string): string {
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#090a0c;padding:32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#090a0c;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:${NOIR};border:1px solid ${LINE};">
        <tr><td style="padding:36px 40px;font-family:Georgia,'Times New Roman',serif;color:${BLANC};">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:${OR};margin-bottom:24px;">Ex Datis Lumen</div>
          ${inner}
          <div style="border-top:1px solid ${LINE};margin-top:32px;padding-top:18px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;color:#6f6858;text-transform:uppercase;">${site.url.replace(/^https?:\/\//, "")}</div>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
