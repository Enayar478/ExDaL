-- ExDaL — consentement marketing explicite (RGPD).
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
--
-- Preuve RGPD : `marketing_consent` reflète une case à cocher NON précochée
-- dans les formulaires (qualification et score). Elle vaut `false` par défaut
-- et par absence du champ (fail-safe : pas de consentement = pas d'email
-- marketing). `marketing_consent_at` horodate CÔTÉ SERVEUR le moment exact
-- où le consentement explicite a été recueilli ; il reste NULL tant que le
-- consentement n'a jamais été donné, ce qui constitue la preuve opposable
-- exigée par l'article 7 du RGPD (le responsable de traitement doit être en
-- mesure de démontrer que la personne a consenti).

alter table public.leads
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

alter table public.score_submissions
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

comment on column public.leads.marketing_consent is
  'Consentement explicite à recevoir des emails marketing (case non précochée). Fail-safe : false par défaut.';
comment on column public.leads.marketing_consent_at is
  'Horodatage serveur du consentement explicite. NULL si jamais consenti (preuve RGPD, article 7).';

comment on column public.score_submissions.marketing_consent is
  'Consentement explicite à recevoir des emails marketing (case non précochée). Fail-safe : false par défaut.';
comment on column public.score_submissions.marketing_consent_at is
  'Horodatage serveur du consentement explicite. NULL si jamais consenti (preuve RGPD, article 7).';
