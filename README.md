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
| `NEXT_PUBLIC_CAL_LINK`       |   ✅   | lien Cal.com (slug ou URL)                 |
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
2. Copiez son lien → `NEXT_PUBLIC_CAL_LINK` (slug `exdal/echange-20min` ou URL).
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

## Tests & qualité

```bash
pnpm test     # Vitest — validation Zod, URL Cal.com, signature webhook
pnpm build    # vérifie types + build de production
pnpm lint     # ESLint (config Next.js)
```

Sécurité : secrets uniquement en variables d'environnement, RLS Supabase verrouillée,
signature HMAC du webhook, honeypot + rate-limiting sur les formulaires, en-têtes de
sécurité (`next.config.ts`).
