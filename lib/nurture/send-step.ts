import "server-only";
import { site } from "@/lib/site";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/email/html";
import { sendEmail } from "@/lib/email/send";
import { renderNurtureEmail } from "@/lib/nurture/render";
import { generateUnsubscribeToken } from "@/lib/nurture/token";
import { emailDefinitionFor } from "@/lib/nurture/content";
import {
  claimStep,
  markStepSent,
  markStepFailed,
  advanceEnrollment,
} from "@/lib/nurture/repository";
import type { DueEnrollment } from "@/lib/nurture/types";

/**
 * Traitement d'un enrollment dû, consommé par le cron d'envoi
 * (app/api/cron/nurture/route.ts). Isolé dans son propre module pour garder
 * la route fine (auth + orchestration) et ce traitement testable sans mock
 * de requête HTTP.
 */

export type StepOutcome = "sent" | "failed" | "skipped";

function unsubscribeUrls(enrollmentId: string, email: string) {
  const token = generateUnsubscribeToken(enrollmentId, email);
  return {
    // Lien humain, dans le corps de l'email : mène à la page de confirmation.
    pageUrl: `${site.url}/desinscription?token=${encodeURIComponent(token)}`,
    // Lien machine (RFC 8058) : les clients mail POSTent directement dessus,
    // sans jamais afficher de page. Le token voyage dans l'URL car le corps
    // du POST one-click est fixe ("List-Unsubscribe=One-Click").
    oneClickUrl: `${site.url}/api/nurture/unsubscribe?token=${encodeURIComponent(token)}`,
  };
}

/**
 * Traite l'étape due d'un enrollment : réclame le step (verrou anti-doublon),
 * résout et rend l'email, l'envoie, puis fait avancer (ou abandonne)
 * l'enrollment. Ne lève jamais : chaque échec est journalisé, l'appelant
 * agrège un compteur par issue sans jamais interrompre le lot.
 */
export async function processDueEnrollment(
  enrollment: DueEnrollment,
): Promise<StepOutcome> {
  const def = emailDefinitionFor(enrollment.sequence, enrollment.nextStep);
  if (!def) {
    logger.error("Définition d'email introuvable pour une étape due", {
      sequence: enrollment.sequence,
      step: enrollment.nextStep,
    });
    return "skipped";
  }

  const claim = await claimStep(enrollment.id, enrollment.nextStep, def.key);
  if (!claim.claimed) {
    if (claim.reason === "abandoned") {
      await advanceEnrollment({
        enrollmentId: enrollment.id,
        sequence: enrollment.sequence,
        currentStep: enrollment.nextStep,
        startedAt: enrollment.startedAt,
      });
      logger.error("Étape nurture abandonnée après 3 tentatives", {
        enrollmentId: enrollment.id,
        step: enrollment.nextStep,
        to: maskEmail(enrollment.email),
      });
      return "failed";
    }
    // "in-progress" : un autre passage du cron s'en occupe déjà, ou l'étape
    // est déjà envoyée. Jamais de doublon : on passe simplement au suivant.
    return "skipped";
  }

  const env = getServerEnv();
  const { pageUrl, oneClickUrl } = unsubscribeUrls(
    enrollment.id,
    enrollment.email,
  );
  const content = renderNurtureEmail(def, { unsubscribeUrl: pageUrl });

  const sent = await sendEmail(enrollment.email, content, {
    replyTo: env.NOTIFICATION_EMAIL,
    headers: {
      "List-Unsubscribe": `<${oneClickUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (!sent) {
    await markStepFailed(enrollment.id, enrollment.nextStep);
    logger.warn("Envoi nurture échoué, nouvelle tentative au prochain passage", {
      enrollmentId: enrollment.id,
      step: enrollment.nextStep,
      to: maskEmail(enrollment.email),
    });
    return "failed";
  }

  await markStepSent(enrollment.id, enrollment.nextStep);
  await advanceEnrollment({
    enrollmentId: enrollment.id,
    sequence: enrollment.sequence,
    currentStep: enrollment.nextStep,
    startedAt: enrollment.startedAt,
  });
  return "sent";
}
