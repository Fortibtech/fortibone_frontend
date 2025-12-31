'use client';

import { useUserStore } from '@/stores/userStore';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
    onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
    const { userProfile } = useUserStore();

    return (
        <header className={styles.header}>
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
                <button className={styles.iconBtn} aria-label="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className={styles.badge}>3</span>
                </button>

                {/* Search (desktop only) */}
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
            </div>
        </header>
    );
}
