"use client";

import Link from "next/link";

/**
 * Case à cocher de consentement marketing (RGPD), NON précochée par défaut.
 * Partagée entre la modale de qualification et le formulaire du Score : même
 * libellé, même style sobre. L'or est interdit ici, ce n'est pas un accent de
 * conversion mais une mention légale discrète.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  name = "marketingConsent",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  name?: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-2.5 font-mono text-[11px] text-gris">
      <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-line bg-noir">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {checked && (
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="h-2.5 w-2.5 text-brume"
          >
            <path
              d="M2 6.2 L4.8 9 L10 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span>
        Recevoir quelques conseils par email adaptés à ma situation (3 à 6
        emails, désinscription à tout moment).{" "}
        <Link
          href="/confidentialite"
          className="underline decoration-line underline-offset-2 transition-colors hover:text-brume"
        >
          Politique de confidentialité
        </Link>
      </span>
    </label>
  );
}
