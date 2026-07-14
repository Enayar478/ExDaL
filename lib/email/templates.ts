/**
 * Gabarits d'email, ton de marque ExDaL : calme, sobre, précis.
 * Styles inline (compatibilité clients mail). Fond sombre, or rare.
 */
import { site } from "@/lib/site";
import { escapeHtml } from "@/lib/email/html";

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

/**
 * Sanitise un champ destiné à être utilisé dans un sujet d'email (en-tête SMTP).
 * Les caractères CR (\r) et LF (\n) doivent être retirés pour prévenir
 * l'injection d'en-têtes SMTP (email header injection).
 * On retire également les tabulations (\t) qui peuvent être interprétées
 * comme des séparateurs de continuation d'en-tête (RFC 5322 folding).
 */
function sanitizeSubjectField(value: string): string {
  return value.replace(/[\r\n\t]/g, " ").trim();
}

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
    ? `<p style="font-family:'Courier New',monospace;font-size:13px;letter-spacing:.06em;color:${OR};margin:20px 0 0;">${escapeHtml(details.when)}</p>`
    : "";

  const html = shell(`
    <h1 style="font-size:26px;font-weight:400;line-height:1.35;margin:0 0 18px;color:${BLANC};">Votre créneau est réservé.</h1>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0 0 14px;">Merci, ${escapeHtml(details.name)}. Nous prendrons vingt minutes pour comprendre votre situation. Sans engagement, sans jargon.</p>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0;">Vous repartirez avec une idée claire de ce que votre donnée peut vous dire, que l'on travaille ensemble ou non.</p>
    ${whenLine}
    <p style="font-size:16px;line-height:1.6;color:${BLANC};margin:28px 0 0;font-style:italic;">Vos chiffres savent déjà tout. À bientôt pour leur donner la parole.</p>
  `);

  const text = `Ex Datis Lumen

Votre créneau est réservé.

Merci, ${details.name}. Nous prendrons vingt minutes pour comprendre votre situation. Sans engagement, sans jargon.
Vous repartirez avec une idée claire de ce que votre donnée peut vous dire, que l'on travaille ensemble ou non.${details.when ? `\n\n${details.when}` : ""}

Vos chiffres savent déjà tout. À bientôt pour leur donner la parole.
${site.legalName} · ${site.url}`;

  return { subject: "Votre échange avec ExDaL est confirmé", html, text };
}

/** Email de confirmation double opt-in pour la newsletter « Lumen ». */
export function newsletterConfirmation(confirmUrl: string): EmailContent {
  // confirmUrl est généré côté serveur (HMAC signé), on échappe quand même
  // en défense pour prévenir toute injection si la logique évolue.
  const safeConfirmUrl = escapeHtml(confirmUrl);

  const html = shell(`
    <h1 style="font-size:24px;font-weight:400;line-height:1.35;margin:0 0 18px;color:${BLANC};">Confirmez votre inscription à Lumen.</h1>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0 0 20px;">Une idée par numéro. Bimensuelle. Ce que vos chiffres vous disent, si vous savez les lire.</p>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0 0 28px;">Cliquez sur le lien ci-dessous pour confirmer. Il expire dans 24 heures.</p>
    <a href="${safeConfirmUrl}" style="display:inline-block;padding:12px 28px;background:${OR};color:#090a0c;font-family:'Courier New',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;">Confirmer mon inscription</a>
    <p style="font-size:13px;line-height:1.6;color:#6f6858;margin:28px 0 0;">Si vous n'avez pas demandé cette inscription, ignorez simplement ce message.</p>
  `);

  const text = `Ex Datis Lumen · Lumen, la newsletter

Confirmez votre inscription.

Une idée par numéro. Bimensuelle. Ce que vos chiffres vous disent, si vous savez les lire.

Confirmez votre inscription (lien valable 24h) :
${confirmUrl}

Si vous n'avez pas demandé cette inscription, ignorez simplement ce message.

${site.url}`;

  return {
    subject: "Confirmez votre inscription à Lumen, ExDaL",
    html,
    text,
  };
}

interface ScorePlanDetails {
  score: number;
  verdictTitle: string;
  verdictBody: string;
  recommendations: ReadonlyArray<{ label: string; text: string }>;
}

/**
 * Plan de préparation personnalisé envoyé après le diagnostic « Score de
 * Préparation à la Cession ». Contenu transactionnel : le dirigeant l'a
 * explicitement demandé en soumettant son email sur la page de résultat.
 */
export function scorePlan(details: ScorePlanDetails): EmailContent {
  const recoBlock =
    details.recommendations.length > 0
      ? `<div style="border-top:1px solid ${LINE};margin-top:28px;padding-top:8px;">
          ${details.recommendations
            .map(
              (reco) => `<div style="margin-top:20px;">
                <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${OR};margin-bottom:6px;">${escapeHtml(reco.label)}</div>
                <div style="font-size:15px;line-height:1.55;color:${BRUME};">${escapeHtml(reco.text)}</div>
              </div>`,
            )
            .join("")}
        </div>`
      : `<p style="font-size:16px;line-height:1.6;color:${BRUME};margin:24px 0 0;">Vos chiffres tiennent déjà l'examen. Il ne reste qu'à choisir le bon moment.</p>`;

  const html = shell(`
    <h1 style="font-size:24px;font-weight:400;line-height:1.35;margin:0 0 6px;color:${BLANC};">Votre plan de préparation</h1>
    <p style="font-family:'Courier New',monospace;font-size:12px;letter-spacing:.1em;color:#6f6858;margin:0 0 22px;">Votre score : <span style="color:${OR};">${details.score} / 100</span></p>
    <h2 style="font-size:20px;font-weight:400;line-height:1.35;margin:0 0 12px;color:${BLANC};">${escapeHtml(details.verdictTitle)}</h2>
    <p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0;">${escapeHtml(details.verdictBody)}</p>
    ${recoBlock}
    <p style="font-size:16px;line-height:1.6;color:${BLANC};margin:32px 0 0;">Quand vous voudrez transformer ce constat en feuille de route, nous prendrons vingt minutes pour en parler.</p>
    <a href="${escapeHtml(site.url)}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:${OR};color:#090a0c;font-family:'Courier New',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;">Échanger sur votre situation</a>
  `);

  const recoText =
    details.recommendations.length > 0
      ? details.recommendations
          .map((reco) => `\n\n${reco.label}\n${reco.text}`)
          .join("")
      : "\n\nVos chiffres tiennent déjà l'examen. Il ne reste qu'à choisir le bon moment.";

  const text = `Ex Datis Lumen, Votre plan de préparation

Votre score : ${details.score} / 100

${details.verdictTitle}
${details.verdictBody}${recoText}

Quand vous voudrez transformer ce constat en feuille de route, nous prendrons vingt minutes pour en parler.
${site.url}`;

  return {
    subject: `Votre plan de préparation, ${details.score}/100`,
    html,
    text,
  };
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
        `<tr><td style="padding:6px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6f6858;width:110px;vertical-align:top;">${k}</td><td style="padding:6px 0;font-size:15px;color:${BLANC};">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");

  const html = shell(`
    <h1 style="font-size:24px;font-weight:400;line-height:1.35;margin:0 0 18px;color:${BLANC};">Nouveau rendez-vous</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table>
  `);

  const text = `Nouveau rendez-vous ExDaL

Nom : ${details.name}
Email : ${details.email}${details.role ? `\nRôle : ${details.role}` : ""}${details.company ? `\nEntreprise : ${details.company}` : ""}${details.when ? `\nCréneau : ${details.when}` : ""}`;

  // Sujet : les champs name et company proviennent du webhook Cal.com (données
  // du prospect). On supprime CR/LF/tab pour prévenir l'injection d'en-tête SMTP.
  const safeName = sanitizeSubjectField(details.name);
  const safeCompany = details.company
    ? sanitizeSubjectField(details.company)
    : undefined;

  return {
    subject: `Nouveau RDV, ${safeName}${safeCompany ? ` (${safeCompany})` : ""}`,
    html,
    text,
  };
}
