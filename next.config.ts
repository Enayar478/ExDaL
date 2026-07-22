import type { NextConfig } from "next";

// Content-Security-Policy, finding H-3.
//
// 'unsafe-inline' sur script-src est requis par Next.js (hydration inline).
// TODO (P1) : durcir avec nonce généré par middleware une fois PostHog/analytics
// intégrés (les domaines PostHog seront ajoutés à connect-src et script-src à ce stade).
// En dev, Next/React exigent 'unsafe-eval' (debug) et un websocket pour le HMR.
// En production, la politique reste stricte.
//
// connect-src : la landing n'effectue AUCUN appel Supabase côté client (tout
// passe par les routes API serveur ; lib/supabase/server.ts est server-only).
// On ne liste donc que 'self' et les origines PostHog, sans Supabase : si un
// appel client apparaissait un jour, la CSP le bloquerait (fail-safe visible en
// dev), signal qu'il doit rester côté serveur.
const isDev = process.env.NODE_ENV !== "production";

// PostHog Cloud EU : eu.i.posthog.com ingère les événements (connect-src) et
// eu-assets.i.posthog.com sert le bundle et la config distante (script-src).
const posthogIngest = "https://eu.i.posthog.com";
const posthogAssets = "https://eu-assets.i.posthog.com";

const csp = [
  "default-src 'self'",
  // Next.js exige 'unsafe-inline' pour l'hydration ; durcissement nonce = TODO P1.
  `script-src 'self' 'unsafe-inline' ${posthogAssets}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${posthogIngest} ${posthogAssets}${isDev ? " ws: http://localhost:*" : ""}`,
  // Embed Cal.com éventuel (cal.eu + sous-domaines).
  "frame-src 'self' https://cal.eu https://*.cal.eu",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // form-action restreint les soumissions de formulaires à l'origine propre.
  "form-action 'self'",
  // object-src bloque les plug-ins (Flash, etc.), non requis par la DA mais
  // recommandé par les guidelines OWASP CSP.
  "object-src 'none'",
].join("; ");

// En-têtes de sécurité appliqués à toutes les réponses.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
  // X-XSS-Protection : forcé à "0" (recommandation OWASP/MDN). Le filtre XSS
  // legacy des anciens navigateurs est lui-même une source de failles (fuites
  // d'information via son blocage) ; on le désactive et on s'appuie sur la CSP.
  // Les navigateurs modernes ignorent de toute façon cet en-tête.
  { key: "X-XSS-Protection", value: "0" },
  // Cache-Control : les pages publiques statiques peuvent être cachées. Les routes
  // API sensibles surchargent cet en-tête (no-store) via `apiSecurityHeaders` (ci-dessous).
];

// En-têtes supplémentaires pour les routes API sensibles (no-store + no-cache).
const apiSecurityHeaders = [
  ...securityHeaders,
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate",
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Surrogate-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Le Journal a migré de /articles vers /journal (refonte accueil manifeste).
  // Redirections permanentes (308) pour préserver le SEO déjà en ligne : anciennes
  // URLs indexées et liens entrants suivent vers la nouvelle arborescence.
  async redirects() {
    return [
      { source: "/articles", destination: "/journal", permanent: true },
      {
        source: "/articles/:slug",
        destination: "/journal/:slug",
        permanent: true,
      },
    ];
  },
  // Les articles sont lus depuis `content/articles/*.md` via `fs` au runtime.
  // Ce chemin étant calculé, Vercel ne le trace pas automatiquement : on force
  // l'inclusion des .md dans les fonctions serverless qui en dépendent (sinon la
  // revalidation ISR en prod verrait un registre vide).
  outputFileTracingIncludes: {
    "/journal": ["./content/articles/**/*.md"],
    "/journal/[slug]": ["./content/articles/**/*.md"],
    "/sitemap.xml": ["./content/articles/**/*.md"],
    "/admin": ["./content/articles/**/*.md"],
    "/admin/articles/[slug]": ["./content/articles/**/*.md"],
  },
  async headers() {
    return [
      // Routes API sensibles : jamais mises en cache.
      { source: "/api/:path*", headers: apiSecurityHeaders },
      // Panneau editorial : contenu programmé/brouillon, jamais mis en cache
      // (defense en profondeur au-delà de `dynamic = "force-dynamic"`).
      { source: "/admin/:path*", headers: apiSecurityHeaders },
      { source: "/admin", headers: apiSecurityHeaders },
      // Toutes les autres routes (pages statiques, assets).
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
