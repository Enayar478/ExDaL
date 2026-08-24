# Nurturing ExDaL, référence opérationnelle

## Schéma du système

```
Consentement RGPD (formulaire qualification / Score)
        │
        ▼
Déclencheurs d'entrée (lib/nurture/repository.ts, createEnrollment)
        │  status=pending (attend un call) ou active (démarre direct)
        ▼
Séquences (lib/nurture/sequences.ts) : pilotage · cabinet · premium
        │  18 emails rédigés, 6 étapes (0 à 5), offsets en jours
        ▼
Cron quotidien 08h00 UTC (app/api/cron/nurture/route.ts, Vercel Cron)
        │  rattrape les pending périmés (48h) puis envoie les étapes dues
        ▼
Déclencheurs de sortie
   ├── booking Cal.com          → app/api/cal-webhook          (stop_reason=booked)
   ├── lien de désinscription   → app/api/nurture/unsubscribe  (stop_reason=unsubscribed)
   ├── bounce / plainte Resend  → app/api/resend-webhook       (stop_reason=bounced|complained)
   └── réponse humaine au mail  → scripts/nurture.mjs stop     (stop_reason=replied)
```

Un seul parcours vivant (`pending`/`active`) par email : contrainte portée par
un index unique partiel (migration `supabase/migrations`). Toute sortie est
idempotente : stopper un parcours déjà arrêté est un no-op.

## Le script `scripts/nurture.mjs`

Outil du CEO, exécuté en local (charge `.env.local` : `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY`). Aucune dépendance ajoutée.

```bash
node scripts/nurture.mjs list           # parcours vivants, email masqué
node scripts/nurture.mjs list --full    # + email en clair
node scripts/nurture.mjs stop <email>   # sortie humaine (stop_reason=replied)
node scripts/nurture.mjs stats          # indicateurs du tunnel
```

Si `.env.local` est absent ou incomplet, le script échoue avec un message
actionnable (jamais de stack brute) :

```
Erreur : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.
  Vérifiez .env.local ou exécutez : vercel env pull .env.local
```

## Requêtes SQL de suivi (celles de `stats`)

À exécuter dans Supabase → SQL Editor pour un contrôle direct, indépendant
du script.

```sql
-- Entrées par séquence
select sequence, count(*) from nurture_enrollments group by sequence;

-- Entrées par source
select source, count(*) from nurture_enrollments group by source;

-- Répartition par statut
select status, count(*) from nurture_enrollments group by status;

-- Taux séquence → booked (rendez-vous réservé pendant le parcours)
select
  sequence,
  count(*) filter (where stop_reason = 'booked') as booked,
  count(*) as total,
  round(
    100.0 * count(*) filter (where stop_reason = 'booked') / count(*), 1
  ) as taux_pct
from nurture_enrollments
group by sequence;

-- Désinscriptions
select count(*) from nurture_enrollments where stop_reason = 'unsubscribed';
```

## Procédure « quelqu'un me répond »

Un prospect répond directement à un email de séquence (pas via Cal.com) :

1. Répondez-lui normalement, depuis votre boîte mail.
2. Sortez-le de séquence : `node scripts/nurture.mjs stop <email>`.
3. Le script confirme le nombre de parcours arrêtés. Zéro parcours arrêté =
   il n'y avait déjà plus de parcours vivant pour cet email (rien à faire).

Ne pas attendre : tant que le parcours reste actif, le prochain email de la
séquence partira au cron du lendemain, en pleine conversation en cours.

## Créer le webhook Resend (hygiène de liste)

1. `https://resend.com` → **Webhooks** → **Add Webhook**.
2. Endpoint : `https://exdal.fr/api/resend-webhook`.
3. Événements à cocher : `email.bounced` et `email.complained` uniquement
   (les autres types sont reçus mais ignorés sans effet par la route).
4. Créez le webhook, copiez le **Signing Secret** (`whsec_...`).
5. Vercel → Project → Settings → Environment Variables → ajoutez
   `RESEND_WEBHOOK_SECRET` avec cette valeur, puis redéployez.

Sans cette variable, `/api/resend-webhook` répond `503` (fail-closed) :
l'hygiène de liste automatique est simplement inactive, sans risque
d'endpoint ouvert.
