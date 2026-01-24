# Version Web de l'Application

Ce dossier contient la version web de l'application React Native, développée avec Next.js.

## Architecture

Le projet est conçu pour réutiliser un maximum de code de l'application mobile existante (située dans le dossier parent) :

- **Pages** : Les pages web dans `app/` sont des "wrappers" qui importent directement les écrans de l'application mobile (`../../app/...`).
- **Composants & Logique** : Les composants, stores (Zustand), services (API) et types sont importés directement depuis la racine du projet via l'alias `@/`.
- **Compatibilité** :
  - `react-native-web` est utilisé pour rendre les composants React Native (View, Text, Image) dans le navigateur.
  - `expo-router` est mocké dans `src/lib/expo-router-mock.tsx` pour intercepter la navigation mobile et la traduire en routes Next.js (ex: `/(tabs)/index` -> `/tabs`).
  - `React 18` et `Next.js 14` sont utilisés pour assurer la compatibilité avec l'écosystème React Native Web.

## Structure

- `app/` : Routes Next.js (App Router).
  - `tabs/` : Contient les onglets principaux (Accueil, Entreprise, Finance, Profil).
  - `(auth)/` : Pages d'authentification.
  - `client-produit-details/` : Pages de détail.
- `components/` : Composants spécifiques au web (ex: `WebTabBar`).
- `src/lib/` : Utilitaires de compatibilité (Mock Router).

## Installation et Lancement

1. **Installation des dépendances** :
   ```bash
   cd web
   npm install --legacy-peer-deps
   ```
   *Note : L'option `--legacy-peer-deps` est nécessaire pour résoudre les conflits de version entre React Native et React DOM.*

2. **Lancement en développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

3. **Build pour production** :
   ```bash
   npm run build
   npm start
   ```

## Notes importantes

- Ne modifiez pas les fichiers dans le dossier parent (racine) pour le web, sauf si nécessaire pour la logique partagée.
- Si vous ajoutez de nouvelles routes, suivez le modèle des wrappers existants dans `app/`.
