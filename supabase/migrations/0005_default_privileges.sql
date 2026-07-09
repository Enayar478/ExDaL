-- ============================================================
-- 0005 — Durcissement : privilèges par défaut + fonction de purge
-- Audit de sécurité final avant validation prod.
--
-- Objet :
--   1. Verrouiller les privilèges par DÉFAUT du schéma public, pour que toute
--      table/fonction/séquence FUTURE ne soit pas ouverte à anon/authenticated
--      (les REVOKE de 0004 ne portaient que sur les objets existants — d'où les
--      correctifs a posteriori 0003/0004 ; on coupe la racine du problème).
--   2. Figer le search_path de la fonction SECURITY DEFINER à '' (durcissement).
-- Idempotent : rejouable sans effet de bord.
-- ============================================================

-- 1. Privilèges par défaut : rien pour anon/authenticated sur le FUTUR.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges in schema public
  revoke all on functions from anon, authenticated;

-- Empêche anon/authenticated de créer des objets dans public (defense-in-depth).
revoke create on schema public from anon, authenticated;

-- 2. Fonction de purge RGPD : search_path vide (pratique recommandée pour
--    SECURITY DEFINER). Toutes les références du corps sont déjà pleinement
--    qualifiées (public.leads, public.newsletter_subscribers) — aucun risque.
alter function public.purge_expired_data() set search_path = '';
