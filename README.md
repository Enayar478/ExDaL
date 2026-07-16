# ExDaL — Ex Datis Lumen

Landing page de vente du studio **ExDaL**, spécialiste de la data financière sous
Pennylane. Objectif : présenter l'offre selon le tunnel de vente défini, qualifier
les prospects en 3 questions, et déclencher une prise de rendez-vous de 20 minutes.

> _De la donnée, la lumière._

---

## Sommaire

- [Stack](#stack)
- [Architecture](#architecture)
- [Mise en route locale](#mise-en-route-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Supabase (base de données)](#supabase-base-de-données)
- [Cal.com (réservation)](#calcom-réservation)
- [Resend (emails)](#resend-emails)
- [Déploiement Vercel](#déploiement-vercel)
- [DNS — exdal.fr chez Hostinger](#dns--exdalfr-chez-hostinger)
- [Sécurité](#sécurité)
- [Actions manuelles restantes](#actions-manuelles-restantes-détenteur-de-comptes)
- [Tests & qualité](#tests--qualité)

---

## Stack

| Rôle           | Choix                       | Pourquoi                                  |
| -------------- | --------------------------- | ----------------------------------------- |
| Framework      | **Next.js 16** (App Router) | rendu statique de la page → SEO & vitesse |
| Langage        | **TypeScript**              | strict, sûr                               |
| Styles         | **Tailwind CSS v4**         | tokens DA centralisés, zéro CSS mort      |
| Typographies   | Newsreader + IBM Plex Mono  | self-hostées via `next/font` (0 requête externe) |
| Base de données| **Supabase** (Postgres)     | vos leads restent votre donnée            |
| Réservation    | **Cal.com**                 | créneau 20 min, préremplissage            |
| Emails         | **Resend**                  | confirmation prospect + notification interne |
| Hébergement    | **Vercel**                  | edge, CI/CD Git, domaine                  |

La page d'accueil est **statique** (pré-rendue) ; seules les routes `/api/*` sont
dynamiques. Aucun secret n'est exposé au navigateur (voir `lib/env.ts`).

## Architecture

```
app/
  layout.tsx            metadata SEO, fonts, <html lang="fr">
  page.tsx              assemble les 8 sections dans le BookingProvider
  globals.css           tokens DA (couleurs, or rare, typo) via @theme
  robots.ts / sitemap.ts
  api/
    lead/route.ts       POST — valide + enregistre le lead, renvoie l'URL Cal.com
    segment/route.ts    POST — enregistre le signal du sélecteur de parcours
    cal-webhook/route.ts POST — BOOKING_CREATED → marque « booked » + emails
components/
  sections/             Hero, Proof, Problem, PathSelector, Offers, Method, Why, Closing
  booking/              BookingProvider, QualificationModal, BookingButton, ChoiceGroup
  ui/                   Logo, MonoLabel, Rule, Container, Section
lib/
  validation/lead.ts    schémas Zod (frontière du système)
  env.ts                validation fail-fast des variables serveur
  supabase/server.ts    client service_role (serveur uniquement)
  leads/repository.ts   accès données (pattern repository)
  cal.ts                construction de l'URL Cal.com préremplie
  cal-webhook.ts        vérif. signature HMAC + parsing du webhook
  email/                templates (ton de marque) + envoi Resend
  rate-limit.ts         limitation best-effort par IP
supabase/migrations/    0001_init.sql — schéma appliqué
test/                   suites Vitest (validation, cal, webhook)
```

### Parcours utilisateur

1. Le visiteur clique **« Échanger sur votre situation »** (hero, header ou closing).
2. Le **formulaire de qualification** en 3 questions s'ouvre (identité, usage
   Pennylane, stade).
3. À la validation : `POST /api/lead` → le lead est écrit dans Supabase, une URL
   **Cal.com** préremplie est renvoyée, le navigateur y est redirigé.
4. Le prospect choisit un créneau **20 min**. Cal.com appelle
   `POST /api/cal-webhook` → le lead passe en `booked`, un **email de confirmation**
   sobre part vers le prospect et une **notification** vers vous (Resend).

Le **sélecteur de parcours** (section 4) : chaque porte fait défiler vers le bloc
d'offre correspondant **et** enregistre le choix (`POST /api/segment`) comme signal
de segmentation, tout en pré-remplissant le stade du formulaire.

## Mise en route locale

```bash
pnpm install
cp .env.example .env.local     # puis renseignez les valeurs
pnpm dev                       # http://localhost:3000
```

Autres commandes :

```bash
pnpm build        # build de production
pnpm start        # sert le build
pnpm test         # tests unitaires (Vitest)
pnpm lint         # ESLint
```

## Variables d'environnement

Toutes documentées dans **`.env.example`**, avec l'endroit exact où récupérer
chaque valeur. Résumé :

| Variable                     | Public | Rôle                                       |
| ---------------------------- | :----: | ------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`       |   ✅   | URL canonique (SEO, sitemap)               |
| `CAL_LINK`       |   ✅   | lien Cal.com (slug ou URL)                 |
| `SUPABASE_URL`               |   —    | projet Supabase                            |
| `SUPABASE_SERVICE_ROLE_KEY`  |   —    | clé service_role (SECRET)                  |
| `RESEND_API_KEY`             |   —    | envoi d'emails                             |
| `RESEND_FROM_EMAIL`          |   —    | adresse d'expédition (domaine vérifié)     |
| `NOTIFICATION_EMAIL`         |   —    | destinataire de la notif interne           |
| `CAL_WEBHOOK_SECRET`         |   —    | signature du webhook (recommandé en prod)  |

Le site **build et s'affiche sans ces variables** ; elles ne sont requises que pour
les fonctionnalités serveur (enregistrement des leads, redirection Cal.com, emails).

## Supabase (base de données)

1. Créez un projet sur [app.supabase.com](https://app.supabase.com).
2. Ouvrez **SQL Editor** et exécutez le contenu de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Cela crée les tables `leads` et `path_signals`, avec **RLS activé et aucune
   policy publique** : seules les routes serveur (clé service_role) y accèdent.
3. Récupérez `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).

Alternative CLI : `supabase link` puis `supabase db push`.

## Cal.com (réservation)

1. Créez un compte sur [cal.com](https://cal.com) et un **Event Type** de **20 min**
   (ex. « Échanger sur votre situation »).
2. Copiez son lien → `CAL_LINK` (slug `exdal/echange-20min` ou URL).
3. **Webhook** : Settings → Developer → Webhooks → New.
   - URL : `https://exdal.fr/api/cal-webhook`
   - Événement : `BOOKING_CREATED`
   - Secret : générez-en un et mettez-le dans `CAL_WEBHOOK_SECRET`.

## Resend (emails)

1. Créez un compte sur [resend.com](https://resend.com).
2. **Domains** → ajoutez `exdal.fr` et créez les enregistrements DNS fournis
   (SPF `TXT`, DKIM `CNAME/TXT`, éventuellement `MX` de retour) chez Hostinger.
3. **API Keys** → créez une clé (`Sending access`) → `RESEND_API_KEY`.
4. Renseignez `RESEND_FROM_EMAIL` (adresse du domaine vérifié) et
   `NOTIFICATION_EMAIL` (votre adresse).

> Les emails dégradent proprement : sans clé Resend valide, le rendez-vous se prend
> quand même — seuls les emails ExDaL ne partent pas (Cal.com envoie déjà les siens).

## Déploiement Vercel

Via l'interface (recommandé) :

1. [vercel.com/new](https://vercel.com/new) → importez le dépôt GitHub.
2. Framework détecté : **Next.js**. Aucun réglage build à changer.
3. **Settings → Environment Variables** : ajoutez toutes les variables ci-dessus
   (Production + Preview).
4. **Deploy**.

Via CLI (depuis la racine du projet) :

```bash
vercel link          # associe le projet
vercel env add ...   # ou saisie via le dashboard
vercel --prod        # déploie en production
```

## DNS — exdal.fr chez Hostinger

Le domaine est chez **Hostinger**. Pour le pointer vers Vercel, créez ces
enregistrements dans **hPanel → Domaines → exdal.fr → DNS / Zone DNS**.
La **source de vérité** reste le panneau **Vercel → Project → Settings → Domains**
(ajoutez-y `exdal.fr` et `www.exdal.fr`) : suivez les valeurs qu'il affiche si elles
diffèrent.

| Type    | Nom (Host) | Valeur                   | TTL   |
| ------- | ---------- | ------------------------ | ----- |
| `A`     | `@`        | `76.76.21.21`            | 3600  |
| `CNAME` | `www`      | `cname.vercel-dns.com.`  | 3600  |

Étapes :

1. Dans Vercel, ajoutez le domaine `exdal.fr` (et `www.exdal.fr` en redirection).
2. Chez Hostinger, **supprimez** les éventuels `A`/`CNAME` existants pour `@` et
   `www` qui pointent ailleurs (parking Hostinger), puis créez ceux du tableau.
3. Attendez la propagation (quelques minutes à quelques heures). Vercel émet le
   certificat HTTPS automatiquement.
4. Ajoutez **en plus** les enregistrements DNS de **Resend** (vérification du
   domaine d'envoi) — ils cohabitent sans conflit avec les enregistrements Vercel.

> Astuce : si vous préférez déléguer entièrement la zone, vous pouvez remplacer les
> serveurs de noms Hostinger par ceux de Vercel — mais la méthode `A` + `CNAME`
> ci-dessus est la plus simple et n'affecte pas vos emails.

## Sécurité

Référence de la posture de sécurité du site, de l'API et de la donnée. Dernière
revue complète : audit final multi-agents (secrets/injection, DoS/abus, base de
données) avant la version finale. Verdict : aucune faille CRITICAL ou HIGH
exploitable ; le reste a été corrigé ou consciemment reporté (voir plus bas).

### Surface d'attaque

5 routes API publiques. Seul vecteur d'amplification email : `/api/newsletter`
(email de confirmation vers une adresse fournie par le client). Le webhook
n'est pas forgeable sans le secret HMAC, et `/api/lead` n'envoie aucun email.

### En-têtes HTTP et CSP (`next.config.ts`)

- CSP : `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-src` limité à cal.eu.
  `unsafe-eval` en dev uniquement (HMR). Nonce prévu à l'arrivée d'analytics.
- HSTS preload (2 ans) · `X-Frame-Options: DENY` · `nosniff` ·
  `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy`
  (camera/micro/géoloc coupés) · `Cache-Control: no-store` sur `/api/*`.

### Validation des entrées

- Zod à toutes les frontières : corps des routes (`lib/validation/*`), env
  (`lib/env.ts`, fail-fast au démarrage), payload webhook. Emails normalisés.
- Limites de taille de corps, double vérification (`content-length` puis
  longueur réelle) : lead 8 Ko, segment 1 Ko, newsletter 2 Ko, webhook 64 Ko.

### Anti-bot et anti-abus (sans service tiers)

1. **Honeypot** : champ `website` contraint à vide par Zod ; réponse neutre
   sur la newsletter pour ne pas révéler la détection.
2. **Rate-limit durable par IP** : compteur PARTAGÉ entre les instances
   serverless, stocké dans Postgres (`public.rate_limits` + fonction atomique
   `check_rate_limit`, migration 0007, `SECURITY DEFINER`, `search_path=''`,
   EXECUTE réservé à service_role). Un rate-limit en mémoire serait inefficace
   sur Vercel (compteur par instance, remis à zéro au cold start). Repli
   mémoire best-effort si Supabase est indisponible (fail-open contrôlé).
   Limites : lead 5/min · segment 20/min · newsletter 3/10 min ·
   confirm 10/min · webhook 30/min.
3. **Plafond global newsletter** : 60 inscriptions/heure toutes IP confondues
   (clé `newsletter:global`) contre l'abus distribué (pool d'IP rotatives).
4. **Extraction d'IP fiable** : `x-real-ip` (injecté par Vercel, non
   falsifiable), sinon dernier maillon de `x-forwarded-for`.
5. `robots.txt` exclut `/api/` du crawl : politesse pour les crawlers, pas une
   protection (les bots malveillants l'ignorent).

### Webhook Cal.com

HMAC-SHA256 vérifié AVANT tout parsing, comparaison à temps constant
(`timingSafeEqual`), fail-closed (503 si secret absent), idempotence à deux
niveaux contre les rejeux (update conditionnel + index unique partiel, 0002).

### Newsletter (double opt-in)

Token HMAC-SHA256 (`NEWSLETTER_SECRET`, min. 16), expiration 24 h, comparaison
à temps constant, pas d'énumération (réponse toujours `queued`), redirection
validée par liste blanche (pas d'open redirect), IP stockée uniquement hachée.

### Base de données (Supabase)

- RLS activée sur toutes les tables, zéro policy : deny-all pour anon et
  authenticated. Seul chemin : `service_role`, côté serveur exclusivement
  (`lib/supabase/server.ts`, `import "server-only"`).
- REVOKE ALL sur les tables, REVOKE USAGE/CREATE sur le schéma public, et
  ALTER DEFAULT PRIVILEGES (0005) : toute table future naît fermée.
- Requêtes exclusivement paramétrées via supabase-js. Aucune SQL concaténée.
- Purge RGPD : `purge_expired_data()` (leads « new » > 12 mois, « booked »
  > 3 ans, non confirmés > 30 j). Planification pg_cron : voir plus bas.
- Unicité `lower(email)` sur `leads`, colonnes PII documentées.

### Secrets et emails

- Aucun secret en dur ; tout via `lib/env.ts` (Zod fail-fast). `.env*` non
  suivis par git. Aucun secret côté client (seul `NEXT_PUBLIC_SITE_URL` est
  public ; `CAL_LINK` est server-only). Bundle JS de prod scanné : propre.
- Emails : champs échappés (`escapeHtml`) avant interpolation HTML, sujet
  assaini (CR/LF) contre l'injection d'en-tête SMTP.

### Historique des durcissements

| PR | Contenu |
| -- | ------- |
| #15 | Audit OWASP : `CAL_LINK` server-only, limites de corps, HMAC avant parsing, anti-injection SMTP, CSP durcie, validation redirect |
| #12 + #16 | Durcissement DB : REVOKE, unicité email, purge RGPD |
| #17 | Override postcss (CVE Dependabot) |
| #21 | Post-audit : ALTER DEFAULT PRIVILEGES, `search_path=''`, rate-limit /confirm |
| #22 puis #30 | Rate-limit durable : Upstash, puis remplacé par Supabase (0007) pour éviter un compte tiers |
| #31 | Plafond global newsletter + cette documentation |

### Décisions et points en veille

- **Cloudflare Turnstile (anti-bot invisible) : volontairement différé**
  (décision CEO : pas de compte tiers supplémentaire). À brancher le jour
  d'une campagne payante SEA/SMA, ou si un abus réel apparaît. Signal :
  hausse des bounces/complaints Resend, volume anormal de non-confirmés.
- **pg_cron** à activer pour planifier la purge RGPD :
  `SELECT cron.schedule('purge-expired-data', '0 3 * * *', $$SELECT public.purge_expired_data()$$);`
- **MFA Supabase** recommandée (action titulaire du compte).
- **Rotation** : régénérer le PAT Supabase CLI exposé pendant le build initial ;
  révoquer l'ancienne clé Cal (déjà remplacée).

### En cas d'abus constaté

1. Lire les compteurs : `select * from public.rate_limits order by count desc;`
2. Identifier le motif (une IP ou distribué), abaisser temporairement les limites.
3. Vérifier le dashboard Resend (bounces, complaints, quota).
4. Abus distribué sur la newsletter : brancher Turnstile (voir ci-dessus).
5. Purger les fausses lignes via le SQL editor Supabase (service_role).

## Actions manuelles restantes (détenteur de comptes)

Ces étapes ne peuvent être réalisées que par le titulaire des comptes :

- [ ] Créer le **projet Supabase** et exécuter `0001_init.sql`.
- [ ] Créer le compte **Cal.com**, l'event type 20 min et le webhook.
- [ ] Créer le compte **Resend**, vérifier le domaine, générer la clé.
- [ ] Créer/associer le projet **Vercel** et y saisir les variables d'environnement.
- [ ] Créer les **enregistrements DNS** chez Hostinger (Vercel + Resend).
- [ ] Remplir `.env` (local) / les variables Vercel (prod) à partir de `.env.example`.

Une fois ces étapes faites, le site est pleinement fonctionnel et prend des
rendez-vous.

## Assets de marque

L'emblème (matière sombre d'où jaillit un point d'or) est intégré au hero, à
l'en-tête, au favicon et à l'image de partage. Ils sont générés depuis le PNG
source `brand/logo-exdal-source.png` :

```bash
node scripts/logo.mjs           # emblème, icônes, opengraph-image
node scripts/logo.mjs L T S     # recadre l'emblème (left top size en px)
```

Sorties : `public/emblem.png`, `app/icon.png`, `app/apple-icon.png`,
`app/opengraph-image.png` (détectés automatiquement par Next).

## Tests & qualité

```bash
pnpm test     # Vitest — validation Zod, URL Cal.com, signature webhook
pnpm build    # vérifie types + build de production
pnpm lint     # ESLint (config Next.js)
```

Sécurité : secrets uniquement en variables d'environnement, RLS Supabase verrouillée,
signature HMAC du webhook, honeypot + rate-limiting sur les formulaires, en-têtes de
sécurité (`next.config.ts`).
