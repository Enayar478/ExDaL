-- ExDaL — schéma initial des leads et signaux de segmentation.
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
--
-- Sécurité : RLS activé, aucune policy publique. L'accès se fait exclusivement
-- via la clé service_role côté serveur (qui contourne RLS). Les clés anon/publiques
-- ne peuvent donc ni lire ni écrire ces tables. Vos leads restent votre donnée.

create extension if not exists "pgcrypto";

-- Demandes de rendez-vous qualifiées (formulaire en 3 questions).
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  role        text not null,
  company     text not null,
  pennylane   text not null check (pennylane in ('oui', 'non', 'bientot')),
  stage       text not null check (stage in ('pilotage', 'cabinet', 'operation')),
  segment     text check (segment in ('pme', 'cabinet', 'premium')),
  status      text not null default 'new' check (status in ('new', 'booked')),
  booked_at   timestamptz
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_segment_idx on public.leads (segment);

-- Signaux de segmentation : clics sur les portes du sélecteur de parcours.
create table if not exists public.path_signals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  segment     text not null check (segment in ('pme', 'cabinet', 'premium'))
);

create index if not exists path_signals_created_at_idx on public.path_signals (created_at desc);
create index if not exists path_signals_segment_idx on public.path_signals (segment);

-- Row Level Security : verrouillé par défaut, aucune policy = aucun accès public.
alter table public.leads enable row level security;
alter table public.path_signals enable row level security;
