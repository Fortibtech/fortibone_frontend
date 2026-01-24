'use client';

import { useState, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Heart, ShoppingBasket, ArrowLeftRight, Camera, LogOut, ChevronRight } from 'lucide-react';
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
            toast.success('Avatar mis à jour');
            window.location.reload();
        } catch (error: any) {
            console.error('Erreur upload avatar:', error);
            toast.error("Erreur lors de l'upload de l'avatar", {
                description: error.message || 'Veuillez réessayer',
            });
        }
    };

    // Menu items aligned with mobile (person-outline, heart-outline, basket-outline, swap-horizontal-outline)
    const menuItems: { title: string; href: string; icon: ReactNode }[] = [
        {
            title: 'Informations personnelles',
            href: '/dashboard/particulier/personal-info',
            icon: <User size={22} />
        },
        {
            title: 'Vos favoris',
            href: '/dashboard/particulier/favorites',
            icon: <Heart size={22} />
        },
        {
            title: 'Vos Commandes en cours',
            href: '/dashboard/particulier/orders',
            icon: <ShoppingBasket size={22} />
        },
        {
            title: 'Mes Transactions',
            href: '/dashboard/particulier/finance/wallet/transactions',
            icon: <ArrowLeftRight size={22} />
        },
    ];

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            logout();
            // Force full reload to verify clean state and avoid ProtectedRoute race conditions
            window.location.href = '/auth/login';
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
                            <ChevronRight size={20} color="#ccc" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    <LogOut size={20} color="#FF5722" />
                    <span>{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
                </button>
            </div>
        </DashboardLayout>
    );
}
