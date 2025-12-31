'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getAnalyticsOverview, getPendingOrdersCount, getProcessingPurchasesCount, getSales, AnalyticsOverview, SalesResponse } from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PeriodFilter, getPeriodDates, getPeriodLabel, PeriodType, PeriodDates } from '@/components/shared';
import { SalesByPeriodChart, ExpenseDistributionChart, RevenueDistributionChart, InventoryLossesChart } from '@/components/charts';
import styles from './accueil.module.css';

export default function CommercantDashboard() {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Period filter state
    const [period, setPeriod] = useState<PeriodType>('all');
    const [periodDates, setPeriodDates] = useState<PeriodDates>({ startDate: '', endDate: '' });

    // Analytics data from API
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [processingPurchases, setProcessingPurchases] = useState({ count: 0, totalItems: 0 });
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch data with period dates
            const [analyticsData, pendingCount, purchasesData, salesResult] = await Promise.all([
                getAnalyticsOverview(
                    selectedBusiness.id,
                    periodDates.startDate || undefined,
                    periodDates.endDate || undefined
                ).catch((err) => {
                    console.error('Analytics error:', err);
                    return null;
                }),
                getPendingOrdersCount(selectedBusiness.id, 'SALE').catch(() => 0),
                getProcessingPurchasesCount(selectedBusiness.id).catch(() => ({ count: 0, totalItems: 0 })),
                getSales(selectedBusiness.id).catch(() => null),
            ]);

            if (analyticsData) {
                setAnalytics(analyticsData);
            } else {
                // Use default values if API fails
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
            setProcessingPurchases(purchasesData);
            setSalesData(salesResult);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError('Impossible de charger les statistiques. Vérifiez votre connexion.');
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
            <DashboardLayout businessType="COMMERCANT" title="Accueil">
                <div className={styles.dashboard}>
                    {/* Section Vue d'Ensemble - Fidèle au Mobile */}
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
                                {/* Carte CA Global - Grande carte à gauche */}
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
                                    {/* Commandes en attente */}
                                    <div className={`${styles.overviewCard} ${styles.cardPurple}`}>
                                        <div className={styles.cardIcon}>🛒</div>
                                        <div className={styles.cardContent}>
                                            <span className={styles.cardLabel}>Commandes en attente</span>
                                            <span className={styles.cardValue}>
                                                {pendingOrders} client{pendingOrders > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Articles vendus */}
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

                    {/* Section Analytics - Comme le mobile */}
                    <section className={styles.section}>
                        <h2>Analytics</h2>
                        <div className={styles.analyticsGrid}>
                            <Link href="/dashboard/commercant/analytics-ventes" className={styles.analyticsCard}>
                                <div className={styles.analyticsIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <span className={styles.analyticsLabel}>Ventes</span>
                                <span className={styles.analyticsArrow}>›</span>
                            </Link>
                            <Link href="/dashboard/commercant/analytics-purchases" className={styles.analyticsCard}>
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
                            <Link href="/dashboard/commercant/stock-tracking" className={styles.analyticsCard}>
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

                    {/* Lien Tarifs Livreurs - Comme le mobile */}
                    <Link href="/dashboard/commercant/carriers" className={styles.carriersLink}>
                        <span className={styles.carrierIcon}>👤</span>
                        <span className={styles.carrierText}>Tarifs des livreurs</span>
                        <span className={styles.carrierArrow}>›</span>
                    </Link>

                    {/* Section Statistiques avec Charts - Comme le mobile AnalyticsCard */}
                    <section className={styles.section}>
                        <h2>Statistiques</h2>
                        <SalesByPeriodChart
                            data={salesData?.salesByPeriod?.map(item => ({
                                period: item.period,
                                totalAmount: item.totalAmount,
                                totalItems: item.totalItems,
                            })) || []}
                            loading={loading}
                            currencySymbol={currencySymbol}
                        />
                        <ExpenseDistributionChart
                            data={salesData?.salesByProductCategory?.map(item => ({
                                category: item.categoryName,
                                amount: item.totalRevenue,
                            })) || []}
                            loading={loading}
                            currencySymbol={currencySymbol}
                            title="Répartition par catégorie"
                        />
                        <RevenueDistributionChart
                            data={salesData?.salesByPeriod?.map(item => ({
                                period: item.period,
                                revenue: item.totalAmount,
                            })) || []}
                            loading={loading}
                            currencySymbol={currencySymbol}
                        />
                        <InventoryLossesChart
                            data={[]}
                            loading={loading}
                            currencySymbol={currencySymbol}
                        />
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
