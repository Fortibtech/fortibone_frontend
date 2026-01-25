// src/config/stripe.ts
// Configuration centralisée pour Stripe - MODIFIER ICI POUR PRODUCTION

/**
 * 🔑 Clé Stripe
 * 
 * ⚠️ AVANT PRODUCTION :
 * - Remplacez pk_test_... par votre clé pk_live_...
 * - Ou mieux : utilisez une variable d'environnement via Expo Constants
 * 
 * Pour utiliser les variables d'environnement Expo :
 * import Constants from 'expo-constants';
 * export const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey || 'pk_test_...';
 */
export const STRIPE_PUBLISHABLE_KEY =
    'pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP';

/**
 * 🏪 Merchant Identifier (pour Apple Pay)
 */
export const STRIPE_MERCHANT_ID = 'merchant.com.komoralink';

/**
 * 🔗 URL Scheme (pour les redirections 3D Secure)
 */
export const STRIPE_URL_SCHEME = 'komoralink';
