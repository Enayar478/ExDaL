/**
 * Rend un email de nurturing (blocs déclaratifs → EmailContent) en réutilisant
 * la DA email existante (lib/email/layout.ts). Toute valeur interpolée passe
 * par escapeHtml : les blocs viennent de fichiers de contenu internes, mais
 * le prénom peut provenir d'un lead (donnée externe).
 */
import { shell, BLANC, BRUME, OR } from "@/lib/email/layout";
import { escapeHtml, sanitizeSubjectField } from "@/lib/email/html";
import type { EmailContent } from "@/lib/email/templates";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";

export interface RenderNurtureEmailOptions {
  readonly unsubscribeUrl: string;
  readonly firstName?: string;
}

function blockToHtml(block: NurtureEmailDefinition["blocks"][number]): string {
  switch (block.type) {
    case "paragraph":
      return `<p style="font-size:16px;line-height:1.6;color:${BRUME};margin:0 0 16px;">${escapeHtml(block.text)}</p>`;
    case "cta":
      return `<a href="${escapeHtml(block.url)}" style="display:inline-block;margin:12px 0 20px;padding:12px 28px;background:${OR};color:#090a0c;font-family:'Courier New',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;">${escapeHtml(block.label)}</a>`;
    case "signature":
      return `<p style="font-size:16px;line-height:1.6;color:${BLANC};margin:24px 0 0;font-style:italic;">${escapeHtml(block.text)}</p>`;
  }
}

function blockToText(block: NurtureEmailDefinition["blocks"][number]): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "cta":
      return `${block.label} : ${block.url}`;
    case "signature":
      return block.text;
  }
}

const UNSUBSCRIBE_TEXT = "Ne plus recevoir ces emails";

/** Rend un email de nurturing en HTML + texte, pied de page de désinscription systématique. */
export function renderNurtureEmail(
  def: NurtureEmailDefinition,
  options: RenderNurtureEmailOptions,
): EmailContent {
  const greeting = options.firstName
    ? `<p style="font-size:16px;line-height:1.6;color:${BLANC};margin:0 0 16px;">Bonjour ${escapeHtml(options.firstName)},</p>`
    : "";

  const safeUnsubscribeUrl = escapeHtml(options.unsubscribeUrl);
  const bodyHtml = def.blocks.map(blockToHtml).join("");
  const preheaderHtml = def.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(def.preheader)}</div>`
    : "";

  const html = shell(`
    ${preheaderHtml}
    ${greeting}
    ${bodyHtml}
    <p style="font-size:12px;line-height:1.6;color:#6f6858;margin:32px 0 0;"><a href="${safeUnsubscribeUrl}" style="color:#6f6858;text-decoration:underline;">${UNSUBSCRIBE_TEXT}</a></p>
  `);

  const greetingText = options.firstName ? `Bonjour ${options.firstName},\n\n` : "";
  const bodyText = def.blocks.map(blockToText).join("\n\n");

  const text = `Ex Datis Lumen

${greetingText}${bodyText}

${UNSUBSCRIBE_TEXT} : ${options.unsubscribeUrl}`;

  return {
    subject: sanitizeSubjectField(def.subject),
    html,
    text,
  };
}
