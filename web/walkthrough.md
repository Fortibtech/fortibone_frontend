# Migration Web Fortibone - Guide de Démarrage

Ce document détaille les travaux réalisés pour migrer l'application React Native Fortibone vers le Web avec Next.js, ainsi que les instructions pour lancer le projet.

## Architecture

*   **Dossier Web**: `/web` (Next.js 14, React 18).
*   **Partage de Code**: Utilisation de `react-native-web` pour rendre les composants mobiles sur le web.
*   **Navigation**: Mock de `expo-router` dans `web/src/lib/expo-router-mock.tsx` pour simuler le routage mobile.
*   **Dépendances Natives**: Configuration spécifique dans `next.config.js` et `.babelrc` pour supporter :
    *   `react-native-reanimated`
    *   `react-native-gesture-handler`
    *   `react-native-safe-area-context`
    *   `react-native-vector-icons` (via configuration Webpack pour les .ttf)

## Modifications Clés

### 1. Configuration du Build (Next.js & Babel)
*   **Babel**: Configuration explicite dans `.babelrc` pour inclure les plugins requis par Reanimated (`@babel/plugin-proposal-optional-chaining`, etc.).
*   **Webpack**:
    *   Définition de la variable globale `__DEV__` (requise par de nombreuses libs React Native).
    *   Support des fichiers de police `.ttf` via `asset/resource`.
    *   Alias `@/` pointant vers la racine du projet parent pour importer le code mobile.

### 2. Gestion des Erreurs Runtime
*   **Imports**: Remplacement des imports relatifs profonds (`../../../../`) par des alias `@/app/...` pour éviter les erreurs "Module not found".
*   **SafeArea**: Ajout de `SafeAreaProvider` avec `initialMetrics` dans `ClientLayout` pour éviter les erreurs d'hydratation (`removeChild`).
*   **Strict Mode**: Désactivé dans `next.config.js` pour la stabilité de `react-native-web`.
*   **Hydratation**: Sécurisation de l'hydratation du `userStore` dans `ClientLayout`.

## Instructions de Lancement

> [!IMPORTANT]
> Assurez-vous d'arrêter tous les processus Node.js en cours qui pourraient occuper les ports 3000-3010 suite aux tentatives automatiques.

1.  **Nettoyer le cache (recommandé)** :
    ```bash
    cd web
    rm -rf .next
    ```

2.  **Installer les dépendances (si ce n'est pas fait)** :
    ```bash
    npm install
    # Si erreur de dépendances, utilisez:
    npm install --legacy-peer-deps
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

4.  **Accéder à l'application** :
    Ouvrir [http://localhost:3000](http://localhost:3000)

## Dépannage Courant

*   **Erreur 500 / 404 sur les assets** : Cela arrive souvent si le build Webpack a échoué silencieusement ou si plusieurs instances de Next.js tournent en même temps. -> **Arrêtez tout et relancez**.
*   **Erreur `DefinePlugin`** : Déjà corrigée dans `next.config.js`. Si elle réapparaît, vérifiez la syntaxe `new webpack.DefinePlugin`.
*   **Erreur d'affichage (page blanche)** : Vérifiez la console du navigateur. Si c'est lié au Store, le fix dans `ClientLayout` devrait l'avoir résolu.
