# LearnHub – Plateforme d'apprentissage

Application Next.js 14 avec Supabase Auth, modules, leçons et quiz.

## Stack technique

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS**
- **Vercel** (déploiement)

## Structure du projet

```
app/
├── (auth)/
│   ├── login/          → Page de connexion
│   └── signup/         → Page d'inscription
├── (dashboard)/
│   ├── layout.tsx      → Layout protégé (vérifie l'auth)
│   ├── dashboard/      → Tableau de bord (liste des modules)
│   ├── modules/[id]/   → Page d'un module (liste des leçons)
│   ├── lessons/[id]/   → Page d'une leçon (contenu + marquer terminé)
│   └── quiz/[id]/      → Quiz interactif
components/
├── ui/Button.tsx
├── ui/Card.tsx
├── Navbar.tsx
└── ProgressBar.tsx
lib/
├── supabase/client.ts  → Client côté navigateur
├── supabase/server.ts  → Client côté serveur (Server Components)
└── types.ts            → Types TypeScript générés
middleware.ts           → Protection des routes
supabase/
└── migrations/001_initial_schema.sql
```

## Tables Supabase

| Table | Description |
|-------|-------------|
| `profiles` | Profil utilisateur (lié à `auth.users`) |
| `modules` | Modules de cours |
| `lessons` | Leçons (appartiennent à un module) |
| `quizzes` | Quiz (questions en JSONB) |
| `user_progress` | Progression par utilisateur/leçon |

## Démarrage local

### 1. Cloner et installer

```bash
git clone <repo-url>
cd <repo>
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans l'éditeur SQL, exécutez `supabase/migrations/001_initial_schema.sql`
3. Copiez `.env.local.example` vers `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Lancer en développement

```bash
npm run dev
# http://localhost:3000
```

## Déploiement sur Vercel

1. Importez le dépôt sur [vercel.com/new](https://vercel.com/new)
2. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Cliquez **Deploy**

Dans Supabase → Authentication → URL Configuration, ajoutez :
```
https://votre-app.vercel.app/**
```

## Format des questions de quiz (JSONB)

```json
[
  {
    "id": "q1",
    "question": "Quelle balise HTML crée un lien ?",
    "options": ["<div>", "<a>", "<p>", "<span>"],
    "correct_answer": 1
  }
]
```
