'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import styles from './layout.module.css';
import { isAdminEmail, isPublicRoute } from '../lib/adminConfig';

// Navigation items for admin sidebar
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
    section: 'Public',
    items: [
      { href: '/docs', label: 'Documentation', icon: '📚' },
      { href: '/about', label: 'À Propos', icon: '🏛️' },
      { href: '/careers', label: 'Recrutement', icon: '💼' },
    ]
  },
  {
    section: 'Compte',
    items: [
      { href: '/profile', label: 'Mon Profil', icon: '⚙️' },
    ]
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(`${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`);

      // Check if user is admin (for non-public pages)
      if (!isPublicRoute(pathname) && pathname !== '/unauthorized' && pathname !== '/') {
        const userEmail = userData.email;
        if (!isAdminEmail(userEmail)) {
          router.push('/unauthorized');
          setIsAuthorized(false);
          return;
        }
      }
      setIsAuthorized(true);
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

  // Check if current page is public
  const isPublicPage = isPublicRoute(pathname) || pathname === '/unauthorized' || pathname === '/';

  // For public pages, render without admin layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Show loading while checking authorization
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

  // If not authorized, don't render (redirect is happening)
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
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className={styles.navIcon}>{collapsed ? '→' : '←'}</span>
            <span className={styles.navLabel}>Réduire</span>
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
          <div className={styles.headerRight}>
            <Link href="/alertes" className={styles.headerIcon}>🔔</Link>
            <Link href="/profile" className={styles.headerIcon}>⚙️</Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={styles.userAvatar}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {userName || 'AD'}
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: 'var(--color-gray-700)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      borderBottom: '1px solid var(--color-gray-100)'
                    }}
                  >
                    👤 Mon Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    🚪 Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </body>
    </html>
  );
}
