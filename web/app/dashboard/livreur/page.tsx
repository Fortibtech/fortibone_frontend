'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getFilteredDashboard, updateDeliveryStatus, DashboardData } from '@/lib/api/delivery';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './accueil.module.css';

export default function LivreurDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Real API call - replacing demo data
            const data = await getFilteredDashboard(selectedBusiness.id);
            setDashboard(data);
            setIsOnline(data.isOnline);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            // Fallback to empty data on error
            setDashboard({
                isOnline: false,
                activeDeliveries: 0,
                pendingRequests: 0,
                totalDeliveries: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleOnlineStatus = async () => {
        if (!selectedBusiness || togglingStatus) return;

        try {
            setTogglingStatus(true);
            const newStatus = !isOnline;

            // Real API call to update status
            await updateDeliveryStatus(selectedBusiness.id, newStatus);
            setIsOnline(newStatus);

            // Refresh dashboard data
            fetchData();
        } catch (error) {
            console.error('Error toggling online status:', error);
        } finally {
            setTogglingStatus(false);
        }
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Toggle En ligne - Comme mobile */}
                    <div className={styles.onlineSection}>
                        <div className={styles.onlineCard}>
                            <div className={styles.onlineLeft}>
                                <div className={`${styles.onlineDot} ${isOnline ? styles.online : styles.offline}`} />
                                <span className={styles.onlineText}>
                                    {isOnline ? 'En ligne' : 'Hors ligne'}
                                </span>
                            </div>
                            <button
                                className={`${styles.toggleSwitch} ${isOnline ? styles.toggleOn : ''}`}
                                onClick={toggleOnlineStatus}
                                disabled={togglingStatus}
                            >
                                <div className={styles.toggleKnob} />
                            </button>
                        </div>
                    </div>

                    {/* Section Vue d'ensemble - Fidèle au Mobile Livreur */}
                    <section className={styles.section}>
                        <h2>Vue d&apos;ensemble</h2>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p>Chargement des statistiques...</p>
                            </div>
                        ) : (
                            <div className={styles.overviewGrid}>
                                {/* Carte Livraisons actives - Grande carte à gauche */}
                                <div className={`${styles.overviewCard} ${styles.cardYellow} ${styles.cardLarge}`}>
                                    <div className={styles.cardIcon}>🚴</div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.cardLabel}>Livraisons actives</span>
                                        <span className={styles.cardValue}>
                                            {dashboard?.activeDeliveries || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Colonne droite avec 2 petites cartes */}
                                <div className={styles.rightColumn}>
                                    {/* Demandes en attente */}
                                    <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                        <div className={styles.cardIcon}>⏰</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Demandes en attente</span>
                                            <span className={styles.cardValue}>
                                                {dashboard?.pendingRequests || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total livraisons */}
                                    <div className={`${styles.overviewCard} ${styles.cardGreen}`}>
                                        <div className={styles.cardIcon}>✅</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Total livraisons</span>
                                            <span className={styles.cardValue}>
                                                {formatNumber(dashboard?.totalDeliveries || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Section Accès rapide - Comme mobile */}
                    <section className={styles.section}>
                        <h2>Accès rapide</h2>
                        <div className={styles.quickGrid}>
                            <Link href="/dashboard/livreur/courses" className={styles.quickCard}>
                                <div className={`${styles.quickIcon} ${styles.quickBlue}`}>
                                    📋
                                </div>
                                <span className={styles.quickLabel}>Mes courses</span>
                            </Link>
                            <Link href="/dashboard/livreur/earnings" className={styles.quickCard}>
                                <div className={`${styles.quickIcon} ${styles.quickGreen}`}>
                                    💰
                                </div>
                                <span className={styles.quickLabel}>Revenus</span>
                            </Link>
                            <Link href="/dashboard/livreur/vehicles" className={styles.quickCard}>
                                <div className={`${styles.quickIcon} ${styles.quickOrange}`}>
                                    🛵
                                </div>
                                <span className={styles.quickLabel}>Véhicules</span>
                            </Link>
                            <Link href="/dashboard/livreur/settings" className={styles.quickCard}>
                                <div className={`${styles.quickIcon} ${styles.quickGray}`}>
                                    ⚙️
                                </div>
                                <span className={styles.quickLabel}>Paramètres</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
