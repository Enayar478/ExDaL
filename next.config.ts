import type { NextConfig } from "next";

// Content-Security-Policy — finding H-3.
//
// 'unsafe-inline' sur script-src est requis par Next.js (hydration inline).
// TODO (P1) : durcir avec nonce généré par middleware une fois PostHog/analytics
// intégrés (les domaines PostHog seront ajoutés à connect-src et script-src à ce stade).
// En dev, Next/React exigent 'unsafe-eval' (debug) et un websocket pour le HMR.
// En production, la politique reste stricte.
//
// connect-src : '*.supabase.co' autorise tous les projets Supabase.
// La landing n'effectue aucun appel Supabase côté client (tout passe par les routes API
// serveur) — la directive n'est donc là qu'en filet de sécurité.
// TODO (P1) : remplacer par l'origine exacte du projet Supabase une fois l'URL
// disponible en build env (ex. https://xxxxxxxxxxxx.supabase.co).
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  // Next.js exige 'unsafe-inline' pour l'hydration ; durcissement nonce = TODO P1.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  // TODO (P1) : ajouter les origines PostHog/analytics (ex. eu.posthog.com).
  `connect-src 'self' https://*.supabase.co${isDev ? " ws: http://localhost:*" : ""}`,
  // Embed Cal.com éventuel (cal.eu + sous-domaines).
  "frame-src 'self' https://cal.eu https://*.cal.eu",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // form-action restreint les soumissions de formulaires à l'origine propre.
  "form-action 'self'",
  // object-src bloque les plug-ins (Flash, etc.) — non requis par la DA mais
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
  // X-XSS-Protection : actif en mode block pour les navigateurs anciens qui
  // ne supportent pas CSP (belt-and-suspenders). Les navigateurs modernes ignorent
  // cet en-tête en faveur de CSP.
  { key: "X-XSS-Protection", value: "1; mode=block" },
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
  async headers() {
    return [
      // Routes API sensibles : jamais mises en cache.
      { source: "/api/:path*", headers: apiSecurityHeaders },
      // Toutes les autres routes (pages statiques, assets).
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
