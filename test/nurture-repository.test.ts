/**
 * Tests unitaires, lib/nurture/repository.ts.
 *
 * Se concentre sur les chemins critiques RGPD : une désinscription doit
 * bloquer toute réinscription, et une erreur de lecture doit fail-safe vers
 * « désinscrit » (on préfère ne pas envoyer plutôt que risquer de contacter
 * quelqu'un qui a demandé à ne plus recevoir d'email).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

/** Chaînon générique imitant le query builder Supabase (thenable). */
function terminalChain(response: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(response).then(resolve, reject),
  };
  for (const method of ["select", "eq", "in", "order", "limit", "insert", "update", "maybeSingle", "single"]) {
    chain[method] = vi.fn(() => chain);
  }
  return chain;
}

describe("hasUnsubscribed", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("retourne true si une désinscription existe", async () => {
    const chain = terminalChain({ data: [{ id: "enrollment-1" }], error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => chain) }),
    }));

    const { hasUnsubscribed } = await import("@/lib/nurture/repository");
    expect(await hasUnsubscribed("camille@exemple.fr")).toBe(true);
  });

  it("retourne false si aucune désinscription n'existe", async () => {
    const chain = terminalChain({ data: [], error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => chain) }),
    }));

    const { hasUnsubscribed } = await import("@/lib/nurture/repository");
    expect(await hasUnsubscribed("camille@exemple.fr")).toBe(false);
  });

  it("fail-safe : retourne true si la lecture échoue", async () => {
    const chain = terminalChain({ data: null, error: { message: "timeout" } });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => chain) }),
    }));

    const { hasUnsubscribed } = await import("@/lib/nurture/repository");
    expect(await hasUnsubscribed("camille@exemple.fr")).toBe(true);
  });
});

describe("createEnrollment", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("refuse la création si l'email est déjà désinscrit, sans tenter l'insertion", async () => {
    const unsubscribedCheck = terminalChain({ data: [{ id: "enrollment-1" }], error: null });
    const insertMock = vi.fn();
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => unsubscribedCheck),
          insert: insertMock,
        })),
      }),
    }));

    const { createEnrollment } = await import("@/lib/nurture/repository");
    const result = await createEnrollment({
      email: "camille@exemple.fr",
      sequence: "pilotage",
      source: "qualification",
      consentAt: new Date().toISOString(),
      startNow: true,
    });

    expect(result).toEqual({ created: false, reason: "unsubscribed" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("refuse la création si un parcours vivant existe déjà (violation de contrainte unique)", async () => {
    const unsubscribedCheck = terminalChain({ data: [], error: null });
    const insertChain = terminalChain({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => unsubscribedCheck),
          insert: vi.fn(() => insertChain),
        })),
      }),
    }));

    const { createEnrollment } = await import("@/lib/nurture/repository");
    const result = await createEnrollment({
      email: "camille@exemple.fr",
      sequence: "pilotage",
      source: "qualification",
      consentAt: new Date().toISOString(),
      startNow: true,
    });

    expect(result).toEqual({ created: false, reason: "already-enrolled" });
  });

  it("crée l'enrollment et calcule next_send_at quand startNow=true", async () => {
    const unsubscribedCheck = terminalChain({ data: [], error: null });
    const insertChain = terminalChain({ data: { id: "enrollment-1" }, error: null });
    const insertSpy = vi.fn(() => insertChain);
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => unsubscribedCheck),
          insert: insertSpy,
        })),
      }),
    }));

    const { createEnrollment } = await import("@/lib/nurture/repository");
    const result = await createEnrollment({
      email: "CAMILLE@EXEMPLE.FR",
      sequence: "premium",
      source: "score",
      consentAt: new Date().toISOString(),
      startNow: true,
    });

    expect(result).toEqual({ created: true, id: "enrollment-1" });
    const payload = insertSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.email).toBe("camille@exemple.fr");
    expect(payload.status).toBe("active");
    expect(typeof payload.next_send_at).toBe("string");
  });

  it("crée l'enrollment en attente (pending) quand startNow=false, sans next_send_at", async () => {
    const unsubscribedCheck = terminalChain({ data: [], error: null });
    const insertChain = terminalChain({ data: { id: "enrollment-2" }, error: null });
    const insertSpy = vi.fn(() => insertChain);
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => unsubscribedCheck),
          insert: insertSpy,
        })),
      }),
    }));

    const { createEnrollment } = await import("@/lib/nurture/repository");
    await createEnrollment({
      email: "camille@exemple.fr",
      sequence: "cabinet",
      source: "qualification",
      consentAt: new Date().toISOString(),
      startNow: false,
    });

    const payload = insertSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe("pending");
    expect(payload.started_at).toBeNull();
    expect(payload.next_send_at).toBeNull();
  });
});

describe("advanceEnrollment (fin de séquence)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("passe à completed avec next_send_at null après la dernière étape (step 5)", async () => {
    const updateChain = terminalChain({ data: null, error: null });
    const updateSpy = vi.fn(() => updateChain);
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => ({ update: updateSpy })) }),
    }));

    const { advanceEnrollment } = await import("@/lib/nurture/repository");
    await advanceEnrollment({
      enrollmentId: "enrollment-1",
      sequence: "pilotage",
      currentStep: 5,
      startedAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
    });

    const payload = updateSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe("completed");
    expect(payload.next_step).toBe(6);
    expect(payload.next_send_at).toBeNull();
  });

  it("programme l'étape suivante tant que la séquence n'est pas finie", async () => {
    const updateChain = terminalChain({ data: null, error: null });
    const updateSpy = vi.fn(() => updateChain);
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({ from: vi.fn(() => ({ update: updateSpy })) }),
    }));

    const { advanceEnrollment } = await import("@/lib/nurture/repository");
    await advanceEnrollment({
      enrollmentId: "enrollment-2",
      sequence: "premium",
      currentStep: 0,
      startedAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
    });

    const payload = updateSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe("active");
    expect(payload.next_step).toBe(1);
    // Premium : step 1 à J+2 après l'ancre de départ.
    expect(payload.next_send_at).toBe("2026-01-03T10:00:00.000Z");
  });
});
