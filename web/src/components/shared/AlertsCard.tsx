'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './AlertsCard.module.css';

export interface ExpiringProduct {
    batchId: string;
    variantId: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

export interface LowStockProduct {
    variantId: string;
    sku: string;
    productName: string;
    quantityInStock: number;
    alertThreshold: number;
}

export interface AlertsCardProps {
    expiringProducts?: ExpiringProduct[];
    lowStockProducts?: LowStockProduct[];
    inventoryLink?: string;
    showTitle?: boolean;
}

export default function AlertsCard({
    expiringProducts = [],
    lowStockProducts = [],
    inventoryLink = '/dashboard/commercant/products',
    showTitle = true,
}: AlertsCardProps) {
    const [dismissedExpiring, setDismissedExpiring] = useState(false);
    const [dismissedLowStock, setDismissedLowStock] = useState(false);

    const hasExpiring = expiringProducts.length > 0 && !dismissedExpiring;
    const hasLowStock = lowStockProducts.length > 0 && !dismissedLowStock;
    const hasAlerts = hasExpiring || hasLowStock;

    // Calculate days until expiration for the first expiring product
    const getExpirationInfo = () => {
        if (expiringProducts.length === 0) return null;
        const firstExpiring = expiringProducts[0];
        const expirationDate = new Date(firstExpiring.expirationDate);
        const today = new Date();
        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return `${expiringProducts.length} produit(s) périmé(s)`;
        }
        return `${expiringProducts.length} produit(s) expire(nt) dans ${diffDays} jour(s)`;
    };

    if (!hasAlerts) {
        return null;
    }

    return (
        <div className={styles.section}>
            {showTitle && (
                <h3 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚠️</span>
                    Alertes Prioritaires
                </h3>
            )}
            <div className={styles.container}>
                {/* Expiring Products Alert */}
                {hasExpiring && (
                    <div className={`${styles.alert} ${styles.alertExpiring}`}>
                        <span className={styles.alertIcon}>🔴</span>
                        <div className={styles.alertContent}>
                            <p className={styles.alertTitle}>Produits bientôt périmés</p>
                            <p className={styles.alertDescription}>
                                {getExpirationInfo()}
                            </p>
                            <Link href={inventoryLink} className={styles.alertLink}>
                                Voir l&apos;inventaire →
                            </Link>
                        </div>
                        <button
                            className={styles.dismissBtn}
                            onClick={() => setDismissedExpiring(true)}
                            title="Masquer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Low Stock Alert */}
                {hasLowStock && (
                    <div className={`${styles.alert} ${styles.alertLowStock}`}>
                        <span className={styles.alertIcon}>🟡</span>
                        <div className={styles.alertContent}>
                            <p className={styles.alertTitle}>Stock faible</p>
                            <p className={styles.alertDescription}>
                                {lowStockProducts.length} produit(s) en dessous du seuil d&apos;alerte
                            </p>
                            <Link href={inventoryLink} className={styles.alertLink}>
                                Reapprovisionner →
                            </Link>
                        </div>
                        <button
                            className={styles.dismissBtn}
                            onClick={() => setDismissedLowStock(true)}
                            title="Masquer"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
