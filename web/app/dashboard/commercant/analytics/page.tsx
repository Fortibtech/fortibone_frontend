'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getAnalyticsOverview, getSales, getTopCustomers, type SalesResponse, type TopSellingProduct } from '@/lib/api';
import { TopProductsChart, RevenueDistributionChart, type RevenueData } from '@/components/charts';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';
    const selectedBusiness = useBusinessStore((s) => s.selectedBusiness);

    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
    const [salesByPeriod, setSalesByPeriod] = useState<RevenueData[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness?.id) return;
        try {
            setLoading(true);
            const [overviewData, salesData, customersData] = await Promise.all([
                getAnalyticsOverview(selectedBusiness.id).catch(() => null),
                getSales(selectedBusiness.id).catch(() => ({ salesByPeriod: [], topSellingProducts: [], salesByProductCategory: [] } as SalesResponse)),
                getTopCustomers(selectedBusiness.id, 1, 5).catch(() => ({ topCustomers: [], total: 0, page: 1, limit: 5, totalPages: 0 }))
            ]);

            setOverview(overviewData);
            setTopProducts(salesData?.topSellingProducts || []);

            // Transform salesByPeriod for RevenueDistributionChart
            const periodData: RevenueData[] = (salesData?.salesByPeriod || []).map(item => ({
                period: item.period,
                revenue: item.totalAmount
            }));
            setSalesByPeriod(periodData);

            setTopCustomers(customersData?.topCustomers || []);
        } catch (error) {
            console.error('Erreur analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatAmount = (amount: number) => {
        return amount?.toLocaleString('fr-FR') || '0';
    };

    if (!selectedBusiness) {
        return (
            <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
                <div className={styles.emptyState}>
                    <p>Sélectionnez une entreprise pour voir les statistiques</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Statistiques</h1>
                    <div style={{ width: 40 }} />
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement des statistiques...</p>
                    </div>
                ) : (
                    <div className={styles.content}>
                        {/* Overview Cards */}
                        <div className={styles.cardsRow}>
                            <div className={styles.card}>
                                <span className={styles.cardLabel}>Revenus totaux</span>
                                <span className={styles.cardValue}>
                                    {formatAmount(overview?.totalSalesAmount || 0)}
                                    <span className={styles.currency}> XAF</span>
                                </span>
                            </div>
                            <div className={styles.card}>
                                <span className={styles.cardLabel}>Commandes</span>
                                <span className={styles.cardValue}>
                                    {overview?.totalSalesOrders || 0}
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardsRow}>
                            <div className={styles.card}>
                                <span className={styles.cardLabel}>Produits vendus</span>
                                <span className={styles.cardValue}>
                                    {overview?.totalProductsSold || 0}
                                </span>
                            </div>
                            <div className={styles.card}>
                                <span className={styles.cardLabel}>Clients</span>
                                <span className={styles.cardValue}>
                                    {overview?.uniqueCustomers || 0}
                                </span>
                            </div>
                        </div>

                        {/* Revenue Evolution Chart */}
                        <RevenueDistributionChart
                            data={salesByPeriod}
                            loading={loading}
                            currencySymbol="XAF"
                        />

                        {/* Top Products Chart */}
                        <TopProductsChart
                            data={topProducts}
                            loading={loading}
                            currencySymbol="XAF"
                            title="Top produits vendus"
                        />

                        {/* Top Customers */}
                        {topCustomers.length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Meilleurs clients</h3>
                                <div className={styles.customersList}>
                                    {topCustomers.map((customer, index) => (
                                        <div key={index} className={styles.customerItem}>
                                            <div className={styles.customerRank}>{index + 1}</div>
                                            <div className={styles.customerInfo}>
                                                <span className={styles.customerName}>
                                                    {customer.firstName} {customer.lastName}
                                                </span>
                                                <span className={styles.customerOrders}>
                                                    {customer.totalOrdersPlaced || 0} commandes
                                                </span>
                                            </div>
                                            <span className={styles.customerTotal}>
                                                {formatAmount(parseFloat(customer.totalAmountSpent) || 0)} XAF
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
