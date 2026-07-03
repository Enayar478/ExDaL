import { MonoLabel } from "@/components/ui/MonoLabel";
import { Section } from "@/components/ui/Section";

/** Section 2 · La preuve — Authority Bias. On établit la légitimité avant d'argumenter. */
export function Proof() {
  return (
    <Section labelledBy="proof-title">
      <MonoLabel tone="or-dim">La preuve</MonoLabel>
      <blockquote className="mt-6">
        <p
          id="proof-title"
          className="border-l border-or-dim pl-6 font-serif text-2xl font-normal leading-snug text-blanc sm:text-[1.75rem]"
        >
          «&nbsp;J&rsquo;ai préparé la donnée financière qui a servi à la{" "}
          <em className="italic text-or">cession d&rsquo;une entreprise</em>. Je
          connais les chiffres qu&rsquo;un investisseur exige — parce que je les
          ai produits, sous pression, pour de vrai.&nbsp;»
        </p>
      </blockquote>
    </Section>
  );
}
