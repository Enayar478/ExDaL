-- ExDaL — soumissions du « Score de Préparation à la Cession » (lead magnet inbound).
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
--
-- Sécurité : RLS activé, aucune policy publique. L'accès se fait exclusivement
-- via la clé service_role côté serveur (qui contourne RLS). Les clés anon/publiques
-- ne peuvent ni lire ni écrire cette table.
--
-- Le score est TOUJOURS recalculé côté serveur à partir des réponses (jamais
-- la valeur envoyée par le client). `answers` conserve le détail pour l'analyse
-- commerciale (quelle dimension pèche le plus chez les prospects).

create extension if not exists "pgcrypto";

create table if not exists public.score_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  -- Score recalculé serveur, borné 0–100.
  score       integer not null check (score between 0 and 100),
  -- Clé du palier de verdict (fondations / en-construction / credible / pret).
  verdict     text not null,
  -- Réponses brutes { "q1": "q1b", ... } pour l'analyse par dimension.
  answers     jsonb not null,
  -- Origine (toujours « score-cession » pour l'instant, extensible).
  source      text,
  -- Hash SHA-256 de l'IP (RGPD : on ne stocke jamais l'IP brute).
  ip_hash     text
);

create index if not exists score_submissions_created_at_idx
  on public.score_submissions (created_at desc);
create index if not exists score_submissions_email_idx
  on public.score_submissions (email);
create index if not exists score_submissions_score_idx
  on public.score_submissions (score);

-- Row Level Security : verrouillé par défaut, aucune policy = aucun accès public.
alter table public.score_submissions enable row level security;
