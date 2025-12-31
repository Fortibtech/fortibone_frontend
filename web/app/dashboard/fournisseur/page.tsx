'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getAnalyticsOverview,
    getPendingOrdersCount,
    getInventory,
    getOrders,
    AnalyticsOverview,
    InventoryResponse,
    Order,
} from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PeriodFilter, getPeriodDates, getPeriodLabel, PeriodType, PeriodDates, AlertsCard, RecentOrdersCard } from '@/components/shared';
import styles from './accueil.module.css';

export default function FournisseurDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);

    // Period filter state
    const [period, setPeriod] = useState<PeriodType>('all');
    const [periodDates, setPeriodDates] = useState<PeriodDates>({ startDate: '', endDate: '' });

    // Analytics data from API
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [inventory, setInventory] = useState<InventoryResponse | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const [analyticsData, pendingCount, inventoryData, ordersData] = await Promise.all([
                getAnalyticsOverview(
                    selectedBusiness.id,
                    periodDates.startDate || undefined,
                    periodDates.endDate || undefined
                ),
                getPendingOrdersCount(selectedBusiness.id, 'SALE'),
                getInventory(selectedBusiness.id),
                getOrders(selectedBusiness.id, { limit: 5, type: 'SALE' }),
            ]);

            setAnalytics(analyticsData);
            setPendingOrders(pendingCount);
            setInventory(inventoryData);
            setRecentOrders(ordersData.data || []);
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
    const lowStockCount = inventory?.productsLowStock?.length || 0;

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Résumé Rapide - Fidèle au Mobile Fournisseur */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Résumé Rapide</h2>
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
                                {/* 3 cartes en ligne comme sur mobile Fournisseur */}
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryCard}>
                                        <span className={styles.summaryValue} style={{ color: '#FBBF24' }}>
                                            {formatNumber(analytics?.totalSalesAmount)}
                                        </span>
                                        <span className={styles.summaryLabel}>CA {getPeriodLabel(period)}</span>
                                    </div>
                                    <div className={styles.summaryCard}>
                                        <span className={styles.summaryValue} style={{ color: '#8B5CF6' }}>
                                            {pendingOrders}
                                        </span>
                                        <span className={styles.summaryLabel}>Commandes en attente</span>
                                    </div>
                                    <div className={styles.summaryCard}>
                                        <span className={styles.summaryValue} style={{ color: '#EC4899' }}>
                                            {lowStockCount}
                                        </span>
                                        <span className={styles.summaryLabel}>Stocks faibles</span>
                                    </div>
                                </div>

                                {/* Priority Alerts Section - NEW (matching mobile) */}
                                {inventory && (
                                    <AlertsCard
                                        expiringProducts={inventory.expiringProducts}
                                        lowStockProducts={inventory.productsLowStock}
                                        inventoryLink="/dashboard/fournisseur/products"
                                    />
                                )}

                                {/* Analytics Avancées */}
                                <Link href="/dashboard/fournisseur/analytics" className={styles.analyticsButton}>
                                    <span className={styles.analyticsIcon}>📊</span>
                                    <span className={styles.analyticsText}>Analytics Avancées</span>
                                    <span className={styles.analyticsArrow}>›</span>
                                </Link>

                                {/* Tarifs des livreurs */}
                                <Link href="/dashboard/fournisseur/carriers" className={styles.analyticsButton}>
                                    <span className={styles.analyticsIcon}>👤</span>
                                    <span className={styles.analyticsText}>Voir les tarifs des livreurs</span>
                                    <span className={styles.analyticsArrow}>›</span>
                                </Link>
                            </>
                        )}
                    </section>

                    {/* Recent Orders Section - NEW (matching mobile) */}
                    {!loading && (
                        <RecentOrdersCard
                            orders={recentOrders}
                            loading={loading}
                            title="Commandes récentes"
                            viewAllLink="/dashboard/fournisseur/orders"
                            currencySymbol={currencySymbol}
                        />
                    )}

                    {/* Section Statistiques - Comme mobile */}
                    <section className={styles.section}>
                        <h2>Statistiques</h2>
                        <div className={styles.statsGrid}>
                            <Link href="/dashboard/fournisseur/analytics-ventes" className={styles.statsCard}>
                                <div className={styles.statsIconWrapper}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <div className={styles.statsInfo}>
                                    <span className={styles.statsLabel}>Ventes</span>
                                    <span className={styles.statsArrow}>›</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/fournisseur/analytics-purchases" className={styles.statsCard}>
                                <div className={styles.statsIconWrapper}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                </div>
                                <div className={styles.statsInfo}>
                                    <span className={styles.statsLabel}>Achats</span>
                                    <span className={styles.statsArrow}>›</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/fournisseur/stock-tracking" className={styles.statsCard}>
                                <div className={styles.statsIconWrapper}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                </div>
                                <div className={styles.statsInfo}>
                                    <span className={styles.statsLabel}>Stock</span>
                                    <span className={styles.statsArrow}>›</span>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
