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
import { PeriodFilter, getPeriodLabel, PeriodType, PeriodDates } from '@/components/shared';
import {
    Sales30DaysChart,
    TopProductsChart,
    SalesByPeriodChart,
    ExpenseDistributionChart,
    InventoryLossesChart,
} from '@/components/charts';
import styles from './accueil.module.css';

export default function CommercantDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);

    // Period filter state
    const [period, setPeriod] = useState<PeriodType>('all');
    const [periodDates, setPeriodDates] = useState<PeriodDates>({ startDate: '', endDate: '' });

    // Analytics data from API
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);
    const [sales30Days, setSales30Days] = useState<SalesResponse | null>(null);
    const [inventory, setInventory] = useState<InventoryResponse | null>(null);
    const [salesUnit, setSalesUnit] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [chartsLoading, setChartsLoading] = useState(true);

    // Helper to get last 30 days date range
    const getLast30DaysDates = () => {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        const startDate = start.toISOString().split('T')[0];
        return { startDate, endDate };
    };

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const [analyticsData, pendingCount] = await Promise.all([
                getAnalyticsOverview(
                    selectedBusiness.id,
                    periodDates.startDate || undefined,
                    periodDates.endDate || undefined
                ).catch(() => null),
                getPendingOrdersCount(selectedBusiness.id, 'SALE').catch(() => 0),
            ]);

            if (analyticsData) {
                setAnalytics(analyticsData);
            } else {
                setAnalytics({
                    totalSalesAmount: 0,
                    totalSalesOrders: 0,
                    averageOrderValue: 0,
                    totalProductsSold: 0,
                    totalPurchaseAmount: 0,
                    totalPurchaseOrders: 0,
                    currentInventoryValue: 0,
                    totalMembers: 0,
                    uniqueCustomers: 0,
                    averageBusinessRating: 0,
                    totalBusinessReviews: 0,
                });
            }
            setPendingOrders(pendingCount);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness, periodDates]);

    // Fetch charts data
    const fetchChartsData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setChartsLoading(true);
            const { startDate, endDate } = getLast30DaysDates();

            const [sales30, salesPeriod, inventoryData] = await Promise.all([
                getSales(selectedBusiness.id, { startDate, endDate, unit: 'DAY' }).catch(() => null),
                getSales(selectedBusiness.id, { unit: salesUnit }).catch(() => null),
                getInventory(selectedBusiness.id).catch(() => null),
            ]);

            setSales30Days(sales30);
            setSalesData(salesPeriod);
            setInventory(inventoryData);
        } catch (error) {
            console.error('Error fetching charts data:', error);
        } finally {
            setChartsLoading(false);
        }
    }, [selectedBusiness, salesUnit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchChartsData();
    }, [fetchChartsData]);

    const handlePeriodChange = (newPeriod: PeriodType, dates: PeriodDates) => {
        setPeriod(newPeriod);
        setPeriodDates(dates);
    };

    const handleSalesUnitChange = (unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR') => {
        setSalesUnit(unit);
    };

    const formatNumber = (num: number | undefined): string => {
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
    };

    const currencySymbol = 'KMF';

    // Transform inventory losses for chart
    const inventoryLosses = inventory?.lossesByMovementType?.map(item => ({
        movementType: item.movementType,
        totalQuantity: item.totalQuantity,
        totalValue: parseFloat(String(item.totalValue).replace(',', '')) || 0,
    })) || [];

    // Transform sales by category for expense chart
    const expenseCategories = salesData?.salesByProductCategory?.map(cat => ({
        category: cat.categoryName,
        amount: cat.totalRevenue,
        percentage: 0,
    })) || [];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Vue d'Ensemble */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Vue d&apos;Ensemble</h2>
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
                            <div className={styles.overviewGrid}>
                                {/* Carte CA Global */}
                                <div className={`${styles.overviewCard} ${styles.cardYellow} ${styles.cardLarge}`}>
                                    <div className={styles.cardIcon}>💰</div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.cardLabel}>
                                            CA {getPeriodLabel(period)}
                                        </span>
                                        <span className={styles.cardValue}>
                                            {formatNumber(analytics?.totalSalesAmount)} <span className={styles.cardUnit}>{currencySymbol}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Colonne droite avec 2 petites cartes */}
                                <div className={styles.rightColumn}>
                                    <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                        <div className={styles.cardIcon}>🛒</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Commandes en attente</span>
                                            <span className={styles.cardValue}>
                                                {pendingOrders} client{pendingOrders > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`${styles.overviewCard} ${styles.cardGreen}`}>
                                        <div className={styles.cardIcon}>💵</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Articles vendus</span>
                                            <span className={styles.cardValue}>
                                                {formatNumber(analytics?.totalProductsSold)} article{(analytics?.totalProductsSold || 0) > 1 ? 's' : ''}
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
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <span className={styles.analyticsLabel}>Ventes</span>
                                <span className={styles.analyticsArrow}>›</span>
                            </Link>
                            <Link href="/dashboard/commercant/analytics?tab=achats" className={styles.analyticsCard}>
                                <div className={styles.analyticsIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                    {/* Lien Tarifs Livreurs */}
                    <Link href="/dashboard/commercant/carriers" className={styles.carriersLink}>
                        <span className={styles.carrierIcon}>👤</span>
                        <span className={styles.carrierText}>Tarifs des livreurs</span>
                        <span className={styles.carrierArrow}>›</span>
                    </Link>

                    {/* Section Charts - Comme le mobile */}
                    <section className={styles.section}>
                        <h2>Statistiques</h2>

                        {/* CA 30 jours - Bar Chart */}
                        <Sales30DaysChart
                            data={sales30Days?.salesByPeriod || []}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                        />

                        {/* Top Produits - Donut */}
                        <TopProductsChart
                            data={salesData?.topSellingProducts || []}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                            title="Top 5 Produits"
                        />

                        {/* Évolution Ventes - Line Chart */}
                        <SalesByPeriodChart
                            data={salesData?.salesByPeriod || []}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                            onUnitChange={handleSalesUnitChange}
                        />

                        {/* Répartition par catégorie */}
                        <ExpenseDistributionChart
                            data={expenseCategories}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                            title="Répartition par catégorie"
                        />

                        {/* Pertes d'inventaire */}
                        <InventoryLossesChart
                            data={inventoryLosses}
                            loading={chartsLoading}
                            currencySymbol={currencySymbol}
                        />
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
