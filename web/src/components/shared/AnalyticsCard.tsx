'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getSales, SalesResponse } from '@/lib/api/analytics';
import {
    SalesByPeriodChart,
    ExpenseDistributionChart,
    RevenueDistributionChart,
    InventoryLossesChart,
} from '@/components/charts';
import styles from './AnalyticsCard.module.css';

interface AnalyticsCardLinkProps {
    icon: string;
    title: string;
    href: string;
}

const AnalyticsCardLink = ({ icon, title, href }: AnalyticsCardLinkProps) => (
    <Link href={href} className={styles.card}>
        <div className={styles.iconContainer}>
            <span>{icon}</span>
        </div>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardArrow}>›</span>
    </Link>
);

interface AnalyticsCardProps {
    businessId: string;
    currencySymbol?: string;
    dashboardType: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR';
}

export default function AnalyticsCard({
    businessId,
    currencySymbol = 'KMF',
    dashboardType,
}: AnalyticsCardProps) {
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const basePath = `/dashboard/${dashboardType.toLowerCase()}`;

    const fetchData = useCallback(async () => {
        if (!businessId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await getSales(businessId);
            setSalesData(result);
        } catch (err) {
            console.error('Erreur fetch sales:', err);
            setError('Échec du chargement. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prepare chart data - match expected types
    const salesByPeriodData = salesData?.salesByPeriod?.map(item => ({
        period: item.period,
        totalAmount: item.totalAmount,
        totalItems: item.totalItems,
    })) || [];

    const topProductsData = salesData?.topSellingProducts?.map(item => ({
        name: item.productName,
        value: item.totalRevenue,
        quantity: item.totalQuantitySold,
    })) || [];

    // ExpenseDistributionChart expects { category, amount }
    const categoryData = salesData?.salesByProductCategory?.map(item => ({
        category: item.categoryName,
        amount: item.totalRevenue,
    })) || [];

    // For inventory losses, we'd need inventory API - use empty for now
    const inventoryLossesData: { movementType: string; totalQuantity: number; totalValue: number }[] = [];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Chargement des analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={fetchData} className={styles.retryBtn}>
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Analytics Section */}
            <h2 className={styles.sectionTitle}>Analytics</h2>
            <div className={styles.cardsRow}>
                <AnalyticsCardLink
                    icon="💵"
                    title="Ventes"
                    href={`${basePath}/analytics?tab=ventes`}
                />
                <AnalyticsCardLink
                    icon="🛒"
                    title="Achats"
                    href={`${basePath}/analytics-purchases`}
                />
                <AnalyticsCardLink
                    icon="📦"
                    title="Stock"
                    href={`${basePath}/stock-tracking`}
                />
            </div>

            {/* Carriers Button */}
            <Link href={`${basePath}/carriers`} className={styles.carriersBtn}>
                <span className={styles.carriersIcon}>👤</span>
                <span className={styles.carriersText}>Tarifs des livreurs</span>
                <span className={styles.carriersArrow}>›</span>
            </Link>

            {/* Statistics Section with Charts */}
            <h2 className={styles.sectionTitle}>Statistiques</h2>

            {/* Sales by Period Chart */}
            <SalesByPeriodChart
                data={salesByPeriodData}
                loading={false}
                currencySymbol={currencySymbol}
            />

            {/* Expense Distribution Chart - using category data */}
            <ExpenseDistributionChart
                data={categoryData}
                loading={false}
                currencySymbol={currencySymbol}
                title="Répartition par catégorie"
            />

            {/* Revenue Distribution Chart - using sales data */}
            <RevenueDistributionChart
                data={salesByPeriodData.map(item => ({
                    period: item.period,
                    revenue: item.totalAmount,
                }))}
                loading={false}
                currencySymbol={currencySymbol}
            />

            {/* Inventory Losses Chart */}
            <InventoryLossesChart
                data={inventoryLossesData}
                loading={false}
                currencySymbol={currencySymbol}
            />
        </div>
    );
}
