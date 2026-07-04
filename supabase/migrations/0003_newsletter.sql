-- ExDaL — table newsletter_subscribers (double opt-in RGPD).
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
--
-- Sécurité : RLS activée, aucune policy publique. REVOKE sur anon et authenticated
-- pour défense en profondeur. L'accès se fait exclusivement via service_role serveur.
-- confirmed_at NULL = abonné en attente de confirmation. Non NULL = opt-in validé.

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  confirmed_at timestamptz,
  source       text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

create index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);

create index if not exists newsletter_subscribers_confirmed_at_idx
  on public.newsletter_subscribers (confirmed_at)
  where confirmed_at is not null;

-- Row Level Security : verrouillé par défaut, aucune policy = aucun accès public.
alter table public.newsletter_subscribers enable row level security;

-- Défense en profondeur : même avec RLS activée, on révoque explicitement
-- tout privilège aux rôles publics (cohérent avec 0001_init.sql).
revoke all on public.newsletter_subscribers from anon;
revoke all on public.newsletter_subscribers from authenticated;
