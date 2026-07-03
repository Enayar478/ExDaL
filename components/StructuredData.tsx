import { site } from "@/lib/site";

/** Données structurées JSON-LD (schema.org) pour le référencement. */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    email: site.email,
    areaServed: { "@type": "Country", name: "France" },
    knowsAbout: [
      "Pennylane",
      "Analytics engineering",
      "Data financière",
      "Reporting financier",
      "Due diligence",
      "Levée de fonds",
      "Cession d'entreprise",
    ],
    serviceType: "Data financière & analytics engineering",
  };

  return (
    <script
      type="application/ld+json"
      // Contenu contrôlé et statique : pas d'injection utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
