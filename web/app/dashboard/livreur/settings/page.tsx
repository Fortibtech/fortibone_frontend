'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';
import Link from 'next/link';
import styles from './settings.module.css';

export default function LivreurSettings() {
    const { userProfile, logout } = useUserStore();
    const { selectedBusiness } = useBusinessStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/auth/login';
    };

    const settingsMenu = [
        { label: 'Mon profil', href: '/dashboard/livreur/settings/profile', icon: '👤' },
        { label: "Infos de l'entreprise", href: '/dashboard/livreur/settings/business', icon: '🏢' },
        { label: 'Changer le mot de passe', href: '/dashboard/livreur/settings/password', icon: '🔐' },
        { label: 'Notifications', href: '/dashboard/livreur/settings/notifications', icon: '🔔' },
    ];

    const legalMenu = [
        { label: 'Politique de confidentialité', href: '/dashboard/livreur/settings/privacy', icon: '🔒' },
        { label: "Conditions d'utilisation", href: '/dashboard/livreur/settings/terms', icon: '📜' },
        { label: 'FAQ', href: '/dashboard/livreur/settings/faq', icon: '❓' },
        { label: 'À propos', href: '/dashboard/livreur/settings/about', icon: 'ℹ️' },
    ];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Paramètres">
                <div className={styles.container}>
                    {/* User Info Section */}
                    <section className={styles.userSection}>
                        <div className={styles.avatar}>
                            {userProfile?.profileImageUrl ? (
                                <img src={userProfile.profileImageUrl} alt="Avatar" className={styles.avatarImage} />
                            ) : (
                                <span className={styles.avatarInitial}>
                                    {userProfile?.firstName?.[0] || 'U'}
                                </span>
                            )}
                        </div>
                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>
                                {userProfile?.firstName} {userProfile?.lastName}
                            </h2>
                            <p className={styles.userEmail}>{userProfile?.email}</p>
                            {selectedBusiness && (
                                <p className={styles.businessName}>{selectedBusiness.name}</p>
                            )}
                        </div>
                    </section>

                    {/* Settings Menu */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Compte</h3>
                        <div className={styles.menuList}>
                            {settingsMenu.map((item) => (
                                <Link key={item.href} href={item.href} className={styles.menuItem}>
                                    <span className={styles.menuIcon}>{item.icon}</span>
                                    <span className={styles.menuLabel}>{item.label}</span>
                                    <span className={styles.menuArrow}>›</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Legal Menu */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Informations légales</h3>
                        <div className={styles.menuList}>
                            {legalMenu.map((item) => (
                                <Link key={item.href} href={item.href} className={styles.menuItem}>
                                    <span className={styles.menuIcon}>{item.icon}</span>
                                    <span className={styles.menuLabel}>{item.label}</span>
                                    <span className={styles.menuArrow}>›</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Logout Button */}
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <span className={styles.logoutIcon}>🚪</span>
                        Se déconnecter
                    </button>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
