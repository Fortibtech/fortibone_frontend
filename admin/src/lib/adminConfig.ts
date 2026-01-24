// Configuration Admin Temporaire
// TODO: Remplacer par un système de rôles backend après le lancement

/**
 * Liste des emails autorisés à accéder au dashboard admin
 * Cette solution est TEMPORAIRE pour le lancement
 */
export const ADMIN_EMAILS = [
    'gammefouad2016@gmail.com',
    'admin@komoralink.com',
    // Ajouter d'autres emails admin ici si nécessaire
];

/**
 * Vérifie si un email est autorisé comme admin
 * @param email - Email de l'utilisateur
 * @returns true si l'email est dans la whitelist
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Pages demandant juste une authentification (sans être admin)
 * Exemple: Documentation
 */
export const AUTHENTICATED_ROUTES = [
    '/docs',
];

/**
 * Pages publiques accessibles sans authentification
 */
export const PUBLIC_ROUTES = [
    '/docs/start', // Public Onboarding/Start page
    '/about',
    '/careers',
    '/login',
];

/**
 * Vérifie si une route est publique
 * @param pathname - Chemin de la route
 * @returns true si la route est publique
 */
export const isPublicRoute = (pathname: string): boolean => {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Vérifie si une route demande juste une authentification simple (pas admin)
 */
export const isAuthenticatedRoute = (pathname: string): boolean => {
    return AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route));
};
