'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getAnalyticsOverview,
    getOrders,
    getRestaurantAnalytics,
    AnalyticsOverview,
    Order,
} from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PeriodFilter, getPeriodLabel, PeriodType, PeriodDates, RecentOrdersCard } from '@/components/shared';
import styles from './accueil.module.css';

export default function RestaurateurDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);

    // Period filter state
    const [period, setPeriod] = useState<PeriodType>('all');
    const [periodDates, setPeriodDates] = useState<PeriodDates>({ startDate: '', endDate: '' });

    // Analytics data from API
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [preparingOrders, setPreparingOrders] = useState(0);
    const [readyOrders, setReadyOrders] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const [analyticsData, ordersData] = await Promise.all([
                getAnalyticsOverview(
                    selectedBusiness.id,
                    periodDates.startDate || undefined,
                    periodDates.endDate || undefined
                ),
                getOrders(selectedBusiness.id, { limit: 50 }),
            ]);

            setAnalytics(analyticsData);

            // Calculate order counts by status
            const orders = ordersData.data || [];
            setPendingOrders(orders.filter((o: Order) => o.status === 'PENDING' || o.status === 'PENDING_PAYMENT').length);
            setPreparingOrders(orders.filter((o: Order) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length);
            setReadyOrders(orders.filter((o: Order) => o.status === 'SHIPPED' || o.status === 'DELIVERED').length);
            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness, periodDates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePeriodChange = (newPeriod: PeriodType, dates: PeriodDates) => {
        setPeriod(newPeriod);
        setPeriodDates(dates);
    };

    const formatNumber = (num: number | undefined): string => {
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
    };

    const currencySymbol = 'KMF';

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Vue d'ensemble - Fidèle au Mobile Restaurateur */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Vue d&apos;ensemble</h2>
                            <PeriodFilter
                                value={period}
                                onChange={handlePeriodChange}
                            />
                        </div>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p>Chargement des statistiques...</p>
                            </div>
                        ) : (
                            <>
                                {/* Grille principale comme mobile */}
                                <div className={styles.overviewGrid}>
                                    {/* Carte CA Global - Grande carte à gauche */}
                                    <div className={`${styles.overviewCard} ${styles.cardYellow} ${styles.cardLarge}`}>
                                        <div className={styles.cardIcon}>💰</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>CA {getPeriodLabel(period)}</span>
                                            <span className={styles.cardValue}>
                                                {formatNumber(analytics?.totalSalesAmount)} <span className={styles.cardUnit}>{currencySymbol}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Colonne droite avec 2 petites cartes */}
                                    <div className={styles.rightColumn}>
                                        {/* En attente */}
                                        <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                            <div className={styles.cardIcon}>🛒</div>
                                            <div className={styles.cardContent}>
                                                <span className={styles.cardLabel}>En attente</span>
                                                <span className={styles.cardValue}>{pendingOrders}</span>
                                            </div>
                                        </div>

                                        {/* En préparation */}
                                        <div className={`${styles.overviewCard} ${styles.cardOrange}`}>
                                            <div className={styles.cardIcon}>🍳</div>
                                            <div className={styles.cardContent}>
                                                <span className={styles.cardLabel}>En préparation</span>
                                                <span className={styles.cardValue}>{preparingOrders}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Carte Prêtes à servir - Pleine largeur */}
                                <div className={`${styles.overviewCard} ${styles.cardGreen} ${styles.cardFullWidth}`}>
                                    <div className={styles.cardIcon}>🍽️</div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.cardLabel}>Prêtes à servir</span>
                                        <span className={styles.cardValue}>
                                            {readyOrders} commande{readyOrders > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Actions - NEW (matching mobile) */}
                                <div className={styles.quickActionsGrid}>
                                    <Link href="/dashboard/restaurateur/menus" className={styles.quickAction}>
                                        <span className={styles.quickActionIcon}>📋</span>
                                        <span className={styles.quickActionLabel}>Menus</span>
                                    </Link>
                                    <Link href="/dashboard/restaurateur/tables" className={styles.quickAction}>
                                        <span className={styles.quickActionIcon}>🪑</span>
                                        <span className={styles.quickActionLabel}>Tables</span>
                                    </Link>
                                    <Link href="/dashboard/restaurateur/orders" className={styles.quickAction}>
                                        <span className={styles.quickActionIcon}>📦</span>
                                        <span className={styles.quickActionLabel}>Commandes</span>
                                    </Link>
                                    <Link href="/dashboard/restaurateur/analytics" className={styles.quickAction}>
                                        <span className={styles.quickActionIcon}>📊</span>
                                        <span className={styles.quickActionLabel}>Analytics</span>
                                    </Link>
                                </div>

                                {/* Voir les commandes en cours */}
                                <Link href="/dashboard/restaurateur/orders" className={styles.ordersButton}>
                                    <span className={styles.ordersIcon}>📋</span>
                                    <span className={styles.ordersText}>Voir les commandes en cours</span>
                                    <span className={styles.ordersArrow}>›</span>
                                </Link>
                            </>
                        )}
                    </section>

                    {/* Recent Orders - NEW */}
                    {!loading && (
                        <RecentOrdersCard
                            orders={recentOrders}
                            loading={loading}
                            title="Commandes récentes"
                            viewAllLink="/dashboard/restaurateur/orders"
                            currencySymbol={currencySymbol}
                        />
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
