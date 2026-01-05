'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';
import BusinessSelector from '@/components/business/BusinessSelector';
import styles from './Sidebar.module.css';
import { useEffect } from 'react';

// Icons (simple SVG icons)
const icons = {
    home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    orders: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    products: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    wallet: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    analytics: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    user: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    menu: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    truck: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
    table: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
    ),
    logout: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    cart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    business: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z" />
            <path d="M3 7h18v4H3z" />
            <path d="M8 21V11" />
            <path d="M16 21V11" />
        </svg>
    ),
};

interface NavItem {
    label: string;
    href: string;
    icon: keyof typeof icons;
}

interface SidebarProps {
    businessType?: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR' | 'PARTICULIER';
}

// Navigation alignée exactement sur les onglets mobiles de chaque profil
const navigationByType: Record<string, NavItem[]> = {
    // PARTICULIER - Navigation client (EXACTEMENT comme mobile: 4 tabs)
    // Mobile: Accueil | Entreprise | Finance | Profil
    PARTICULIER: [
        { label: 'Accueil', href: '/dashboard/particulier', icon: 'home' },
        { label: 'Entreprises', href: '/dashboard/particulier/businesses', icon: 'business' },
        { label: 'Finance', href: '/dashboard/particulier/finance', icon: 'wallet' },
        { label: 'Profil', href: '/dashboard/particulier/profile', icon: 'user' },
    ],
    // COMMERÇANT - Mobile: Accueil | Produits | Achats | Ventes | Finance
    COMMERCANT: [
        { label: 'Accueil', href: '/dashboard/commercant', icon: 'home' },
        { label: 'Produits', href: '/dashboard/commercant/products', icon: 'products' },
        { label: 'Achats', href: '/dashboard/commercant/achats', icon: 'cart' },
        { label: 'Ventes', href: '/dashboard/commercant/ventes', icon: 'analytics' },
        { label: 'Finance', href: '/dashboard/commercant/wallet', icon: 'wallet' },
    ],
    // RESTAURATEUR - Mobile: Accueil | Tables | Menus | Achats | Finance
    RESTAURATEUR: [
        { label: 'Accueil', href: '/dashboard/restaurateur', icon: 'home' },
        { label: 'Tables', href: '/dashboard/restaurateur/tables', icon: 'table' },
        { label: 'Menus', href: '/dashboard/restaurateur/menus', icon: 'menu' },
        { label: 'Achats', href: '/dashboard/restaurateur/achats', icon: 'cart' },
        { label: 'Finance', href: '/dashboard/restaurateur/wallet', icon: 'wallet' },
    ],
    // FOURNISSEUR - Mobile: Accueil | Produits | Commandes | Finances
    FOURNISSEUR: [
        { label: 'Accueil', href: '/dashboard/fournisseur', icon: 'home' },
        { label: 'Produits', href: '/dashboard/fournisseur/products', icon: 'products' },
        { label: 'Commandes', href: '/dashboard/fournisseur/orders', icon: 'orders' },
        { label: 'Finances', href: '/dashboard/fournisseur/wallet', icon: 'wallet' },
    ],
    // LIVREUR - Mobile: Accueil | Courses | Revenus | Véhicules | Paramètres | Finances
    LIVREUR: [
        { label: 'Accueil', href: '/dashboard/livreur', icon: 'home' },
        { label: 'Courses', href: '/dashboard/livreur/courses', icon: 'truck' },
        { label: 'Revenus', href: '/dashboard/livreur/earnings', icon: 'wallet' },
        { label: 'Véhicules', href: '/dashboard/livreur/vehicles', icon: 'truck' },
        { label: 'Paramètres', href: '/dashboard/livreur/settings', icon: 'user' },
        { label: 'Finances', href: '/dashboard/livreur/finances', icon: 'wallet' },
    ],
};

export default function Sidebar({ businessType = 'PARTICULIER', collapsed = false, onToggleCollapse }: SidebarProps & { collapsed?: boolean; onToggleCollapse?: () => void }) {
    const pathname = usePathname();
    const { userProfile, logout } = useUserStore();

    // Responsive collapse logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && window.innerWidth >= 640 && !collapsed && onToggleCollapse) {
                // Auto collapse on tablet if not already collapsed
                // But we need to be careful not to override user choice if we had one.
                // For MVP structure fix: Force collapse on tablet range.
                onToggleCollapse();
            } else if (window.innerWidth >= 1024 && collapsed && onToggleCollapse) {
                // Auto expand on desktop if collapsed by default (optional, can leave user choice)
                // Better UX: Start collapsed on tablet, expanded on desktop.
            }
        };

        // Initial check
        if (window.innerWidth < 1024 && window.innerWidth >= 640 && !collapsed && onToggleCollapse) {
            onToggleCollapse();
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array to run only on mount/unmount + manual resize

    const navItems = navigationByType[businessType] || navigationByType.PARTICULIER;

    const handleLogout = () => {
        logout();
        window.location.href = '/auth/login';
    };

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <button className={styles.toggleBtn} onClick={onToggleCollapse} title={collapsed ? "Agrandir" : "Réduire"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>K</div>
                <span className={styles.logoText}>KomoraLink</span>
            </div>

            {/* Business selector for PRO users - Composant interactif */}
            {userProfile?.profileType === 'PRO' && (
                <div className={styles.businessSelector}>
                    <BusinessSelector />
                </div>
            )}

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    // For home pages (exact dashboard paths), use exact match only
                    // For other pages, also match sub-routes
                    const isHomePage = item.href.match(/^\/dashboard\/[a-z]+$/i);
                    const isActive = isHomePage
                        ? pathname === item.href  // Exact match for home pages
                        : (pathname === item.href || pathname.startsWith(item.href + '/'));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className={styles.navIcon}>{icons[item.icon]}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className={styles.userSection}>
                <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                        {userProfile?.profileImageUrl ? (
                            <img src={userProfile.profileImageUrl} alt={userProfile.firstName} />
                        ) : (
                            userProfile?.firstName?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>
                            {userProfile?.firstName} {userProfile?.lastName}
                        </span>
                        <span className={styles.userEmail}>{userProfile?.email}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn} title="Déconnexion">
                    {icons.logout}
                </button>
            </div>
        </aside>
    );
}
