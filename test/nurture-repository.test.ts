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

/** Accès typé aux appels d'un mock stocké sur un chaînon (`chain.eq`, `chain.lt`...). */
function calls(fn: unknown): unknown[][] {
  return (fn as ReturnType<typeof vi.fn>).mock.calls;
}

describe("hasUnsubscribed", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("retourne true si une désinscription existe", async () => {
    const chain = terminalChain({
      data: [{ id: "enrollment-1" }],
      error: null,
    });
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
    const unsubscribedCheck = terminalChain({
      data: [{ id: "enrollment-1" }],
      error: null,
    });
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
    const insertChain = terminalChain({
      data: { id: "enrollment-1" },
      error: null,
    });
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
    const insertChain = terminalChain({
      data: { id: "enrollment-2" },
      error: null,
    });
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

describe("stopByEmail (déclencheur de sortie, PR 3)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("sans onlySource : n'ajoute aucun filtre par source", async () => {
    const chain = terminalChain({ data: null, error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({ update: vi.fn(() => chain) })),
      }),
    }));

    const { stopByEmail } = await import("@/lib/nurture/repository");
    await stopByEmail("camille@exemple.fr", "booked");

    const sourceCalls = calls(chain.eq).filter(([col]) => col === "source");
    expect(sourceCalls.length).toBe(0);
  });

  it("avec onlySource='score' : filtre les enrollments arrêtés par leur source", async () => {
    const chain = terminalChain({ data: null, error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({ update: vi.fn(() => chain) })),
      }),
    }));

    const { stopByEmail } = await import("@/lib/nurture/repository");
    await stopByEmail("camille@exemple.fr", "booked", "score");

    const sourceCalls = calls(chain.eq).filter(
      ([col, val]) => col === "source" && val === "score",
    );
    expect(sourceCalls.length).toBe(1);
  });
});

describe("activateStalePending (rattrapage 48h, PR 3, sans appelant pour l'instant)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("retourne 0 sans erreur quand aucun pending périmé n'existe", async () => {
    const fetchChain = terminalChain({ data: [], error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({ select: vi.fn(() => fetchChain) })),
      }),
    }));

    const { activateStalePending } = await import("@/lib/nurture/repository");
    const count = await activateStalePending(
      new Date("2026-01-10T00:00:00.000Z"),
      50,
    );

    expect(count).toBe(0);
  });

  it("filtre par status=pending, source=qualification, et created_at antérieur à 48h", async () => {
    const fetchChain = terminalChain({ data: [], error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({ select: vi.fn(() => fetchChain) })),
      }),
    }));

    const { activateStalePending } = await import("@/lib/nurture/repository");
    const now = new Date("2026-01-10T00:00:00.000Z");
    await activateStalePending(now, 50);

    expect(calls(fetchChain.eq)).toContainEqual(["status", "pending"]);
    expect(calls(fetchChain.eq)).toContainEqual(["source", "qualification"]);
    expect(calls(fetchChain.lt)[0][0]).toBe("created_at");
    const threshold = new Date(calls(fetchChain.lt)[0][1] as string);
    expect(now.getTime() - threshold.getTime()).toBe(48 * 60 * 60 * 1000);
  });

  it("active un enrollment périmé trouvé (started_at = now, next_send_at recalculé)", async () => {
    const staleRow = { id: "enrollment-1", sequence: "pilotage" };
    const fetchChain = terminalChain({ data: [staleRow], error: null });
    const updateChain = terminalChain({
      data: [{ id: "enrollment-1" }],
      error: null,
    });
    const updateSpy = vi.fn(() => updateChain);
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => fetchChain),
          update: updateSpy,
        })),
      }),
    }));

    const { activateStalePending } = await import("@/lib/nurture/repository");
    const now = new Date("2026-01-10T00:00:00.000Z");
    const count = await activateStalePending(now, 50);

    expect(count).toBe(1);
    const payload = updateSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe("active");
    expect(payload.started_at).toBe(now.toISOString());
    // Pilotage : étape 0 à J+0 (ancre de départ = now).
    expect(payload.next_send_at).toBe(now.toISOString());
  });

  it("ne comptabilise pas une ligne déjà activée entre-temps (course avec un autre process)", async () => {
    const staleRow = { id: "enrollment-1", sequence: "pilotage" };
    const fetchChain = terminalChain({ data: [staleRow], error: null });
    // update retourne data:[] : la ligne n'était déjà plus 'pending'.
    const updateChain = terminalChain({ data: [], error: null });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({
          select: vi.fn(() => fetchChain),
          update: vi.fn(() => updateChain),
        })),
      }),
    }));

    const { activateStalePending } = await import("@/lib/nurture/repository");
    const count = await activateStalePending(
      new Date("2026-01-10T00:00:00.000Z"),
      50,
    );

    expect(count).toBe(0);
  });

  it("fail-safe : une erreur de lecture renvoie 0 sans lever d'exception", async () => {
    const fetchChain = terminalChain({
      data: null,
      error: { message: "timeout" },
    });
    vi.doMock("@/lib/supabase/server", () => ({
      getSupabaseAdmin: () => ({
        from: vi.fn(() => ({ select: vi.fn(() => fetchChain) })),
      }),
    }));

    const { activateStalePending } = await import("@/lib/nurture/repository");
    const count = await activateStalePending(new Date(), 50);

    expect(count).toBe(0);
  });
});
