'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getAnalyticsOverview, getSales, getTopCustomers, type SalesResponse, type TopSellingProduct, type AnalyticsOverview } from '@/lib/api';
import { TopProductsChart, RevenueDistributionChart, type RevenueData } from '@/components/charts';
import styles from './analytics.module.css';

// Helper to format money
const formatMoney = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
};

// Stat card data type - aligned with mobile
interface StatCardData {
    title: string;
    value: string | number;
    icon: string;
    iconColor: string;
    iconBgColor: string;
}

// Stat Card Component - matches mobile StockCard
function StatCard({ title, value, icon, iconColor, iconBgColor }: StatCardData) {
    return (
        <div className={styles.statCard}>
            <div
                className={styles.statIcon}
                style={{ backgroundColor: iconBgColor, color: iconColor }}
            >
                {icon}
            </div>
            <span className={styles.statTitle}>{title}</span>
            <span className={styles.statValue}>{value}</span>
        </div>
    );
}

export default function AnalyticsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';
    const selectedBusiness = useBusinessStore((s) => s.selectedBusiness);

    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
    const [salesByPeriod, setSalesByPeriod] = useState<RevenueData[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);

    const currencySymbol = 'KMF'; // TODO: Get from business currency

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

    // Build stat cards data - EXACTLY like mobile [id].tsx
    const getOverviewData = (): StatCardData[] => {
        if (!overview) return [];

        return [
            {
                title: "Total des ventes",
                value: `${formatMoney(overview.totalSalesAmount)} ${currencySymbol}`,
                icon: "💵",
                iconColor: "#10B981",
                iconBgColor: "#D1FAE5",
            },
            {
                title: "Commandes totales",
                value: overview.totalSalesOrders?.toLocaleString() || '0',
                icon: "🛒",
                iconColor: "#10B981",
                iconBgColor: "#D1FAE5",
            },
            {
                title: "Panier moyen",
                value: `${formatMoney(overview.averageOrderValue)} ${currencySymbol}`,
                icon: "📈",
                iconColor: "#3B82F6",
                iconBgColor: "#DBEAFE",
            },
            {
                title: "Produits vendus",
                value: overview.totalProductsSold?.toLocaleString() || '0',
                icon: "📦",
                iconColor: "#F59E0B",
                iconBgColor: "#FEF3C7",
            },
            {
                title: "Total des achats",
                value: `${formatMoney(overview.totalPurchaseAmount)} ${currencySymbol}`,
                icon: "💳",
                iconColor: "#EF4444",
                iconBgColor: "#FEE2E2",
            },
            {
                title: "Commandes d'achat",
                value: overview.totalPurchaseOrders?.toLocaleString() || '0',
                icon: "🛍️",
                iconColor: "#8B5CF6",
                iconBgColor: "#EDE9FE",
            },
            {
                title: "Valeur du stock",
                value: `${formatMoney(overview.currentInventoryValue)} ${currencySymbol}`,
                icon: "🏬",
                iconColor: "#F97316",
                iconBgColor: "#FFEDD5",
            },
            {
                title: "Membres de l'équipe",
                value: overview.totalMembers?.toString() || '0',
                icon: "👥",
                iconColor: "#06B6D4",
                iconBgColor: "#CFFAFE",
            },
            {
                title: "Clients uniques",
                value: overview.uniqueCustomers?.toLocaleString() || '0',
                icon: "✅",
                iconColor: "#84CC16",
                iconBgColor: "#ECFCCB",
            },
            {
                title: "Note moyenne",
                value: `${overview.averageBusinessRating?.toFixed(1) || '0'} ⭐`,
                icon: "⭐",
                iconColor: "#FACC15",
                iconBgColor: "#FEF9C3",
            },
            {
                title: "Total des avis",
                value: overview.totalBusinessReviews?.toLocaleString() || '0',
                icon: "💬",
                iconColor: "#6366F1",
                iconBgColor: "#E0E7FF",
            },
        ];
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
                    <h1 className={styles.title}>Vue d&apos;ensemble</h1>
                    <div style={{ width: 40 }} />
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement des statistiques...</p>
                    </div>
                ) : (
                    <div className={styles.content}>
                        {/* Overview Stats Grid - Mobile aligned (11 cards) */}
                        <div className={styles.statsGrid}>
                            {getOverviewData().map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>

                        {/* Revenue Evolution Chart */}
                        <RevenueDistributionChart
                            data={salesByPeriod}
                            loading={loading}
                            currencySymbol={currencySymbol}
                        />

                        {/* Top Products Chart */}
                        <TopProductsChart
                            data={topProducts}
                            loading={loading}
                            currencySymbol={currencySymbol}
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
                                                {formatMoney(parseFloat(customer.totalAmountSpent) || 0)} {currencySymbol}
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
