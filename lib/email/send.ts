import "server-only";
import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/email/html";
import type { EmailContent } from "@/lib/email/templates";

/**
 * Envoi d'email via Resend. Dégrade proprement : si Resend n'est pas configuré,
 * on journalise et on n'échoue pas (l'email est un « nice-to-have », pas un bloquant).
 */
export async function sendEmail(
  to: string,
  content: EmailContent,
): Promise<boolean> {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    logger.warn("Resend non configuré, email non envoyé", {
      to: maskEmail(to),
    });
    return false;
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `ExDaL <${env.RESEND_FROM_EMAIL}>`,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });
    if (error) {
      logger.error("Resend a renvoyé une erreur", { message: error.message });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Envoi d'email échoué", {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
