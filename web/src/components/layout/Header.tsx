'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
    onMenuClick?: () => void;
    /** Header style variant: 'primary' (green/teal) or 'standard' (white) */
    variant?: 'primary' | 'standard';
    /** Show search bar in header */
    showSearch?: boolean;
    /** Show cart button with badge */
    showCart?: boolean;
    /** Cart items count for badge */
    cartCount?: number;
}

// Icons for menu items
const menuIcons = {
    store: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    orders: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    cart: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    premium: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    profile: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    logout: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

import { getPendingOrdersCount } from '@/lib/api';

// ...

export default function Header({
    title,
    onMenuClick,
    variant = 'standard',
    showSearch = false,
    showCart = false,
    cartCount = 0,
}: HeaderProps) {
    const router = useRouter();
    const { userProfile, logout } = useUserStore();
    const { selectedBusiness } = useBusinessStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Notification state
    const [notificationCount, setNotificationCount] = useState(0);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for global shortcuts
    useEffect(() => {
        const handleFocusSearch = () => {
            const searchInput = document.querySelector('input[type="text"][placeholder="Rechercher..."]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
            }
        };

        window.addEventListener('focus-search', handleFocusSearch);
        return () => window.removeEventListener('focus-search', handleFocusSearch);
    }, []);

    // Fetch notifications (Pending Orders for Business)
    useEffect(() => {
        const fetchNotifications = async () => {
            if (selectedBusiness?.id) {
                try {
                    // Fetch pending sales orders
                    const count = await getPendingOrdersCount(selectedBusiness.id, 'SALE');
                    setNotificationCount(count);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            } else {
                setNotificationCount(0);
            }
        };

        fetchNotifications();

        // Optional: Poll every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [selectedBusiness?.id]);


    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        router.push('/auth/login');
    };

    const navigateTo = (path: string) => {
        setShowDropdown(false);
        router.push(path);
    };

    const dashboardType = selectedBusiness?.type?.toLowerCase() || 'commercant';
    const isPro = userProfile?.profileType === 'PRO';

    // Build header class based on variant
    const headerClass = variant === 'primary'
        ? `${styles.header} ${styles.headerPrimary}`
        : styles.header;

    return (
        <header className={headerClass}>
            {/* Mobile menu button */}
            <button
                className={styles.menuBtn}
                onClick={onMenuClick}
                aria-label="Toggle menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Title */}
            <div className={styles.titleSection}>
                {title && <h1 className={styles.title}>{title}</h1>}
                {!title && userProfile && (
                    <div className={styles.greeting}>
                        <span className={styles.hello}>Bonjour,</span>
                        <span className={styles.name}>{userProfile.firstName} 👋</span>
                    </div>
                )}
            </div>

            {/* Right section */}
            <div className={styles.actions}>
                {/* Notifications */}
                {/* Notifications */}
                <button className={styles.iconBtn} aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {notificationCount > 0 && (
                        <span className={styles.badge}>{notificationCount}</span>
                    )}
                </button>

                {/* Search (desktop only) - Visible only for PARTICULIER or if no business selected */}
                {!selectedBusiness && (
                    <div className={styles.searchContainer}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className={styles.searchInput}
                        />
                    </div>
                )}

                {/* Avatar / Profile Dropdown - Aligned with Mobile App */}
                {userProfile && (
                    <div className={styles.avatarWrapper} ref={dropdownRef}>
                        <button
                            className={styles.avatarBtn}
                            onClick={() => setShowDropdown(!showDropdown)}
                            aria-label="Menu utilisateur"
                        >
                            {userProfile.profileImageUrl ? (
                                <img src={userProfile.profileImageUrl} alt={userProfile.firstName} className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {userProfile.firstName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu - Matches Mobile */}
                        {showDropdown && (
                            <div className={styles.dropdown}>
                                {/* User Info Header */}
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.dropdownAvatar}>
                                        {userProfile.profileImageUrl ? (
                                            <img src={userProfile.profileImageUrl} alt={userProfile.firstName} />
                                        ) : (
                                            <span>{userProfile.firstName?.charAt(0).toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <div className={styles.dropdownUserInfo}>
                                        <span className={styles.dropdownUserName}>
                                            {userProfile.firstName} {userProfile.lastName}
                                        </span>
                                        <button
                                            className={styles.viewProfileLink}
                                            onClick={() => navigateTo(`/dashboard/${dashboardType}/settings`)}
                                        >
                                            Voir le profil
                                        </button>
                                    </div>
                                </div>

                                {/* Premium Banner - Only for PRO */}
                                {isPro && (
                                    <button
                                        className={styles.premiumBanner}
                                        onClick={() => navigateTo('/premium')}
                                    >
                                        <div className={styles.premiumContent}>
                                            <span className={styles.premiumTitle}>Passer à Premium</span>
                                            <span className={styles.premiumSubtitle}>Débloquez des fonctionnalités avancées</span>
                                        </div>
                                        <span className={styles.premiumBtn}>Souscrire</span>
                                    </button>
                                )}

                                {/* Menu Items - Aligned with Mobile */}
                                <div className={styles.dropdownMenu}>
                                    {isPro && (
                                        <>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo(`/dashboard/${dashboardType}/settings`)}
                                            >
                                                {menuIcons.store}
                                                <span>Mon Commerce</span>
                                            </button>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo(`/dashboard/${dashboardType}/ventes`)}
                                            >
                                                {menuIcons.orders}
                                                <span>Mes ventes</span>
                                            </button>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo(`/dashboard/${dashboardType}/achats/orders`)}
                                            >
                                                {menuIcons.orders}
                                                <span>Mes achats fournisseurs</span>
                                            </button>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo(`/dashboard/${dashboardType}/achats`)}
                                            >
                                                {menuIcons.cart}
                                                <span>Mon panier</span>
                                            </button>
                                        </>
                                    )}
                                    {!isPro && (
                                        <>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo('/dashboard/particulier/orders')}
                                            >
                                                {menuIcons.orders}
                                                <span>Mes commandes</span>
                                            </button>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo('/dashboard/particulier/cart')}
                                            >
                                                {menuIcons.cart}
                                                <span>Mon panier</span>
                                            </button>
                                            <button
                                                className={styles.dropdownItem}
                                                onClick={() => navigateTo('/dashboard/particulier/profile')}
                                            >
                                                {menuIcons.profile}
                                                <span>Mon profil</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Logout Button */}
                                <div className={styles.dropdownFooter}>
                                    <button
                                        className={styles.logoutBtn}
                                        onClick={handleLogout}
                                    >
                                        {menuIcons.logout}
                                        <span>Se Déconnecter</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
