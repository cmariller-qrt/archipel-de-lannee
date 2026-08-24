-- ============================================================
-- Atlas de l'Année — Schéma Supabase
-- ============================================================
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
--
-- Approche retenue pour ce prototype : une seule ligne par utilisateur,
-- contenant tout l'état de l'application (projets, sous-catégories,
-- commentaires, notes) dans une colonne JSONB. C'est volontairement
-- simple pour démarrer vite ; on pourra normaliser en vraies tables
-- (projects, subcategories, comments...) plus tard si besoin de
-- requêtes plus fines (stats, recherche, etc.).
-- ============================================================

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Maintenir updated_at automatiquement à chaque modification
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_state_updated_at on public.app_state;
create trigger trg_app_state_updated_at
  before update on public.app_state
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security : chaque utilisateur ne voit / modifie que sa ligne
-- ============================================================
alter table public.app_state enable row level security;

drop policy if exists "select_own_state" on public.app_state;
create policy "select_own_state"
  on public.app_state for select
  using (auth.uid() = user_id);

drop policy if exists "insert_own_state" on public.app_state;
create policy "insert_own_state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "update_own_state" on public.app_state;
create policy "update_own_state"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Étape suivante (plus tard) : si tu veux passer à de vraies tables
-- relationnelles (projects / subcategories / comments séparées),
-- ce fichier sera le bon endroit pour ajouter les nouvelles
-- migrations. Pour l'instant, la colonne JSONB "data" suffit pour
-- démarrer et est simple à faire évoluer.
-- ============================================================
