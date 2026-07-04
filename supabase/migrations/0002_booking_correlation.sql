-- ExDaL — corrélation booking et idempotence webhook Cal.com.
-- À appliquer dans Supabase (SQL Editor) ou via `supabase db push`.
--
-- 1. cal_booking_uid : référence unique du booking côté Cal.com (champ uid du payload).
--    L'index unique partiel garantit qu'un même booking ne peut être traité qu'une
--    seule fois (idempotence sur replay Cal.com).
-- 2. Index sur status : accélère les requêtes de mise à jour par statut.

alter table public.leads
  add column if not exists cal_booking_uid text;

create unique index if not exists leads_cal_booking_uid_idx
  on public.leads (cal_booking_uid)
  where cal_booking_uid is not null;

create index if not exists leads_status_idx
  on public.leads (status);
