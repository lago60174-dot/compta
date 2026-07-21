-- ============================================================
-- Grand Livre — Schéma de base de données Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table : entreprise (une seule ligne, paramètres généraux)
-- ------------------------------------------------------------
create table if not exists entreprise (
  id uuid primary key default gen_random_uuid(),
  nom text not null default 'Mon Entreprise',
  solde_initial numeric not null default 0,
  devise text not null default 'FCFA',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table : categories
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null check (type in ('recette', 'depense')),
  created_at timestamptz not null default now(),
  unique (nom, type)
);

-- ------------------------------------------------------------
-- Table : clients
-- ------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text,
  adresse text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table : transactions (recettes & dépenses)
-- ------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('recette', 'depense')),
  categorie text not null,
  montant numeric not null check (montant > 0),
  mode_paiement text not null default 'Espèces',
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_date_idx on transactions (date desc);
create index if not exists transactions_type_idx on transactions (type);

-- ------------------------------------------------------------
-- Table : factures
-- ------------------------------------------------------------
create table if not exists factures (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  client_id uuid references clients(id) on delete set null,
  date date not null,
  echeance date,
  statut text not null default 'Brouillon' check (statut in ('Brouillon', 'Envoyée', 'Payée', 'En retard')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists factures_statut_idx on factures (statut);

-- ------------------------------------------------------------
-- Table : facture_items (lignes de facturation)
-- ------------------------------------------------------------
create table if not exists facture_items (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid not null references factures(id) on delete cascade,
  designation text not null,
  quantite numeric not null default 1,
  prix_unitaire numeric not null default 0,
  position int not null default 0
);

create index if not exists facture_items_facture_idx on facture_items (facture_id);

-- ------------------------------------------------------------
-- Table : previsionnel (mouvements de trésorerie à venir)
-- ------------------------------------------------------------
create table if not exists previsionnel (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('recette', 'depense')),
  montant numeric not null check (montant > 0),
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Compteur pour la numérotation atomique des factures (F-0001, F-0002, ...)
-- ------------------------------------------------------------
create table if not exists facture_compteur (
  id int primary key default 1,
  valeur int not null default 0,
  constraint facture_compteur_single_row check (id = 1)
);

insert into facture_compteur (id, valeur)
values (1, 0)
on conflict (id) do nothing;

create or replace function next_facture_numero()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_val int;
begin
  update facture_compteur set valeur = valeur + 1 where id = 1 returning valeur into next_val;
  return 'F-' || lpad(next_val::text, 4, '0');
end;
$$;

grant execute on function next_facture_numero() to authenticated;

-- ------------------------------------------------------------
-- Ligne "entreprise" et catégories par défaut (exécuté une seule fois)
-- ------------------------------------------------------------
insert into entreprise (nom, solde_initial, devise)
select 'Mon Entreprise', 0, 'FCFA'
where not exists (select 1 from entreprise);

insert into categories (nom, type)
select nom, type from (values
  ('Ventes', 'recette'),
  ('Prestations de services', 'recette'),
  ('Autres recettes', 'recette'),
  ('Loyer', 'depense'),
  ('Salaires', 'depense'),
  ('Fournitures & achats', 'depense'),
  ('Transport', 'depense'),
  ('Électricité & eau', 'depense'),
  ('Communication', 'depense'),
  ('Impôts & taxes', 'depense'),
  ('Autres dépenses', 'depense')
) as defaults(nom, type)
on conflict (nom, type) do nothing;

-- ------------------------------------------------------------
-- Fonction : créer ou mettre à jour une facture ET ses lignes en une
-- seule transaction atomique (évite les écritures partielles).
-- ------------------------------------------------------------
create or replace function upsert_facture_with_items(
  p_id uuid,
  p_client_id uuid,
  p_date date,
  p_echeance date,
  p_statut text,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
  v_numero text;
begin
  if p_id is null then
    v_numero := next_facture_numero();
    insert into factures (numero, client_id, date, echeance, statut, notes, created_by)
    values (v_numero, p_client_id, p_date, p_echeance, p_statut, p_notes, auth.uid())
    returning id into v_id;
  else
    v_id := p_id;
    update factures
      set client_id = p_client_id, date = p_date, echeance = p_echeance, statut = p_statut, notes = p_notes
      where id = v_id;
    delete from facture_items where facture_id = v_id;
  end if;

  insert into facture_items (facture_id, designation, quantite, prix_unitaire, position)
  select v_id,
         (item->>'designation')::text,
         (item->>'quantite')::numeric,
         (item->>'prixUnitaire')::numeric,
         ord - 1
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  return v_id;
end;
$$;

grant execute on function upsert_facture_with_items(uuid, uuid, date, date, text, text, jsonb) to authenticated;

-- ------------------------------------------------------------
-- Fonction : marquer une facture payée + créer automatiquement la
-- recette correspondante dans les transactions (atomique).
-- ------------------------------------------------------------
create or replace function marquer_facture_payee(p_facture_id uuid, p_mode_paiement text default 'Virement bancaire')
returns void
language plpgsql
as $$
declare
  v_numero text;
  v_client_nom text;
  v_total numeric;
begin
  select f.numero, c.nom
    into v_numero, v_client_nom
    from factures f
    left join clients c on c.id = f.client_id
    where f.id = p_facture_id;

  select coalesce(sum(quantite * prix_unitaire), 0) into v_total
    from facture_items where facture_id = p_facture_id;

  update factures set statut = 'Payée' where id = p_facture_id;

  insert into transactions (date, type, categorie, montant, mode_paiement, description, created_by)
  values (
    current_date, 'recette', 'Ventes', v_total, p_mode_paiement,
    'Facture ' || v_numero || coalesce(' — ' || v_client_nom, ''),
    auth.uid()
  );
end;
$$;

grant execute on function marquer_facture_payee(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- Row Level Security
-- Toute personne authentifiée (= membre de l'équipe invité dans le
-- projet Supabase) peut lire et modifier toutes les données. C'est un
-- outil interne mono-entreprise : pas de séparation par utilisateur.
-- ------------------------------------------------------------
alter table entreprise enable row level security;
alter table categories enable row level security;
alter table clients enable row level security;
alter table transactions enable row level security;
alter table factures enable row level security;
alter table facture_items enable row level security;
alter table previsionnel enable row level security;
alter table facture_compteur enable row level security;

create policy "equipe_full_access" on entreprise for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on categories for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on clients for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on transactions for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on factures for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on facture_items for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on previsionnel for all to authenticated using (true) with check (true);
create policy "equipe_full_access" on facture_compteur for all to authenticated using (true) with check (true);
