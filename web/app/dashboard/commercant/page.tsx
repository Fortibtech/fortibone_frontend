'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getAnalyticsOverview,
    getPendingOrdersCount,
    getProcessingPurchasesCount,
    getSales,
    getInventory,
    AnalyticsOverview,
    SalesResponse,
    InventoryResponse,
} from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PeriodType, PeriodDates } from '@/components/shared';
import {
    SalesByCategoryChart,
    ExpenseDistributionChart,
    RevenueDistributionChart,
} from '@/components/charts';
import styles from './page.module.css';

export default function CommercantDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);

    // Period filter state
    const [period, setPeriod] = useState<PeriodType>('all');

    // Analytics data from API
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [processingPurchases, setProcessingPurchases] = useState<{ count: number; totalItems: number } | null>(null);

    const [salesData, setSalesData] = useState<SalesResponse | null>(null);
    // const [inventory, setInventory] = useState<InventoryResponse | null>(null);
    const [chartsLoading, setChartsLoading] = useState(true);

    // Helper to get CURRENT MONTH dates (Mobile Logic)
    const getCurrentMonthDates = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
        return { startDate, endDate };
    };

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { startDate, endDate } = getCurrentMonthDates();

            const [analyticsData, pendingCount, processingData] = await Promise.all([
                getAnalyticsOverview(selectedBusiness.id, startDate, endDate).catch(() => null),
                getPendingOrdersCount(selectedBusiness.id, 'SALE').catch(() => 0),
                getProcessingPurchasesCount(selectedBusiness.id).catch(() => ({ count: 0, totalItems: 0 })),
            ]);

            if (analyticsData) {
                setAnalytics(analyticsData);
            }
            setPendingOrders(pendingCount);
            setProcessingPurchases(processingData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    // Fetch charts data
    const fetchChartsData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setChartsLoading(true);
            // On mobile we just get generic sales data, no specific date range for charts except if they have filters?
            // Mobile SalesBarChart uses SalesByProductCategory (from getSales?).
            // Let's call getSales with monthly overview dates or default.
            // Actually Mobile calls: getSales(id) inside AnalyticsCard component.
            const salesRes = await getSales(selectedBusiness.id).catch(() => null);
            setSalesData(salesRes);
        } catch (error) {
            console.error('Error fetching charts data:', error);
        } finally {
            setChartsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchChartsData();
    }, [fetchChartsData]);

    const formatNumber = (num: number | undefined): string => {
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
    };

    const currencySymbol = 'KMF';

    // Transform sales by category for expense chart
    const expenseCategories = salesData?.salesByProductCategory?.map(cat => ({
        category: cat.categoryName,
        amount: Number(cat.totalRevenue),
        percentage: 0,
    })) || [];

    // Transform data for Revenue Map (Flux de tresorerie)
    // IMPORTANT: Mobile uses CashFlowChart for 'Flux de trésorerie'. 
    // And RevenueDistributionChart for 'Répartition des Revenus' (Wait, name conflict).
    // In mobile analytics/index.tsx line 43: RevenueDistributionChart.
    // In web it's also RevenueDistributionChart.
    // We map salesByPeriod to the format expected by RevenueDistributionChart.
    const revenueData = salesData?.salesByPeriod?.map(item => ({
        period: item.period,
        revenue: item.totalAmount
    })) || [];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Vue d'Ensemble */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Vue d&apos;Ensemble</h2>
                        </div>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p>Chargement des statistiques...</p>
                            </div>
                        ) : (
                            <div className={styles.overviewGrid}>
                                {/* Carte CA Global */}
                                <div className={`${styles.overviewCard} ${styles.cardYellow} ${styles.cardLarge}`}>
                                    <div className={styles.cardIcon}>💰</div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.cardLabel}>
                                            CA Mensuel
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                            <span className={styles.cardValue}>
                                                {formatNumber(analytics?.totalSalesAmount)}
                                            </span>
                                            <span className={styles.cardUnit}>{currencySymbol}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite avec 2 petites cartes */}
                                <div className={styles.rightColumn}>
                                    <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                        <div className={styles.cardIcon}>🛒</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>En attente</span>
                                            <span className={styles.cardValue}>
                                                {pendingOrders} client{pendingOrders > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`${styles.overviewCard} ${styles.cardGreen}`}>
                                        <div className={styles.cardIcon}>💵</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Achats en cours</span>
                                            <span className={styles.cardValue}>
                                                {processingPurchases?.totalItems || 0} article
                                                {(processingPurchases?.totalItems || 0) > 1 ? 's' : ''} commandé
                                                {(processingPurchases?.totalItems || 0) > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Section Analytics */}
                    <section className={styles.section}>
                        <h2>Analytics</h2>
                        <div className={styles.analyticsGrid}>
                            <Link href="/dashboard/commercant/analytics?tab=ventes" className={styles.analyticsCard}>
                                <div className={styles.analyticsIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <span className={styles.analyticsLabel}>Ventes</span>
                                <span className={styles.analyticsArrow}>›</span>
                            </Link>
                            <Link href="/dashboard/commercant/analytics?tab=achats" className={styles.analyticsCard}>
                                <div className={styles.analyticsIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                </div>
                                <span className={styles.analyticsLabel}>Achats</span>
                                <span className={styles.analyticsArrow}>›</span>
                            </Link>
                            <Link href="/dashboard/commercant/analytics?tab=stock" className={styles.analyticsCard}>
                                <div className={styles.analyticsIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                </div>
                                <span className={styles.analyticsLabel}>Stock</span>
                                <span className={styles.analyticsArrow}>›</span>
                            </Link>
                        </div>
                    </section>

                    {/* Section Charts - STRICTLY ALIGNED WITH MOBILE */}
                    <section className={styles.section}>
                        <h2>Statistiques</h2>

                        {/* 1. SalesByCategory (Bar Chart) - Mobile "Revenus par catégorie" */}
                        <SalesByCategoryChart
                            data={salesData?.salesByProductCategory || []}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                        />

                        {/* 2. ExpenseDistribution (Donut) - Mobile "Répartition des dépenses" */}
                        <ExpenseDistributionChart
                            data={expenseCategories}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                            title="Répartition des dépenses"
                        />

                        {/* 3. RevenueDistribution (Area) - Mobile "Flux de trésorerie" */}
                        <RevenueDistributionChart
                            data={revenueData}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                        />
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
