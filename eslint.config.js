// .eslintrc.js (renommé pour ESM)
import { FlatCompat } from "@eslint/eslintrc";
import expoConfig from "eslint-config-expo/flat";

// Crée une compatibilité pour les configurations ESM
const compat = new FlatCompat();

export default [
  // Étend la configuration Expo pour les fichiers React Native/Expo
  ...compat.config({
    ...expoConfig,
    env: {
      node: true, // Ajoute l'environnement Node.js pour reconnaître __dirname
      es2021: true, // Supporte les fonctionnalités ES modernes
    },
    parserOptions: {
      sourceType: "module", // Compatible avec ESM
      ecmaVersion: 2021,
    },
  }),
  // Configuration spécifique pour les scripts Node.js comme postinstall.ts
  {
    files: ["*.ts", "postinstall.ts"], // Applique aux fichiers TypeScript, y compris postinstall.ts
    env: {
      node: true, // Reconnaît __dirname, require, etc.
      es2021: true,
    },
    parserOptions: {
      sourceType: "module", // Compatible avec ESM
    },
    rules: {
      "no-undef": "off", // Désactive no-undef pour éviter les erreurs sur __dirname dans ESM
    },
  },
  // Ignorer les dossiers générés
  {
    ignores: ["dist/*", "node_modules/*", "build/*"],
  },
];
