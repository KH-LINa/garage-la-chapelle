-- Migration Phase B : champs YouSign sur la table contracts
-- Suppose que la table contracts existe déjà (Phase A)

-- Ajout des colonnes pour les documents post-signature
alter table public.contracts
  add column if not exists signed_pdf_url text,
  add column if not exists proof_url      text,
  add column if not exists declined_at    timestamptz;

-- Ajout du statut "refuse" si la colonne status utilise un check constraint
-- Si Phase A utilise un type enum ou check constraint, adapter selon le schéma.
-- Exemple si c'est un check constraint nommé "contracts_status_check" :
--
-- alter table public.contracts
--   drop constraint if exists contracts_status_check;
-- alter table public.contracts
--   add constraint contracts_status_check
--     check (status in ('brouillon','envoye','signe','archive','refuse'));
--
-- Si c'est un type texte libre, aucune migration supplémentaire nécessaire.

-- S'assurer que la colonne yousign_ref existe (au cas où Phase A ne l'aurait pas créée)
alter table public.contracts
  add column if not exists yousign_ref   text,
  add column if not exists sent_at       timestamptz,
  add column if not exists signed_at     timestamptz;

-- Index pour retrouver rapidement un contrat via yousign_ref (appelé par le webhook)
create index if not exists idx_contracts_yousign_ref on public.contracts(yousign_ref)
  where yousign_ref is not null;
