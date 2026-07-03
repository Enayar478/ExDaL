"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";
import type { Segment } from "@/lib/validation/lead";

interface Door {
  label: string;
  target: string; // libellé mono à droite
  segment: Segment;
  anchor: string; // id du bloc offre correspondant
}

const doors: Door[] = [
  {
    label: "Je veux enfin piloter clair",
    target: "→ PME / startup",
    segment: "pme",
    anchor: "offre-socle",
  },
  {
    label: "Je sers des clients sous Pennylane",
    target: "→ cabinet",
    segment: "cabinet",
    anchor: "offre-pilotage",
  },
  {
    label: "Je prépare une levée ou une vente",
    target: "→ premium",
    segment: "premium",
    anchor: "offre-operation",
  },
];

/** Enregistre le signal de segmentation sans jamais bloquer l'UX. */
function recordSignal(segment: Segment): void {
  const body = JSON.stringify({ segment });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/segment",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // sendBeacon indisponible — on retombe sur fetch.
  }
  void fetch("/api/segment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function PathSelector() {
  const { selectSegment } = useBooking();

  function handleDoor(door: Door) {
    recordSignal(door.segment);
    selectSegment(door.segment);
    const target = document.getElementById(door.anchor);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <Section id="parcours" labelledBy="parcours-title" className="bg-noir-2">
      <MonoLabel tone="or-dim">Section · Où en êtes-vous</MonoLabel>
      <h2
        id="parcours-title"
        className="mt-6 font-serif text-3xl font-normal leading-tight text-blanc sm:text-4xl"
      >
        Où en êtes-vous ?
      </h2>

      <div className="mt-10 grid gap-2">
        {doors.map((door) => (
          <button
            key={door.segment}
            type="button"
            onClick={() => handleDoor(door)}
            className="group flex items-center justify-between gap-4 border border-line px-5 py-4 text-left transition-colors hover:border-or-dim hover:bg-noir-3"
          >
            <span className="font-serif text-lg text-blanc">{door.label}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-or-dim">
              {door.target}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}
