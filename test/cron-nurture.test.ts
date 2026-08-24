/**
 * Tests d'intégration, GET /api/cron/nurture (PR 4).
 *
 * Sécurité (fail-closed) et orchestration : rattrapage des pending périmés
 * avant les étapes dues, traitement séquentiel, agrégation des compteurs.
 * Le détail du traitement par enrollment (claim/retry/abandon/envoi) est
 * couvert par test/nurture-send-step.test.ts et
 * test/nurture-repository-claim.test.ts : ici on vérifie l'orchestration.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const CRON_SECRET = "cron-secret-de-test-32-caracteres";

const {
  mockGetServerEnv,
  mockActivateStalePending,
  mockFetchDue,
  mockProcessDueEnrollment,
} = vi.hoisted(() => ({
  mockGetServerEnv: vi.fn(),
  mockActivateStalePending: vi.fn(),
  mockFetchDue: vi.fn(),
  mockProcessDueEnrollment: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ getServerEnv: mockGetServerEnv }));
vi.mock("@/lib/nurture/repository", () => ({
  activateStalePending: mockActivateStalePending,
  fetchDue: mockFetchDue,
}));
vi.mock("@/lib/nurture/send-step", () => ({
  processDueEnrollment: mockProcessDueEnrollment,
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

const { GET } = await import("@/app/api/cron/nurture/route");

function request(authorization?: string): NextRequest {
  return new Request("http://localhost/api/cron/nurture", {
    headers: authorization ? { authorization } : {},
  }) as unknown as NextRequest;
}

const DUE_ENROLLMENT = (id: string) => ({
  id,
  email: "camille@exemple.fr",
  sequence: "pilotage" as const,
  nextStep: 0,
  startedAt: "2026-01-01T10:00:00.000Z",
});

describe("GET /api/cron/nurture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue({ CRON_SECRET });
    mockActivateStalePending.mockResolvedValue(0);
    mockFetchDue.mockResolvedValue([]);
    mockProcessDueEnrollment.mockResolvedValue("sent");
  });

  it("503, CRON_SECRET non configuré (fail-closed)", async () => {
    mockGetServerEnv.mockReturnValue({ CRON_SECRET: undefined });

    const res = await GET(request(`Bearer ${CRON_SECRET}`));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
    expect(mockFetchDue).not.toHaveBeenCalled();
  });

  it("401, Authorization absent", async () => {
    const res = await GET(request());

    expect(res.status).toBe(401);
    expect(mockFetchDue).not.toHaveBeenCalled();
  });

  it("401, mauvais Bearer token", async () => {
    const res = await GET(request("Bearer un-mauvais-secret"));

    expect(res.status).toBe(401);
    expect(mockFetchDue).not.toHaveBeenCalled();
  });

  it("200, Bearer correct : active les pending périmés avant de traiter les étapes dues", async () => {
    mockActivateStalePending.mockResolvedValue(2);
    mockFetchDue.mockResolvedValue([DUE_ENROLLMENT("a"), DUE_ENROLLMENT("b")]);
    mockProcessDueEnrollment
      .mockResolvedValueOnce("sent")
      .mockResolvedValueOnce("failed");

    const res = await GET(request(`Bearer ${CRON_SECRET}`));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      activated: 2,
      sent: 1,
      failed: 1,
      skipped: 0,
      repaired: 0,
    });
    expect(mockProcessDueEnrollment).toHaveBeenCalledTimes(2);
  });

  it("traite les enrollments dus SÉQUENTIELLEMENT, pas en parallèle", async () => {
    const order: string[] = [];
    mockFetchDue.mockResolvedValue([DUE_ENROLLMENT("a"), DUE_ENROLLMENT("b")]);
    mockProcessDueEnrollment.mockImplementation(async (enrollment) => {
      order.push(`start-${enrollment.id}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(`end-${enrollment.id}`);
      return "sent";
    });

    await GET(request(`Bearer ${CRON_SECRET}`));

    // Séquentiel : le traitement de "a" se termine avant que "b" ne démarre.
    expect(order).toEqual(["start-a", "end-a", "start-b", "end-b"]);
  });

  it("200, aucun enrollment dû : compteurs à zéro sans erreur", async () => {
    const res = await GET(request(`Bearer ${CRON_SECRET}`));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({
      activated: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      repaired: 0,
    });
  });

  it("200, un enrollment skipped (déjà traité par une passe concurrente)", async () => {
    mockFetchDue.mockResolvedValue([DUE_ENROLLMENT("a")]);
    mockProcessDueEnrollment.mockResolvedValue("skipped");

    const res = await GET(request(`Bearer ${CRON_SECRET}`));
    const json = await res.json();

    expect(json.data.skipped).toBe(1);
    expect(json.data.sent).toBe(0);
  });

  it("200, un enrollment repaired (avancement réparé après envoi confirmé) : compté à part, jamais en sent", async () => {
    mockFetchDue.mockResolvedValue([DUE_ENROLLMENT("a")]);
    mockProcessDueEnrollment.mockResolvedValue("repaired");

    const res = await GET(request(`Bearer ${CRON_SECRET}`));
    const json = await res.json();

    expect(json.data.repaired).toBe(1);
    expect(json.data.sent).toBe(0);
    expect(json.data.skipped).toBe(0);
  });
});
