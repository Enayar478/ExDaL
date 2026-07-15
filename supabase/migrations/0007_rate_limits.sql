-- ============================================================
-- 0007 — Rate limiting durable via Postgres (remplace Upstash)
--
-- Le rate-limit en mémoire est inefficace sur Vercel serverless (compteur par
-- instance, remis à zéro au cold start). Plutôt qu'un service tiers (Upstash),
-- on réutilise Supabase : un compteur PARTAGÉ entre toutes les instances, atomique
-- via un upsert ON CONFLICT (verrou de ligne Postgres).
-- Idempotent.
-- ============================================================

-- Compteur par clé (ex. "lead:<ip>") avec fenêtre glissante fixe.
create table if not exists public.rate_limits (
  key      text primary key,
  count    int not null default 0,
  reset_at timestamptz not null
);

-- Verrouillage : la table n'est jamais accédée directement par le client.
-- L'app passe par la fonction SECURITY DEFINER ci-dessous (rôle service_role).
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Vérifie + incrémente atomiquement le compteur pour `p_key`.
-- Retourne (allowed, remaining). Un seul aller-retour, sans race condition :
-- l'ON CONFLICT DO UPDATE prend un verrou de ligne, les appels concurrents se
-- sérialisent. La fenêtre se réinitialise quand reset_at est dépassé.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_ms int
)
returns table(allowed boolean, remaining int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now   timestamptz := now();
  v_count int;
begin
  insert into public.rate_limits as rl (key, count, reset_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count = case when rl.reset_at < v_now then 1 else rl.count + 1 end,
        reset_at = case
          when rl.reset_at < v_now
          then v_now + make_interval(secs => p_window_ms / 1000.0)
          else rl.reset_at
        end
  returning rl.count into v_count;

  return query select (v_count <= p_limit), greatest(p_limit - v_count, 0);
end;
$$;

-- Moindre privilège : seul service_role (serveur) peut invoquer la fonction.
revoke all on function public.check_rate_limit(text, int, int)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int)
  to service_role;
