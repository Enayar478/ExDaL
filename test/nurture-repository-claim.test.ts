/**
 * Tests unitaires, lib/nurture/repository.ts > claimStep (PR 4, cron d'envoi).
 *
 * Le verrou d'idempotence (contrainte unique enrollment_id+step) doit à la
 * fois empêcher tout doublon d'envoi ET permettre une reprise bornée (retry)
 * d'un échec récupérable, sans jamais bloquer indéfiniment un enrollment.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

/** Chaînon générique imitant le query builder Supabase (thenable). */
function terminalChain(response: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {
    then: (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(response).then(resolve, reject),
  };
  for (const method of [
    "select",
    "eq",
    "in",
    "lt",
    "gte",
    "order",
    "limit",
    "insert",
    "update",
    "maybeSingle",
    "single",
  ]) {
    chain[method] = vi.fn(() => chain);
  }
  return chain;
}

describe("claimStep", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("réclame l'étape avec succès quand aucune ligne n'existe encore", async () => {
    const insertChain = terminalChain({ data: { id: "send-1" }, error: null });
    const fromMock = vi.fn(() => ({ insert: vi.fn(() => insertChain) }));
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 0, "pilotage-0");

    expect(result).toEqual({ claimed: true });
  });

  it("conflit (23505) + ligne en échec récupérable (attempts < 3) : reprend (retry)", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateChain = terminalChain({
      data: [{ id: "send-1" }],
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: true });
    // Le filtre de reprise porte bien sur les tentatives restantes (< 3).
    expect(updateChain.lt).toHaveBeenCalledWith("attempts", 3);
    expect(updateChain.eq).toHaveBeenCalledWith("status", "failed");
  });

  it("conflit + tentatives épuisées (attempts >= 3) : abandon, jamais de blocage infini", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    // resolveStaleClaim : ni périmée, ni éligible à l'abandon périmé (ligne
    // pas assez vieille) -> les 3 UPDATE de reprise ne touchent aucune ligne.
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    const updateStaleExpireChain = terminalChain({ data: [], error: null });
    const selectChain = terminalChain({
      data: { status: "failed", attempts: 3 },
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) })
      .mockReturnValueOnce({ select: vi.fn(() => selectChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "abandoned" });
  });

  it("conflit + ligne déjà envoyée/en cours (pas 'failed') : in-progress, aucun doublon", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    const updateStaleExpireChain = terminalChain({ data: [], error: null });
    const selectChain = terminalChain({
      data: { status: "claimed", attempts: 1 },
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) })
      .mockReturnValueOnce({ select: vi.fn(() => selectChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "in-progress" });
  });

  it("conflit + ligne déjà envoyée mais avancement resté en retard : sent-not-advanced", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    const updateStaleExpireChain = terminalChain({ data: [], error: null });
    const selectChain = terminalChain({
      data: { status: "sent", attempts: 1 },
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) })
      .mockReturnValueOnce({ select: vi.fn(() => selectChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "sent-not-advanced" });
  });

  it("conflit + lecture d'inspection en erreur : fail-safe in-progress (jamais de doublon)", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    const updateStaleExpireChain = terminalChain({ data: [], error: null });
    const selectChain = terminalChain({
      data: null,
      error: { message: "timeout" },
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) })
      .mockReturnValueOnce({ select: vi.fn(() => selectChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "in-progress" });
  });

  it("conflit + claim PÉRIMÉ (attempts < 3) : reprise atomique, jamais de silence radio", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    // attempts=1 -> périmé et repris (attempts+1=2), toutes les conditions
    // (statut, attempts exact, péremption) sont dans le WHERE de cet UPDATE.
    const updateStaleAttempt1Chain = terminalChain({
      data: [{ id: "send-1" }],
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: true, reclaimedStale: true });
    // Aucune lecture préalable : la reprise se joue entièrement dans le
    // WHERE de l'UPDATE (statut + attempts exact + péremption), zéro TOCTOU.
    expect(updateStaleAttempt1Chain.eq).toHaveBeenCalledWith("status", "claimed");
    expect(updateStaleAttempt1Chain.eq).toHaveBeenCalledWith("attempts", 1);
    expect(updateStaleAttempt1Chain.lt).toHaveBeenCalledWith(
      "created_at",
      expect.any(String),
    );
  });

  it("conflit + claim PÉRIMÉ et tentatives épuisées (attempts >= 3) : abandon direct + advance côté appelant", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    // Ni attempts=1 ni attempts=2 périmés ne matchent (déjà >= 3) : le
    // dernier UPDATE (gte attempts >= 3) bascule la ligne en `failed`.
    const updateStaleExpireChain = terminalChain({
      data: [{ id: "send-1" }],
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "abandoned" });
    expect(updateStaleExpireChain.gte).toHaveBeenCalledWith("attempts", 3);
  });

  it("conflit + claim FRAÎCHE (pas périmée) : in-progress inchangé, on ne vole pas le travail concurrent", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const updateFailedRetryChain = terminalChain({ data: [], error: null });
    // Les filtres de péremption (`lt("created_at", ...)`) ne matchent aucune
    // ligne : une claim récente n'est jamais reprise par ce mécanisme.
    const updateStaleAttempt1Chain = terminalChain({ data: [], error: null });
    const updateStaleAttempt2Chain = terminalChain({ data: [], error: null });
    const updateStaleExpireChain = terminalChain({ data: [], error: null });
    const selectChain = terminalChain({
      data: { status: "claimed", attempts: 1 },
      error: null,
    });
    const fromMock = vi
      .fn()
      .mockReturnValueOnce({ insert: vi.fn(() => insertChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateFailedRetryChain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt1Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleAttempt2Chain) })
      .mockReturnValueOnce({ update: vi.fn(() => updateStaleExpireChain) })
      .mockReturnValueOnce({ select: vi.fn(() => selectChain) });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 2, "pilotage-2");

    expect(result).toEqual({ claimed: false, reason: "in-progress" });
  });

  it("erreur d'insertion autre qu'un conflit d'unicité : in-progress, sans lever", async () => {
    const insertChain = terminalChain({
      data: null,
      error: { code: "OTHER", message: "connexion perdue" },
    });
    const fromMock = vi.fn(() => ({ insert: vi.fn(() => insertChain) }));
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: fromMock }),
    }));

    const { claimStep } = await import("@/lib/nurture/repository");
    const result = await claimStep("enrollment-1", 0, "pilotage-0");

    expect(result).toEqual({ claimed: false, reason: "in-progress" });
  });
});
