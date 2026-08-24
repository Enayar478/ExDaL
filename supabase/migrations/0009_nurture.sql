-- ExDaL : moteur de lead nurturing (séquences email post-consentement).
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
-- NE PAS appliquer en prod avant revue : migration livrée avec la PR du moteur.
--
-- Sécurité : RLS activée, aucune policy publique. REVOKE sur anon et authenticated
-- pour défense en profondeur (cohérent avec 0001/0003/0004/0007). L'accès se fait
-- exclusivement via service_role serveur (cron d'envoi, routes API).
--
-- Modèle :
--   nurture_enrollments : un parcours (une séquence) pour un email donné.
--     `consent_at` est NOT NULL : un enrollment ne peut exister sans preuve de
--     consentement marketing explicite (cohérent avec marketing_consent/_at,
--     migration 0008). L'index unique partiel empêche un double parcours vivant
--     pour le même email (un email ne reçoit jamais deux séquences en parallèle).
--   nurture_sends : trace d'envoi par étape, une ligne par (enrollment, step).
--     La contrainte unique (enrollment_id, step) sert de verrou d'idempotence :
--     le cron « réclame » une étape par un insert, et un ON CONFLICT DO NOTHING
--     empêche un double envoi si deux passages du cron se chevauchent.

create table if not exists public.nurture_enrollments (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  email          text not null,
  sequence       text not null check (sequence in ('pilotage', 'cabinet', 'premium')),
  source         text not null check (source in ('qualification', 'score')),
  lead_id        uuid references public.leads (id) on delete set null,
  status         text not null default 'pending'
                   check (status in ('pending', 'active', 'completed', 'stopped', 'unsubscribed')),
  started_at     timestamptz,
  next_step      integer not null default 0 check (next_step between 0 and 6),
  next_send_at   timestamptz,
  stopped_at     timestamptz,
  stop_reason    text check (stop_reason in ('booked', 'unsubscribed', 'replied', 'manual', 'bounced', 'complained')),
  -- Preuve RGPD (article 7) : jamais NULL, horodatage serveur du consentement
  -- explicite qui a permis l'inscription à ce parcours.
  consent_at     timestamptz not null
);

-- Un seul parcours vivant (pending ou active) à la fois par email : empêche
-- d'enrôler deux fois la même personne dans deux séquences en parallèle.
create unique index if not exists nurture_enrollments_live_email_idx
  on public.nurture_enrollments (lower(email))
  where status in ('pending', 'active');

-- Le cron d'envoi ne scanne que les parcours actifs arrivés à échéance.
create index if not exists nurture_enrollments_due_idx
  on public.nurture_enrollments (next_send_at)
  where status = 'active';

-- Recherche par email indépendamment du statut (désinscription, support).
create index if not exists nurture_enrollments_email_idx
  on public.nurture_enrollments (lower(email));

create table if not exists public.nurture_sends (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.nurture_enrollments (id) on delete cascade,
  step           integer not null check (step between 0 and 5),
  email_key      text not null,
  status         text not null default 'claimed' check (status in ('claimed', 'sent', 'failed')),
  attempts       integer not null default 1,
  resend_id      text,
  created_at     timestamptz not null default now(),
  sent_at        timestamptz,
  constraint nurture_sends_once unique (enrollment_id, step)
);

-- Row Level Security : verrouillé par défaut, aucune policy = aucun accès public.
alter table public.nurture_enrollments enable row level security;
alter table public.nurture_sends enable row level security;

-- Défense en profondeur : même avec RLS activée, on révoque explicitement
-- tout privilège aux rôles publics (cohérent avec 0001/0003/0004/0007).
revoke all on public.nurture_enrollments from anon;
revoke all on public.nurture_enrollments from authenticated;
revoke all on public.nurture_sends from anon;
revoke all on public.nurture_sends from authenticated;

comment on column public.nurture_enrollments.email is
  'PII : adresse e-mail du prospect (non hachée). Purge RGPD via purge_expired_data(), au-delà de 12 mois après clôture.';
comment on column public.nurture_enrollments.consent_at is
  'Horodatage serveur du consentement explicite ayant permis l''inscription (preuve RGPD, article 7). Jamais NULL.';
comment on column public.nurture_enrollments.stop_reason is
  'Cause de sortie de séquence : booked/replied stoppent le nurturing car l''objectif est atteint, unsubscribed/manual/bounced/complained le stoppent pour préserver la délivrabilité et le consentement.';

-- ============================================================
-- Purge RGPD : étend purge_expired_data() (définie en 0004) aux tables
-- nurture_*. Recréée intégralement (CREATE OR REPLACE) : le corps existant
-- pour leads/newsletter est repris à l'identique, seul l'ajout nurture est
-- nouveau. search_path verrouillé à vide : tous les objets sont déjà
-- qualifiés `public.…`, ce qui neutralise toute injection de schéma.
-- ============================================================
create or replace function public.purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_leads_new        int;
  deleted_leads_booked     int;
  deleted_newsletter       int;
  deleted_nurture          int;
begin
  -- Leads « new » non convertis depuis plus de 12 mois (RGPD : durée de conservation).
  delete from public.leads
  where  status = 'new'
    and  created_at < now() - interval '12 months';
  get diagnostics deleted_leads_new = row_count;

  -- Leads « booked » depuis plus de 3 ans (durée contractuelle + RGPD).
  delete from public.leads
  where  status = 'booked'
    and  booked_at < now() - interval '3 years';
  get diagnostics deleted_leads_booked = row_count;

  -- Abonnés newsletter non confirmés depuis plus de 30 jours.
  delete from public.newsletter_subscribers
  where  confirmed_at is null
    and  created_at < now() - interval '30 days';
  get diagnostics deleted_newsletter = row_count;

  -- Parcours nurture clos (terminé, arrêté ou désinscrit) depuis plus de 12 mois.
  -- coalesce(stopped_at, created_at) : un parcours « completed » n'horodate pas
  -- toujours stopped_at, on retombe alors sur sa date de création.
  -- Les lignes nurture_sends associées sont supprimées en cascade (FK on delete cascade).
  delete from public.nurture_enrollments
  where  status in ('completed', 'stopped', 'unsubscribed')
    and  coalesce(stopped_at, created_at) < now() - interval '12 months';
  get diagnostics deleted_nurture = row_count;

  return jsonb_build_object(
    'purged_leads_new',        deleted_leads_new,
    'purged_leads_booked',     deleted_leads_booked,
    'purged_newsletter',       deleted_newsletter,
    'purged_nurture_enrollments', deleted_nurture,
    'executed_at',             now()
  );
end;
$$;

-- Seul service_role peut exécuter cette fonction (pas anon, pas authenticated).
revoke execute on function public.purge_expired_data() from public;
revoke execute on function public.purge_expired_data() from anon;
revoke execute on function public.purge_expired_data() from authenticated;

comment on function public.purge_expired_data() is
  'Purge RGPD automatique (leads, newsletter, nurture). Planifier via pg_cron : '
  'SELECT cron.schedule(''purge-expired-data'', ''0 3 * * *'', $$SELECT public.purge_expired_data()$$); '
  'Extension pg_cron disponible sur Supabase Pro (Dashboard → Database → Extensions).';
