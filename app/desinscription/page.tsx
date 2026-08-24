import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { Rule } from "@/components/ui/Rule";
import { UnsubscribeForm } from "@/components/unsubscribe/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Désinscription",
  robots: { index: false },
};

/**
 * Page de désinscription du nurturing (lien inclus dans chaque email de
 * séquence). Volontairement absente de app/robots.ts `disallow` : lister le
 * chemin dans robots.txt le révèlerait publiquement sans bénéfice (noindex
 * suffit à empêcher l'indexation), et cette page n'est de toute façon pas
 * dans app/sitemap.ts.
 *
 * `searchParams` rend cette page dynamique par nature (lecture par requête,
 * pas de génération statique) : aucune configuration additionnelle
 * (`force-dynamic`) n'est nécessaire.
 */
export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main>
      <Section as="section" className="pt-28 sm:pt-36">
        <MonoLabel tone="or-dim" className="mb-6 block">
          Nurturing par email
        </MonoLabel>
        <h1 className="font-serif text-3xl font-light text-blanc sm:text-4xl">
          Désinscription
        </h1>

        <Rule className="mt-10 mb-10" />

        <div className="space-y-6 text-brume">
          <p className="text-[15px] leading-relaxed">
            Un clic suffit pour arrêter définitivement la série d&apos;emails
            en cours. Aucune relance ne suit.
          </p>
          <UnsubscribeForm token={token ?? null} />
        </div>
      </Section>
    </main>
  );
}
