import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BookingButton } from "@/components/booking/BookingButton";

/** En-tête sobre : la signature à gauche, l'action rare à droite. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-noir/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1000px] items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" aria-label="ExDaL — accueil" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="hidden sm:block">
          <BookingButton className="!px-5 !py-2.5 text-[12px]" />
        </div>
      </div>
    </header>
  );
}
