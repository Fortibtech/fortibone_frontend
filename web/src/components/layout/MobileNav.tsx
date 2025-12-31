'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';

interface MobileNavProps {
    businessType?: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR' | 'PARTICULIER';
}

const icons = {
    home: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    orders: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    wallet: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    user: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    products: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    ),
    business: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z" />
            <path d="M3 7h18v4H3z" />
            <path d="M8 21V11" />
            <path d="M16 21V11" />
        </svg>
    ),
    cart: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
};

interface NavItem {
    label: string;
    href: string;
    icon: keyof typeof icons;
}

// Navigation mobile alignée exactement sur les onglets mobiles de chaque profil
const navigationByType: Record<string, NavItem[]> = {
    // PARTICULIER - Navigation client
    PARTICULIER: [
        { label: 'Accueil', href: '/dashboard/particulier', icon: 'home' },
        { label: 'Entreprises', href: '/dashboard/particulier/businesses', icon: 'business' },
        { label: 'Finances', href: '/dashboard/particulier/finance', icon: 'wallet' },
        { label: 'Profil', href: '/dashboard/particulier/profile', icon: 'user' },
    ],
    // COMMERÇANT - Mobile: Accueil | Produits | Achats | Ventes | Finance
    COMMERCANT: [
        { label: 'Accueil', href: '/dashboard/commercant', icon: 'home' },
        { label: 'Produits', href: '/dashboard/commercant/products', icon: 'products' },
        { label: 'Achats', href: '/dashboard/commercant/achats', icon: 'orders' },
        { label: 'Ventes', href: '/dashboard/commercant/ventes', icon: 'wallet' },
        { label: 'Finance', href: '/dashboard/commercant/wallet', icon: 'wallet' },
    ],
    // RESTAURATEUR - Mobile: Accueil | Tables | Menus | Achats | Finance
    RESTAURATEUR: [
        { label: 'Accueil', href: '/dashboard/restaurateur', icon: 'home' },
        { label: 'Tables', href: '/dashboard/restaurateur/tables', icon: 'products' },
        { label: 'Menus', href: '/dashboard/restaurateur/menus', icon: 'products' },
        { label: 'Achats', href: '/dashboard/restaurateur/achats', icon: 'orders' },
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
        { label: 'Courses', href: '/dashboard/livreur/courses', icon: 'orders' },
        { label: 'Revenus', href: '/dashboard/livreur/earnings', icon: 'wallet' },
        { label: 'Véhicules', href: '/dashboard/livreur/vehicles', icon: 'products' },
        { label: 'Paramètres', href: '/dashboard/livreur/settings', icon: 'user' },
        { label: 'Finances', href: '/dashboard/livreur/finances', icon: 'wallet' },
    ],
};

export default function MobileNav({ businessType = 'PARTICULIER' }: MobileNavProps) {
    const pathname = usePathname();
    const navItems = navigationByType[businessType] || navigationByType.PARTICULIER;

    return (
        <nav className={styles.mobileNav}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{icons[item.icon]}</span>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
