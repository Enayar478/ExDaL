import { NextResponse, type NextRequest } from "next/server";

/**
 * Protège le panneau éditorial interne /admin par Basic Auth.
 *
 * Fail-closed : sans `ADMIN_PASSWORD` configuré (ou trop court, moins de 16
 * caractères), /admin renvoie 404 (jamais d'accès ouvert par oubli de config ni
 * par mot de passe faible). Sinon, mot de passe requis (l'utilisateur est ignoré).
 * Comparaison à temps constant pour limiter les attaques timing. La longueur
 * minimale est vérifiée ici : le middleware tourne en runtime Edge et ne passe
 * pas par `getServerEnv()` (couplé au schéma Supabase/Resend côté Node).
 * Aucun contenu programmé ne doit fuiter : /admin est aussi `disallow` (robots)
 * et `noindex` (metadata des pages).
 */
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

// Aligné sur la contrainte `ADMIN_PASSWORD` de `lib/env.ts` (openssl rand -hex 24).
const MIN_PASSWORD_LENGTH = 16;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = request.headers.get("authorization");
  if (header) {
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const provided = decoded.slice(decoded.indexOf(":") + 1);
        if (safeEqual(provided, password)) {
          return NextResponse.next();
        }
      } catch {
        // En-tête Authorization malformé (base64 invalide) : traité comme non
        // authentifié (401 propre) plutôt que de laisser remonter une exception.
      }
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="ExDaL panneau editorial"' },
  });
}
