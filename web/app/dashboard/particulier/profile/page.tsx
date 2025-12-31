'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useUserStore } from '@/stores/userStore';
import { uploadUserAvatar } from '@/lib/api/users';
import styles from './profile.module.css';

export default function ProfilePage() {
    const router = useRouter();
    const { userProfile, logout } = useUserStore();
    const [loggingOut, setLoggingOut] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadUserAvatar(file);
            // Reload to update avatar (simple & effective for now)
            window.location.reload();
        } catch (error: any) {
            console.error('Erreur upload avatar:', error);
            alert(error.message || "Erreur lors de l'upload de l'avatar");
        }
    };

    const menuItems = [
        {
            title: 'Informations personnelles',
            href: '/dashboard/particulier/personal-info',
            icon: '👤'
        },
        {
            title: 'Vos favoris',
            href: '/dashboard/particulier/favorites',
            icon: '❤️'
        },
        {
            title: 'Vos Commandes en cours',
            href: '/dashboard/particulier/orders',
            icon: '🛒'
        },
        {
            title: 'Mes Transactions',
            href: '/dashboard/particulier/finance/transactions',
            icon: '💳'
        },
    ];

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Profil</h1>
                </div>

                {/* User Section */}
                <div className={styles.userSection}>
                    <div className={styles.avatarWrapper}>
                        {userProfile?.profileImageUrl ? (
                            <img
                                src={userProfile.profileImageUrl}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        )}
                        <button className={styles.editAvatarBtn} onClick={handleAvatarClick}>
                            📷
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>
                    <h2 className={styles.userName}>
                        {userProfile?.firstName || 'Utilisateur'}
                    </h2>
                    <p className={styles.userEmail}>
                        {userProfile?.email || 'user@example.com'}
                    </p>
                </div>

                {/* Menu Items */}
                <div className={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={styles.menuItem}
                        >
                            <div className={styles.menuItemLeft}>
                                <span className={styles.menuIcon}>{item.icon}</span>
                                <span className={styles.menuText}>{item.title}</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
                </button>
            </div>
        </DashboardLayout>
    );
}
