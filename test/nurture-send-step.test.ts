/**
 * Tests unitaires, lib/nurture/send-step.ts > processDueEnrollment (PR 4).
 *
 * Couvre le traitement d'un enrollment dû : résolution du contenu, respect
 * du verrou de réclamation (claimStep), envoi avec les en-têtes RFC 8058, et
 * avancement (ou abandon) de l'enrollment selon l'issue.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockClaimStep,
  mockMarkStepSent,
  mockMarkStepFailed,
  mockAdvanceEnrollment,
  mockEmailDefinitionFor,
  mockRenderNurtureEmail,
  mockGenerateUnsubscribeToken,
  mockSendEmail,
  mockGetServerEnv,
} = vi.hoisted(() => ({
  mockClaimStep: vi.fn(),
  mockMarkStepSent: vi.fn().mockResolvedValue(undefined),
  mockMarkStepFailed: vi.fn().mockResolvedValue(undefined),
  mockAdvanceEnrollment: vi.fn().mockResolvedValue(undefined),
  mockEmailDefinitionFor: vi.fn(),
  mockRenderNurtureEmail: vi.fn(),
  mockGenerateUnsubscribeToken: vi.fn().mockReturnValue("token.sig"),
  mockSendEmail: vi.fn(),
  mockGetServerEnv: vi.fn(),
}));

vi.mock("@/lib/nurture/repository", () => ({
  claimStep: mockClaimStep,
  markStepSent: mockMarkStepSent,
  markStepFailed: mockMarkStepFailed,
  advanceEnrollment: mockAdvanceEnrollment,
}));
vi.mock("@/lib/nurture/content", () => ({
  emailDefinitionFor: mockEmailDefinitionFor,
}));
vi.mock("@/lib/nurture/render", () => ({
  renderNurtureEmail: mockRenderNurtureEmail,
}));
vi.mock("@/lib/nurture/token", () => ({
  generateUnsubscribeToken: mockGenerateUnsubscribeToken,
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: mockSendEmail }));
vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

const { processDueEnrollment } = await import("@/lib/nurture/send-step");

const ENROLLMENT = {
  id: "enrollment-1",
  email: "camille@exemple.fr",
  sequence: "pilotage" as const,
  nextStep: 2,
  startedAt: "2026-01-01T10:00:00.000Z",
};

const DEF = {
  step: 2,
  key: "pilotage-2",
  subject: "Sujet",
  blocks: [],
};

describe("processDueEnrollment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkStepSent.mockResolvedValue(undefined);
    mockMarkStepFailed.mockResolvedValue(undefined);
    mockAdvanceEnrollment.mockResolvedValue(undefined);
    mockGenerateUnsubscribeToken.mockReturnValue("token.sig");
    mockGetServerEnv.mockReturnValue({ NOTIFICATION_EMAIL: "owner@exdal.fr" });
    mockEmailDefinitionFor.mockReturnValue(DEF);
    mockRenderNurtureEmail.mockReturnValue({
      subject: "Sujet",
      html: "<p>Corps</p>",
      text: "Corps",
    });
  });

  it("définition introuvable : skipped, aucune réclamation tentée", async () => {
    mockEmailDefinitionFor.mockReturnValue(null);

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("skipped");
    expect(mockClaimStep).not.toHaveBeenCalled();
  });

  it("étape déjà en cours ailleurs (in-progress) : skipped, aucun envoi", async () => {
    mockClaimStep.mockResolvedValue({
      claimed: false,
      reason: "in-progress",
    });

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("skipped");
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockAdvanceEnrollment).not.toHaveBeenCalled();
  });

  it("tentatives épuisées (abandoned) : fait avancer l'enrollment sans envoyer", async () => {
    mockClaimStep.mockResolvedValue({ claimed: false, reason: "abandoned" });

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("failed");
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockAdvanceEnrollment).toHaveBeenCalledWith({
      enrollmentId: "enrollment-1",
      sequence: "pilotage",
      currentStep: 2,
      startedAt: "2026-01-01T10:00:00.000Z",
    });
  });

  it("réclamation réussie + envoi réussi : sent, marque et avance", async () => {
    mockClaimStep.mockResolvedValue({ claimed: true });
    mockSendEmail.mockResolvedValue(true);

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("sent");
    expect(mockMarkStepSent).toHaveBeenCalledWith("enrollment-1", 2);
    expect(mockAdvanceEnrollment).toHaveBeenCalledWith({
      enrollmentId: "enrollment-1",
      sequence: "pilotage",
      currentStep: 2,
      startedAt: "2026-01-01T10:00:00.000Z",
    });

    // replyTo + en-têtes RFC 8058 (Gmail/Yahoo one-click).
    const [, , options] = mockSendEmail.mock.calls[0];
    expect(options.replyTo).toBe("owner@exdal.fr");
    expect(options.headers["List-Unsubscribe"]).toMatch(
      /^<https:\/\/.*\/api\/nurture\/unsubscribe\?token=token\.sig>$/,
    );
    expect(options.headers["List-Unsubscribe-Post"]).toBe(
      "List-Unsubscribe=One-Click",
    );

    // Le lien du corps de l'email (humain) pointe vers la page, pas l'API.
    const renderOptions = mockRenderNurtureEmail.mock.calls[0][1];
    expect(renderOptions.unsubscribeUrl).toMatch(
      /^https:\/\/.*\/desinscription\?token=token\.sig$/,
    );
  });

  it("réclamation réussie + envoi échoué : failed, marque sans avancer", async () => {
    mockClaimStep.mockResolvedValue({ claimed: true });
    mockSendEmail.mockResolvedValue(false);

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("failed");
    expect(mockMarkStepFailed).toHaveBeenCalledWith("enrollment-1", 2);
    expect(mockAdvanceEnrollment).not.toHaveBeenCalled();
  });

  it("envoi confirmé mais avancement resté en retard (sent-not-advanced) : répare sans jamais renvoyer", async () => {
    mockClaimStep.mockResolvedValue({
      claimed: false,
      reason: "sent-not-advanced",
    });

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("repaired");
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockAdvanceEnrollment).toHaveBeenCalledWith({
      enrollmentId: "enrollment-1",
      sequence: "pilotage",
      currentStep: 2,
      startedAt: "2026-01-01T10:00:00.000Z",
    });
  });

  it("claim réussi puis silence radio : reprise d'un claim périmé journalisée puis envoi normal", async () => {
    mockClaimStep.mockResolvedValue({ claimed: true, reclaimedStale: true });
    mockSendEmail.mockResolvedValue(true);

    const outcome = await processDueEnrollment(ENROLLMENT);

    expect(outcome).toBe("sent");
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockMarkStepSent).toHaveBeenCalledWith("enrollment-1", 2);
  });
});
