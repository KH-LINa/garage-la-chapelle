-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MODULES
-- ============================================================
create table if not exists public.modules (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  cover_image text,
  order_index integer default 0 not null,
  is_published boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.modules enable row level security;

create policy "Anyone can view published modules"
  on public.modules for select
  using (is_published = true);

-- ============================================================
-- LESSONS
-- ============================================================
create table if not exists public.lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  content text,
  video_url text,
  order_index integer default 0 not null,
  duration_minutes integer,
  is_published boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.lessons enable row level security;

create policy "Anyone can view published lessons"
  on public.lessons for select
  using (is_published = true);

-- ============================================================
-- QUIZZES
-- ============================================================
create table if not exists public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title text not null,
  -- JSON array of { id, question, options: string[], correct_answer: number }
  questions jsonb not null default '[]'::jsonb,
  passing_score integer default 70 not null,
  created_at timestamptz default now() not null
);

alter table public.quizzes enable row level security;

create policy "Authenticated users can view quizzes"
  on public.quizzes for select
  to authenticated
  using (true);

-- ============================================================
-- USER PROGRESS
-- ============================================================
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false not null,
  quiz_score integer,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  unique(user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA
-- ============================================================
insert into public.modules (id, title, description, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Introduction au développement web', 'Les bases du HTML, CSS et JavaScript', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'React & Next.js', 'Créer des applications modernes avec React', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Bases de données & Supabase', 'Stocker et gérer vos données', 3, true)
on conflict do nothing;

insert into public.lessons (id, module_id, title, content, order_index, duration_minutes, is_published) values
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'HTML : les balises essentielles', 'Le HTML structure le contenu d''une page web. Les balises principales sont `<html>`, `<head>`, `<body>`, `<h1>`–`<h6>`, `<p>`, `<a>`, `<img>`, `<ul>`, `<ol>`, `<li>`, `<div>` et `<span>`.', 1, 15, true),
  ('aaaa0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'CSS : mise en forme et flexbox', 'Le CSS stylise les éléments HTML. Flexbox permet de créer des mises en page flexibles avec `display: flex`, `justify-content` et `align-items`.', 2, 20, true),
  ('aaaa0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'JavaScript : variables et fonctions', 'JavaScript rend les pages interactives. Déclarez des variables avec `const` et `let`, et créez des fonctions avec `function` ou les fonctions fléchées.', 3, 25, true),
  ('bbbb0001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Composants React', 'Un composant React est une fonction qui retourne du JSX. Les props permettent de passer des données, et le state gère l''état local avec `useState`.', 1, 20, true),
  ('bbbb0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Routing avec Next.js App Router', 'Next.js utilise le système de fichiers pour le routage. Chaque `page.tsx` dans `app/` devient une route automatiquement.', 2, 15, true),
  ('cccc0001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Introduction à Supabase', 'Supabase est une alternative open-source à Firebase basée sur PostgreSQL. Il offre une base de données, une authentification et du stockage.', 1, 20, true)
on conflict do nothing;

insert into public.quizzes (lesson_id, title, questions, passing_score) values
  ('aaaa0001-0000-0000-0000-000000000001', 'Quiz HTML', '[
    {"id":"q1","question":"Quelle balise définit un titre principal ?","options":["<p>","<h1>","<title>","<header>"],"correct_answer":1},
    {"id":"q2","question":"Quelle balise crée un lien hypertexte ?","options":["<link>","<url>","<a>","<href>"],"correct_answer":2},
    {"id":"q3","question":"Quelle balise insère une image ?","options":["<picture>","<img>","<image>","<photo>"],"correct_answer":1}
  ]'::jsonb, 70),
  ('bbbb0001-0000-0000-0000-000000000001', 'Quiz React', '[
    {"id":"q1","question":"Quel hook gère l''état local dans React ?","options":["useEffect","useContext","useState","useRef"],"correct_answer":2},
    {"id":"q2","question":"Comment s''appellent les paramètres passés à un composant ?","options":["args","props","params","data"],"correct_answer":1},
    {"id":"q3","question":"Que retourne un composant React ?","options":["HTML","CSS","JSX","JSON"],"correct_answer":2}
  ]'::jsonb, 70)
on conflict do nothing;
