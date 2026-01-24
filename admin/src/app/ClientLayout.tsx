'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { isAdminEmail, isPublicRoute, isAuthenticatedRoute } from '../lib/adminConfig';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    {
        section: 'Supervision',
        items: [
            { href: '/dashboard', label: 'Vue d\'ensemble', icon: '📊' },
            { href: '/analytics', label: 'Analytics', icon: '📈' },
            { href: '/alertes', label: 'Alertes', icon: '🔔' },
        ]
    },
    {
        section: 'Profils Métiers',
        items: [
            { href: '/profils/particuliers', label: 'Particuliers', icon: '👤' },
            { href: '/profils/commercants', label: 'Commerçants', icon: '🏪' },
            { href: '/profils/fournisseurs', label: 'Fournisseurs', icon: '📦' },
            { href: '/profils/restaurateurs', label: 'Restaurateurs', icon: '🍽️' },
            { href: '/profils/livreurs', label: 'Livreurs', icon: '🚴' },
        ]
    },
    {
        section: 'Gestion',
        items: [
            { href: '/dashboard/careers', label: 'Recrutement', icon: '💼' },
        ]
    },
    {
        section: 'Compte',
        items: [
            { href: '/profile', label: 'Mon Profil', icon: '⚙️' },
        ]
    }
];

export default function ClientLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [userName, setUserName] = useState('');
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user && user !== 'undefined') {
            try {
                const userData = JSON.parse(user);
                setUserName(`${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`);

                // Check if user is admin (ONLY for strictly admin pages like dashboard)
                // If it's an authenticated route like /docs, just being logged in is enough
                if (!isPublicRoute(pathname) && !isAuthenticatedRoute(pathname) && pathname !== '/unauthorized' && pathname !== '/') {
                    const userEmail = userData.email;
                    if (!isAdminEmail(userEmail)) {
                        router.push('/unauthorized');
                        setIsAuthorized(false);
                        return;
                    }
                }
                setIsAuthorized(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                router.push('/login');
                setIsAuthorized(false);
            }
        } else if (!isPublicRoute(pathname) && pathname !== '/unauthorized' && pathname !== '/') {
            // No user logged in and trying to access admin page
            // Redirect to / (public landing page) or /login
            router.push('/login');
            setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const isUserPage = isAuthenticatedRoute(pathname);
    const isPublicPage = isPublicRoute(pathname) || pathname === '/unauthorized' || pathname === '/';

    if (isPublicPage || isUserPage) {
        return (
            <div className={styles.publicLayout}>
                {children}
            </div>
        );
    }

    if (isAuthorized === null) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</div>
                    <p>Vérification des autorisations...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>K</div>
                    <div className={styles.brandName}>
                        KomoraLink
                        <span className={styles.badge}>Admin</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((section) => (
                        <div key={section.section} className={styles.navSection}>
                            <div className={styles.navSectionTitle}>{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.adminUser}>
                        <div className={styles.adminAvatar}>{userName || 'A'}</div>
                        {!collapsed && (
                            <div className={styles.adminInfo}>
                                <span className={styles.adminName}>Admin</span>
                                <span className={styles.adminRole}>Superviseur</span>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.collapseBtn}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? '→' : '← Réduire'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        title="Déconnexion"
                    >
                        🚪 {collapsed ? '' : 'Déconnexion'}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            <div
                className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className={`${styles.main} ${collapsed ? styles.collapsed : ''}`}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.menuButton}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <h1 className={styles.pageTitle}>Dashboard de Supervision</h1>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
