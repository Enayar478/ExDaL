import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Section sémantique avec rythme vertical généreux et colonne centrée. */
export function Section({
  id,
  children,
  labelledBy,
  width = "reading",
  className = "",
  as: Tag = "section",
}: {
  id?: string;
  children: ReactNode;
  labelledBy?: string;
  width?: "reading" | "wide";
  className?: string;
  as?: "section" | "footer" | "header";
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={`py-20 sm:py-28 ${className}`}
    >
      <Container width={width}>{children}</Container>
    </Tag>
  );
}
