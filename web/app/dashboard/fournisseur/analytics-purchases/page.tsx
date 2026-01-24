'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getSales, SalesResponse } from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './analytics-purchases.module.css';

export default function AnalyticsPurchasesPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getSales(selectedBusiness.id);
            setSalesData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatAmount = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(num);
    };

    // Calculate totals
    const totalRevenue = salesData?.salesByProductCategory?.reduce((acc, c) => acc + c.totalRevenue, 0) || 0;
    const totalItemsSold = salesData?.salesByProductCategory?.reduce((acc, c) => acc + c.totalItemsSold, 0) || 0;
    const categoryCount = salesData?.salesByProductCategory?.length || 0;

    const topProduct = salesData?.topSellingProducts?.[0];
    const topRevenueProduct = salesData?.topSellingProducts?.sort((a, b) => b.totalRevenue - a.totalRevenue)?.[0];
    const topPercentage = topProduct?.revenuePercentage ||
        (topRevenueProduct && totalRevenue > 0 ? (topRevenueProduct.totalRevenue / totalRevenue * 100) : 0);

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Statistiques des Ventes">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ←
                        </button>
                        <h1 className={styles.title}>Analytics Achats</h1>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <div className={styles.statsGrid}>
                            {/* Montant total des ventes */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                                    <span>💰</span>
                                </div>
                                <span className={styles.statLabel}>Montant total des ventes</span>
                                <span className={styles.statValue}>
                                    {formatAmount(0)} KMF
                                </span>
                            </div>

                            {/* Articles vendus */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                    <span>📦</span>
                                </div>
                                <span className={styles.statLabel}>Articles vendus</span>
                                <span className={styles.statValue}>
                                    {totalItemsSold}
                                </span>
                            </div>

                            {/* Revenu par catégorie */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                    <span>📊</span>
                                </div>
                                <span className={styles.statLabel}>Revenu par catégorie</span>
                                <span className={styles.statValue}>
                                    {formatAmount(totalRevenue)} KMF
                                </span>
                            </div>

                            {/* Produits vendus (catégories) */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                    <span>🏷️</span>
                                </div>
                                <span className={styles.statLabel}>Produits vendus (catégories)</span>
                                <span className={styles.statValue}>
                                    {categoryCount}
                                </span>
                            </div>

                            {/* Top produit vendu (quantité) */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconCyan}`}>
                                    <span>🏆</span>
                                </div>
                                <span className={styles.statLabel}>Top produit vendu (quantité)</span>
                                <span className={styles.statValue}>
                                    {topProduct?.totalQuantitySold || 0}
                                </span>
                            </div>

                            {/* Top produit revenu */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconPink}`}>
                                    <span>📈</span>
                                </div>
                                <span className={styles.statLabel}>Top produit revenu</span>
                                <span className={styles.statValue}>
                                    {formatAmount(topRevenueProduct?.totalRevenue || 0)} KMF
                                </span>
                            </div>

                            {/* Pourcentage du top produit */}
                            <div className={`${styles.statCard} ${styles.statCardFull}`}>
                                <div className={`${styles.statIcon} ${styles.iconLime}`}>
                                    <span>%</span>
                                </div>
                                <span className={styles.statLabel}>Pourcentage du top produit</span>
                                <span className={styles.statValue}>
                                    {topPercentage.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

