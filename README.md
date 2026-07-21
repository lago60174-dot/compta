# Grand Livre — Gestion Financière

Outil interne de gestion financière : suivi des recettes/dépenses, facturation clients, trésorerie prévisionnelle et rapports.

**Stack :** Next.js 16 (App Router, Server Actions) · Supabase (base de données + authentification) · Tailwind CSS v4 · Recharts.

---

## 1. Prérequis

- [Node.js](https://nodejs.org) version 20.9 ou plus récente
- Un compte [Supabase](https://supabase.com) (gratuit)

Vérifiez votre version de Node :
```bash
node -v
```

## 2. Créer le projet Supabase (base de données + comptes)

1. Allez sur [supabase.com](https://supabase.com) → **New project** (gratuit).
2. Une fois le projet créé, ouvrez **SQL Editor** dans le menu de gauche → **New query**.
3. Copiez-collez **tout le contenu** du fichier [`supabase/schema.sql`](./supabase/schema.sql) de ce projet, puis cliquez sur **Run**.
   Cela crée toutes les tables, les catégories par défaut, la sécurité (RLS) et les fonctions nécessaires (numérotation des factures, marquage "payée", etc.).
4. Allez dans **Project Settings → API**. Notez deux valeurs :
   - **Project URL**
   - **anon public key**
5. (Recommandé) Dans **Authentication → Providers → Email**, vous pouvez désactiver "Confirm email" si vous voulez que les comptes de l'équipe soient utilisables immédiatement après inscription, sans clic de confirmation par email.

## 3. Configurer le projet en local

```bash
# Dans le dossier du projet
cp .env.local.example .env.local
```

Ouvrez `.env.local` et remplissez avec les valeurs récupérées à l'étape 2 :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

Puis installez les dépendances et lancez le serveur de développement :
```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous arrivez sur la page de connexion.

## 4. Créer les comptes de l'équipe

Sur la page de connexion, cliquez sur **"Créer un compte"** et créez un compte pour vous-même (email + mot de passe). Répétez l'opération pour chaque membre de l'équipe (ou votre patronne). Tout le monde partage les mêmes données une fois connecté — il n'y a pas de séparation par utilisateur, c'est un outil interne mono-entreprise.

> Alternative : vous pouvez aussi créer les comptes directement depuis **Supabase Dashboard → Authentication → Users → Add user**, sans passer par la page d'inscription.

## 5. Mettre en ligne (optionnel mais recommandé)

Pour que toute l'équipe y accède depuis n'importe où (pas seulement votre ordinateur), déployez sur [Vercel](https://vercel.com) (gratuit pour ce type d'usage) :

1. Poussez ce projet sur un dépôt GitHub.
2. Sur [vercel.com](https://vercel.com) → **New Project** → importez le dépôt.
3. Dans les paramètres du projet Vercel, ajoutez les mêmes variables d'environnement que dans `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Déployez. Vous obtenez une URL (ex. `gestion-financiere.vercel.app`) à partager avec l'équipe.

## Fonctionnalités

- **Tableau de bord** : solde actuel, recettes/dépenses du mois, graphique 6 mois, factures en attente.
- **Transactions** : ajout/modification/suppression de recettes et dépenses, filtres, export CSV.
- **Facturation** : création de factures avec lignes multiples, gestion des clients, numérotation automatique (F-0001, F-0002…), marquage "payée" (crée automatiquement la recette correspondante), impression.
- **Trésorerie** : solde par mode de paiement, mouvements prévisionnels (entrées/sorties à venir), projection du solde.
- **Rapports** : par période (mois, année, personnalisée), répartition par catégorie, comparatif mensuel sur 12 mois, export CSV.
- **Paramètres** : nom de l'entreprise, solde de départ, gestion des catégories, réinitialisation des données.

## Structure du projet

```
app/
  login/              page de connexion / inscription
  (app)/              zone connectée (barre latérale + pages)
    dashboard/
    transactions/
    facturation/
      clients/
      nouvelle/
      [id]/           modification + impression
    tresorerie/
    rapports/
    parametres/
components/           composants réutilisables (UI, graphiques, icônes)
lib/                  client Supabase, types, fonctions utilitaires
supabase/schema.sql   schéma de base de données à exécuter dans Supabase
proxy.ts              protège les pages (redirige vers /login si non connecté)
```

## Notes techniques

- **Next.js 16** a renommé `middleware.ts` en `proxy.ts` — c'est normal, ce n'est pas une erreur si vous comparez avec d'anciens tutoriels.
- Toutes les données (transactions, factures, clients…) sont **partagées entre tous les comptes** connectés à ce projet Supabase — c'est voulu, puisque c'est un outil d'équipe.
- La devise (FCFA) est actuellement fixe dans l'affichage (`lib/utils.ts`, fonction `fmt`). Pour une autre devise, modifiez cette fonction.
- Si `npm install` échoue à cause de versions de packages introuvables, ouvrez `package.json` et remplacez les numéros de version par `latest` pour les paquets concernés, puis relancez `npm install`.
