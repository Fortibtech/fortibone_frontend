# Audit Design & UX KomoraLink - Plan d'Action Stratégique

**Auteur :** Lead Product Designer & UX Architect  
**Date :** Janvier 2026  
**Version :** 1.0  
**Statut :** Document d'Orientation (Prêt pour implémentation)

---

## 1. Synthèse Exécutive

La mission est d'unifier l'expérience utilisateur de **KomoraLink** sur l'ensemble de ses points de contact : Mobile (Source de Vérité), Web (SaaS) et Admin (Corporate/Gestion).

L'audit révèle une base solide mais fragmentée visuellement. Le mobile utilise un langage visuel clair (Teal #00BFA5, Radius 12px), tandis que le Web et l'Admin dérivent vers des palettes "Emerald" (#059669) ou "Teal V2" (#00c9a7), créant une rupture de cohérence.

**Notre objectif clé :** Créer un "Eco-système Unifié" où un utilisateur passant de l'app mobile au dashboard web ne perçoit aucune friction visuelle ou cognitive.

---

## 2. Design System Unifié (Mobile First)

Le Design System Mobile est la **Source de Vérité**. Tous les autres supports doivent s'aligner sur ces tokens.

### 🎨 Palette de Couleurs "Komora Teal"

| Token | Référence Mobile (Source) | Web Actuel (À CORRIGER) | Admin Actuel (À CORRIGER) | **Action Requise** |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | **#00BFA5** (Teal 500) | #059669 (Emerald) | #00c9a7 (Teal Alt) | **Forcer #00BFA5 partout** |
| **Secondary** | **#E8F5E9** (Green 50) | #0ea5e9 (Sky) | #0ea5e9 (Sky) | Aligner sur Mobile #E8F5E9 ou définir un neutre secondaire |
| **Background** | **#FAFAFA** / #FFFFFF | #F9FAFB | #F9FAFB | Standardiser sur #FAFAFA |
| **Text Main** | **#000000** | #111827 (Gray 900) | #111827 (Gray 900) | OK (Optiquement proche) |
| **Text Muted** | **#666666** | #4B5563 (Gray 600) | #4B5563 (Gray 600) | Standardiser sur #666666 |
| **Error** | **#EF4444** (Standard) | #EF4444 | #EF4444 | OK |

### 🔡 Typographie & Spacing

*   **Font Family** : `Inter` (Sans-serif moderne). Validé pour Web/Admin.
*   **Border Radius** :
    *   **Cards/Containers** : `12px` (Mobile Standard). Web utilise parfois `8px` ou `16px`. -> **UNIFIER à 12px (0.75rem)**.
    *   **Buttons** : `12px` (Mobile) ou `20px` (Pills). -> **UNIFIER**.
*   **Shadows** : Utiliser des ombres douces et diffusées (`0 4px 6px -1px rgba(0, 0, 0, 0.05)`) pour éviter l'effet "lourd".

### 🧩 Composants Clés (Stratégie d'Harmonisation)

1.  **Boutons** :
    *   Style Mobile : `Height: 50px`, `Radius: 12px`, `Background: #00BFA5`, `Text: White (Bold)`.
    *   Web : Souvent plus petits. -> **Augmenter l'impact (padding, font-weight)**.
2.  **Cartes (Cards)** :
    *   Style Mobile : `Border: 1px dashed #E0E0E0` (pour les sélections) OU `Border: none + Shadow`.
    *   Web : Standardiser le style "Carte Clean" : Fond Blanc, Radius 12px, Border 1px solid #E2E8F0 (Subtil).

---

## 3. Architecture UX/UI : Le Nouveau "Komora Shell"

Pour résoudre le problème de "vide" et de déséquilibre sur les Dashboards Web et Admin, nous proposons une structure en **Shell (Coquille)** dense et professionnelle.

### Layout Proposé (Desktop)

```text
+---------------------------------------------------------------+
|  SIDEBAR (Fixe, 260px)  |  TOP BAR (Sticky, 64px, Glass)      |
|                         |  [Titre Page]       [Notifs][Profil]|
|  [Logo KomoraLink]      +-------------------------------------+
|                         |  MAIN CONTENT (Centré, Max 1440px)  |
|  [DASHBOARD]            |                                     |
|   • Vue d'ensemble      |  [ KPI GRID (4 cols) ]              |
|   • Statistiques        |  [ Card ][ Card ][ Card ][ Card ]   |
|                         |                                     |
|  [GESTION]              |  [ SECTION PRINCIPALE (2/3) ] [SIDE]|
|   • Commandes (Badge)   |  |                          | |Act| |
|   • Inventaire          |  | Tableau Données Dense    | |log| |
|   • Wallet              |  | (Data Grid Premium)      | |   | |
|                         |  |                          | |   | |
|  [ADMIN CORP]           |  +--------------------------+ +-----+
|   • Documentation       |                                     |
|   • Carrières           |                                     |
+-------------------------+-------------------------------------+
```

### Améliorations UX Spécifiques :

1.  **Densité & Hiérarchie** :
    *   Abandonner les mises en page "pleine largeur" qui étirent le contenu sur 1920px (illisibilité).
    *   Utiliser un **Container Max-Width (1440px)** centré pour le contenu principal.
    *   **Sidebar** : Regrouper les items par contexte (Opérationnel, Finance, Support). Ajouter des icônes Feather (cohérence mobile).
2.  **"Zone Morte" de Droite** :
    *   Transformer l'espace vide à droite en **"Action Panel"** ou **"Activity Feed"** selon le contexte (ex: Dernières notifs, Statut du Wallet rapide).
3.  **Responsive** :
    *   **Desktop (>1024px)** : Sidebar visible.
    *   **Tablet/Mobile (<1024px)** : Sidebar devient un Drawer (Menu Hamburger).
    *   **Bottom Nav (Mobile)** : Strictement réservé à l'App Mobile. Sur le Web Mobile, privilégier le Menu Burger pour scaler les nombreuses options Admin.

---

## 4. Organisation du Contenu Admin

L'Admin sert deux objectifs contradictoires : **Gestion Interne** (Dashboard) et **Communication Externe** (Docs, Careers).

### Recommandation Stratégique : Hybridation

Nous recommandons de séparer visuellement mais de garder techniquement unifiée la plateforme pour simplifier la maintenance.

**Nouvelle Arborescence Recommandée :**

1.  **🔒 Espace Privé (Dashboard)** - `/admin/dashboard`
    *   Requiert Auth.
    *   Vue : KPIs, Alertes, Gestion Utilisateurs, Validation Profils.
    *   *État actuel : Fonctionnel mais design à revoir (Teal).*
2.  **📖 Espace "Ressources" (Hybride)** - `/admin/resources`
    *   **Documentation** (`/admin/docs`) :
        *   Doit être **PUBLIQUE** (SEO, Aide avant-vente).
        *   Structure : Sidebar de navigation (Intro, Start, Pro, FAQ) à gauche. Contenu "Notion-like" au centre.
    *   **Carrières** (`/admin/careers`) :
        *   **PUBLIQUE**.
        *   Design : Hero Banner impactant + Liste Grid des offres.
    *   **Biographie/Mission** (`/admin/about`) :
        *   **PUBLIQUE**.
        *   Design : Storytelling visuel (Photos, Chronologie).

**Pourquoi Publique ?**
*   **SEO** : Attire du trafic organique sur "Plateforme commerce Comores".
*   **Confiance** : Les investisseurs et partenaires vérifient la doc et l'équipe avant de signer.
*   **Support** : Réduit les tickets support si la doc est accessible sans login.

### Nettoyage & "Clean Code"

*   **Pages 404/Vides** :
    *   Identifier les routes comme `/alertes` (si vide) et soit les supprimer, soit mettre un "Coming Soon" propre.
    *   Créer une page `not-found.tsx` stylisée dans le thème Komora.

---

## 5. Responsive & Performance

Pour garantir l'effet "WOW" et "SaaS Premium" (Stripe-like) :

1.  **Breakpoints Critiques** :
    *   **375px (Mobile)** : Padding horizontal 16px. Font-size base 14px. Stack vertical strict.
    *   **768px (Tablet)** : Grid 2 colonnes.
    *   **1440px (Laptop)** : Grid 4 colonnes. Sidebar fixe.
    *   **1920px (Large Screen)** : Le contenu ne doit PAS s'étirer. Maintien du conteneur centré (max 1440px) avec marges auto. Fond gris clair (`#F8F9FA`) autour pour cadrer le contenu blanc.
2.  **Optimisations** :
    *   Utiliser `next/image` partout.
    *   Lazy loading sur les graphiques (Recharts).
    *   Éviter les CLS (Content Layout Shift) en définissant des hauteurs fixes pour les squelettes de chargement (Skeletons).

---

## 6. Prochaines Étapes (Action Plan)

Pour l'équipe de développement :

1.  **Sancutary (J+1)** : Mettre à jour `globals.css` (Web & Admin) avec les variables CSS Mobile (`--color-primary: #00BFA5`).
2.  **Layout (J+2)** : Refactoriser `DashboardLayout` pour implémenter la structure "Shell" avec max-width.
3.  **Content (J+3)** : Rendre les pages `docs`, `careers`, `about` accessibles publiquement (ajuster middleware Auth).
4.  **Polish (J+4)** : Audit visuel final sur écran 1920px et Mobile.

---
*Ce document sert de feuille de route pour la transformation UI/UX de KomoraLink vers un standard international.*
