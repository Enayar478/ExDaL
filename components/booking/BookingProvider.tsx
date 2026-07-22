"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import posthog from "posthog-js";
import type { Segment, Stage } from "@/lib/validation/lead";
import { QualificationModal } from "@/components/booking/QualificationModal";

interface BookingContextValue {
  /** Ouvre le formulaire de qualification. */
  open: () => void;
  /** Segment pré-sélectionné via le sélecteur de parcours (nullable). */
  segment: Segment | null;
  /** Mémorise le segment choisi (porte cliquée). */
  selectSegment: (segment: Segment) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const segmentToStage: Record<Segment, Stage> = {
  pme: "pilotage",
  cabinet: "cabinet",
  premium: "operation",
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [segment, setSegment] = useState<Segment | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    posthog.capture("booking_modal_opened");
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const selectSegment = useCallback((s: Segment) => {
    setSegment(s);
    posthog.capture("segment_selected", { segment: s });
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({ open, segment, selectSegment }),
    [open, segment, selectSegment],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <QualificationModal
        open={isOpen}
        onClose={close}
        defaultStage={segment ? segmentToStage[segment] : undefined}
        segment={segment ?? undefined}
      />
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking doit être utilisé dans un <BookingProvider>.");
  }
  return ctx;
}
