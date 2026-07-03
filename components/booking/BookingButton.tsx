"use client";

import { useBooking } from "@/components/booking/BookingProvider";

/**
 * Bouton d'action principal « Échanger sur votre situation ».
 * L'or est réservé à la variante primaire — c'est LE point de lumière de l'action.
 */
export function BookingButton({
  label = "Échanger sur votre situation",
  variant = "primary",
  className = "",
}: {
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const { open } = useBooking();

  const styles =
    variant === "primary"
      ? "bg-or text-noir hover:opacity-90"
      : "border border-line text-blanc hover:border-or-dim";

  return (
    <button
      type="button"
      onClick={open}
      className={`inline-block rounded-sm px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] transition-all ${styles} ${className}`}
    >
      {label}
    </button>
  );
}
