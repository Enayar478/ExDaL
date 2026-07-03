import type { ReactNode } from "react";

type Width = "reading" | "wide";

const widths: Record<Width, string> = {
  reading: "max-w-[760px]",
  wide: "max-w-[1000px]",
};

/** Colonne centrée, beaucoup d'espace négatif (esthétique luxe austère). */
export function Container({
  children,
  width = "reading",
  className = "",
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 ${widths[width]} ${className}`}>
      {children}
    </div>
  );
}
