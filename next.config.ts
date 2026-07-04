import type { NextConfig } from "next";

// Content-Security-Policy — finding H-3.
//
// 'unsafe-inline' sur script-src est requis par Next.js (hydration inline).
// TODO (P1) : durcir avec nonce généré par middleware une fois PostHog/analytics
// intégrés (les domaines PostHog seront ajoutés à connect-src et script-src à ce stade).
const csp = [
  "default-src 'self'",
  // Next.js exige 'unsafe-inline' pour l'hydration ; durcissement nonce = TODO P1.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  // TODO (P1) : ajouter les origines PostHog/analytics (ex. eu.posthog.com).
  "connect-src 'self' https://*.supabase.co",
  // Embed Cal.com éventuel (cal.eu + sous-domaines).
  "frame-src 'self' https://cal.eu https://*.cal.eu",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
