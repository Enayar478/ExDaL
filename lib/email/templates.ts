/**
 * Gabarits d'email — ton de marque ExDaL : calme, sobre, précis.
 * Styles inline (compatibilité clients mail). Fond sombre, or rare.
 */
import { site } from "@/lib/site";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

interface BookingDetails {
  name: string;
  email: string;
  role?: string;
  company?: string;
  when?: string; // date/heure lisible
}

const NOIR = "#0e1013";
const BLANC = "#e8e9e6";
const BRUME = "#a9b0b6";
const OR = "#d9b26a";
const LINE = "#22262b";

function shell(inner: string): string {
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

/** Confirmation sobre envoyée au prospect après réservation. */
export function prospectConfirmation(details: BookingDetails): EmailContent {
  const whenLine = details.when
    ? `<p style="font-family:'Courier New',monospace;font-size:13px;letter-spacing:.06em;color:${OR};margin:20px 0 0;">${details.when}</p>`
    : "";

  const html = shell(`
    <h1 style="font-size:26px;font-weight:400;line-height:1.35;margin:0 0 18px;color:${BLANC};">Votre créneau est réservé.</h1>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0 0 14px;">Merci, ${details.name}. Nous prendrons vingt minutes pour comprendre votre situation. Sans engagement, sans jargon.</p>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0;">Vous repartirez avec une idée claire de ce que votre donnée peut vous dire — que l'on travaille ensemble ou non.</p>
    ${whenLine}
    <p style="font-size:16px;line-height:1.6;color:${BLANC};margin:28px 0 0;font-style:italic;">Vos chiffres savent déjà tout. À bientôt pour leur donner la parole.</p>
  `);

  const text = `Ex Datis Lumen

Votre créneau est réservé.

Merci, ${details.name}. Nous prendrons vingt minutes pour comprendre votre situation. Sans engagement, sans jargon.
Vous repartirez avec une idée claire de ce que votre donnée peut vous dire — que l'on travaille ensemble ou non.${details.when ? `\n\n${details.when}` : ""}

Vos chiffres savent déjà tout. À bientôt pour leur donner la parole.
— ${site.legalName} · ${site.url}`;

  return { subject: "Votre échange avec ExDaL est confirmé", html, text };
}

/** Notification interne au propriétaire à chaque nouvelle réservation. */
export function ownerNotification(details: BookingDetails): EmailContent {
  const rows = [
    ["Nom", details.name],
    ["Email", details.email],
    ["Rôle", details.role],
    ["Entreprise", details.company],
    ["Créneau", details.when],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6f6858;width:110px;vertical-align:top;">${k}</td><td style="padding:6px 0;font-size:15px;color:${BLANC};">${v}</td></tr>`,
    )
    .join("");

  const html = shell(`
    <h1 style="font-size:24px;font-weight:400;line-height:1.35;margin:0 0 18px;color:${BLANC};">Nouveau rendez-vous</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table>
  `);

  const text = `Nouveau rendez-vous ExDaL

Nom : ${details.name}
Email : ${details.email}${details.role ? `\nRôle : ${details.role}` : ""}${details.company ? `\nEntreprise : ${details.company}` : ""}${details.when ? `\nCréneau : ${details.when}` : ""}`;

  return {
    subject: `Nouveau RDV — ${details.name}${details.company ? ` (${details.company})` : ""}`,
    html,
    text,
  };
}
