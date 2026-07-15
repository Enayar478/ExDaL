import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Rule } from "@/components/ui/Rule";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/NewsletterForm";
import { site } from "@/lib/site";
import { LUMEN } from "@/lib/newsletters";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const domain = site.url.replace(/^https?:\/\//, "");

  return (
    <footer className="py-16">
      <Container width="wide">
        <Rule className="mb-10" />
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-8">
            <div>
              <Logo size="sm" />
              <p className="mt-4 max-w-[42ch] font-serif text-sm italic text-brume">
                {site.legalName}. De vos données, la clarté.
              </p>
            </div>

            {/* Newsletter Lumen */}
            <div className="max-w-[320px]">
              <Link
                href="/newsletter"
                className="mb-1 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-or-dim transition-colors hover:text-or"
              >
                Lumen, la newsletter
              </Link>
              <p className="mb-3 font-serif text-sm italic text-brume">
                {LUMEN.tagline}
              </p>
              <NewsletterForm source="footer" />
            </div>
          </div>
          <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-gris sm:items-end">
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-blanc"
            >
              {site.email}
            </a>
            <Link
              href="/journal"
              className="transition-colors hover:text-blanc"
            >
              Journal
            </Link>
            <a
              href="/mentions-legales"
              className="transition-colors hover:text-blanc"
            >
              Mentions légales
            </a>
            <span>
              © {year} {domain}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
