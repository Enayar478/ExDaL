"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Segment, Stage } from "@/lib/validation/lead";
import { QualificationModal } from "@/components/booking/QualificationModal";
import { capture } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

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
  // Miroir synchrone du segment : `selectSegment` puis `open` dans le même
  // handler (cas ArticleCta) doit capturer le segment du clic courant, pas
  // celui de la closure du rendu précédent (setState est asynchrone).
  const segmentRef = useRef<Segment | null>(null);

  // Tous les points d'entrée du tunnel passent ici : la mesure est centralisée.
  const open = useCallback(() => {
    setIsOpen(true);
    capture(ANALYTICS_EVENTS.qualificationOuverte, {
      segment: segmentRef.current ?? "aucun",
    });
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const selectSegment = useCallback((s: Segment) => {
    segmentRef.current = s;
    setSegment(s);
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
