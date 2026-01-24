'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getAnalyticsOverview,
    getOrders,
    getSales,
    getInventory,
    AnalyticsOverview,
    Order,
    SalesResponse,
    InventoryResponse,
} from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PeriodFilter, getPeriodLabel, PeriodType, PeriodDates, RecentOrdersCard } from '@/components/shared';
import {
    Sales30DaysChart,
    TopProductsChart,
    SalesByPeriodChart,
    ExpenseDistributionChart,
    InventoryLossesChart,
} from '@/components/charts';
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

    // Charts data
    const [sales30Days, setSales30Days] = useState<SalesResponse | null>(null);
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);
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
            <DashboardLayout businessType="RESTAURATEUR" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Vue d'ensemble */}
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
                                    {/* Carte CA Global */}
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
                                        <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                            <div className={styles.cardIcon}>🛒</div>
                                            <div className={styles.cardContent}>
                                                <span className={styles.cardLabel}>En attente</span>
                                                <span className={styles.cardValue}>{pendingOrders}</span>
                                            </div>
                                        </div>

                                        <div className={`${styles.overviewCard} ${styles.cardOrange}`}>
                                            <div className={styles.cardIcon}>🍳</div>
                                            <div className={styles.cardContent}>
                                                <span className={styles.cardLabel}>En préparation</span>
                                                <span className={styles.cardValue}>{preparingOrders}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Carte Prêtes à servir */}
                                <div className={`${styles.overviewCard} ${styles.cardGreen} ${styles.cardFullWidth}`}>
                                    <div className={styles.cardIcon}>🍽️</div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.cardLabel}>Prêtes à servir</span>
                                        <span className={styles.cardValue}>
                                            {readyOrders} commande{readyOrders > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Actions */}
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
                                    <Link href="/dashboard/restaurateur/achats" className={styles.quickAction}>
                                        <span className={styles.quickActionIcon}>🛒</span>
                                        <span className={styles.quickActionLabel}>Achats</span>
                                    </Link>
                                </div>

                                {/* Voir les commandes en cours */}
                                <Link href="/dashboard/restaurateur/orders" className={styles.ordersButton}>
                                    <span className={styles.ordersIcon}>📋</span>
                                    <span className={styles.ordersText}>Voir les commandes en cours</span>
                                    <span className={styles.ordersArrow}>›</span>
                                </Link>

                                {/* Tarifs livreurs */}
                                <Link href="/dashboard/restaurateur/carriers" className={styles.carriersLink}>
                                    <span className={styles.carrierIcon}>🚚</span>
                                    <span className={styles.carrierText}>Tarifs des livreurs</span>
                                    <span className={styles.carrierArrow}>›</span>
                                </Link>
                            </>
                        )}
                    </section>

                    {/* Recent Orders */}
                    {!loading && (
                        <RecentOrdersCard
                            orders={recentOrders}
                            loading={loading}
                            title="Commandes récentes"
                            viewAllLink="/dashboard/restaurateur/orders"
                            currencySymbol={currencySymbol}
                        />
                    )}

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
                            title="Plats populaires"
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
