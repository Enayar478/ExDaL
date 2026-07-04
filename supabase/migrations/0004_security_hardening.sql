-- ExDaL — durcissement sécurité (défense en profondeur).
-- Migration idempotente : sûre à rejouer sur une base déjà partiellement appliquée.
--
-- Périmètre :
--   1. REVOKE ALL sur les 3 tables pour anon + authenticated (cohérence 0001/0003).
--   2. REVOKE usage schéma public pour anon et authenticated.
--   3. Contrainte unique sur leads.email + normalisation lowercase.
--   4. Index partiel RGPD sur leads (status='new') et newsletter non confirmés.
--   5. Fonction SECURITY DEFINER de purge RGPD + note pg_cron.
--   6. Commentaires PII explicites sur colonnes sensibles.

-- ============================================================
-- 1. REVOKE ALL — défense en profondeur sur toutes les tables
-- ============================================================
-- leads et path_signals : déjà couverts par 0001_init, rejouer est sans effet.
revoke all on public.leads              from anon;
revoke all on public.leads              from authenticated;
revoke all on public.path_signals       from anon;
revoke all on public.path_signals       from authenticated;
-- newsletter_subscribers : déjà fait dans 0003 ; on rejoue pour cohérence.
revoke all on public.newsletter_subscribers from anon;
revoke all on public.newsletter_subscribers from authenticated;

-- ============================================================
-- 2. REVOKE USAGE sur le schéma public
-- ============================================================
-- Retire l'accès par défaut au schéma public pour les rôles publics Supabase.
-- service_role passe par une connexion BYPASSRLS — non affecté.
-- PostgREST (anon/authenticated) ne peut plus énumérer les tables du schéma.
revoke usage on schema public from anon;
revoke usage on schema public from authenticated;

-- ============================================================
-- 3. Unicité de l'email dans leads (+ normalisation)
-- ============================================================
-- Un lead en doublon brouille les métriques et expose le prospect à des doublons.
-- Index unique partiel sur email minuscule — si la contrainte existe déjà, ne fait rien.
create unique index if not exists leads_email_unique_idx
  on public.leads (lower(email));

-- Annotation PII : email est une donnée personnelle directement identifiante.
comment on column public.leads.email is 'PII — adresse e-mail du prospect (non hachée). Purge au-delà de la durée de rétention RGPD.';

-- ============================================================
-- 4. Commentaires PII et data-governance
-- ============================================================
comment on column public.leads.name    is 'PII — prénom / nom du prospect.';
comment on column public.leads.company is 'PII — entreprise du prospect.';
comment on column public.leads.ip_hash is 'PII indirect — empreinte IP (déjà hachée). Non réversible.';

comment on column public.newsletter_subscribers.email   is 'PII — adresse e-mail de l''abonné (non hachée). Purge RGPD : non confirmés > 30 j, confirmés selon politique de conservation.';
comment on column public.newsletter_subscribers.ip_hash is 'PII indirect — empreinte IP hachée. Non réversible.';

-- ============================================================
-- 5. Indexes RGPD (accélèrent les purges planifiées)
-- ============================================================
-- Leads à l'état « new » depuis plus de 12 mois (candidats à la purge).
create index if not exists leads_new_created_at_idx
  on public.leads (created_at)
  where status = 'new';

-- Abonnés non confirmés (confirmed_at IS NULL, candidats à la purge après 30 j).
-- Cet index existe déjà dans 0003 pour confirmed_at IS NOT NULL ; on ajoute l'inverse.
create index if not exists newsletter_unconfirmed_created_at_idx
  on public.newsletter_subscribers (created_at)
  where confirmed_at is null;

-- ============================================================
-- 6. Fonction de purge RGPD
-- ============================================================
-- SECURITY DEFINER : s'exécute avec les droits du owner (postgres/service_role),
-- pas ceux de l'appelant. search_path verrouillé pour éviter l'injection de schéma.
create or replace function public.purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_leads_new      int;
  deleted_leads_booked   int;
  deleted_newsletter     int;
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

  return jsonb_build_object(
    'purged_leads_new',     deleted_leads_new,
    'purged_leads_booked',  deleted_leads_booked,
    'purged_newsletter',    deleted_newsletter,
    'executed_at',          now()
  );
end;
$$;

-- Seul service_role peut exécuter cette fonction (pas anon, pas authenticated).
revoke execute on function public.purge_expired_data() from public;
revoke execute on function public.purge_expired_data() from anon;
revoke execute on function public.purge_expired_data() from authenticated;

comment on function public.purge_expired_data() is
  'Purge RGPD automatique. Planifier via pg_cron : '
  'SELECT cron.schedule(''purge-expired-data'', ''0 3 * * *'', $$SELECT public.purge_expired_data()$$); '
  'Extension pg_cron disponible sur Supabase Pro (Dashboard → Database → Extensions).';

-- ============================================================
-- FIN — récapitulatif des protections appliquées
-- ============================================================
-- • REVOKE ALL sur leads, path_signals, newsletter_subscribers (anon + authenticated)
-- • REVOKE USAGE schéma public (anon + authenticated)
-- • Index unique partiel sur lower(leads.email)
-- • Index partiel RGPD : leads new + newsletter non confirmés
-- • Commentaires PII sur colonnes sensibles (audit trail)
-- • Fonction purge_expired_data() SECURITY DEFINER, search_path verrouillé
-- • REVOKE EXECUTE sur la fonction de purge
