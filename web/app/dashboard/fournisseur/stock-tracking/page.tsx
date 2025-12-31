'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getInventory, InventoryResponse } from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './stock-tracking.module.css';

export default function StockTrackingPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<InventoryResponse | null>(null);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getInventory(selectedBusiness.id);
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(value);
    };

    const outOfStockCount = inventory?.productsLowStock?.filter(p => p.quantityInStock <= 0).length || 0;
    const expiringCount = inventory?.expiringProducts?.length || 0;
    const totalLosses = inventory?.lossesByMovementType?.reduce((acc, l) => acc + l.totalQuantity, 0) || 0;

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Suivi de l'Inventaire">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ←
                        </button>
                        <h1 className={styles.title}>Suivi des Stocks</h1>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <div className={styles.statsGrid}>
                            {/* Valeur du stock */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                    <span>💰</span>
                                </div>
                                <span className={styles.statLabel}>Valeur du stock</span>
                                <span className={styles.statValue}>
                                    {formatAmount(inventory?.currentInventoryValue || 0)} KMF
                                </span>
                            </div>

                            {/* Unités en stock */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                    <span>📦</span>
                                </div>
                                <span className={styles.statLabel}>Unités en stock</span>
                                <span className={styles.statValue}>
                                    {inventory?.totalUnitsInStock || 0}
                                </span>
                            </div>

                            {/* Produits en rupture */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                                    <span>⚠️</span>
                                </div>
                                <span className={styles.statLabel}>Produits en rupture</span>
                                <span className={styles.statValue}>{outOfStockCount}</span>
                            </div>

                            {/* Produits expirants */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                                    <span>⏱️</span>
                                </div>
                                <span className={styles.statLabel}>Produits expirants</span>
                                <span className={styles.statValue}>{expiringCount}</span>
                            </div>

                            {/* Pertes enregistrées */}
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                    <span>📉</span>
                                </div>
                                <span className={styles.statLabel}>Pertes enregistrées</span>
                                <span className={styles.statValue}>{totalLosses}</span>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

