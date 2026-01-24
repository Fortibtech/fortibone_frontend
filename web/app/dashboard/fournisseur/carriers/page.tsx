'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getTariffs, Tariff } from '@/lib/api/delivery';
import { useEffect, useState, useCallback } from 'react';
import styles from './carriers.module.css';

export default function CarriersPage() {
    const { selectedBusiness } = useBusinessStore();
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTariffs = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getTariffs(selectedBusiness.id);
            setTariffs(data);
        } catch (error) {
            console.error('Error fetching tariffs:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchTariffs();
    }, [fetchTariffs]);

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(numPrice);
    };

    const vehicleTypeLabels: Record<string, string> = {
        'MOTO': '🏍️ Moto',
        'VELO': '🚲 Vélo',
        'SCOOTER': '🛵 Scooter',
        'VOITURE': '🚗 Voiture',
        'CAMIONNETTE': '🚐 Camionnette',
        'CAMION': '🚚 Camion',
        'DRONE': '🚁 Drone',
        'AUTRE': '📦 Autre',
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Tarifs des Livreurs">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Tarifs des Livreurs</h1>
                        <p className={styles.subtitle}>
                            Consultez les tarifs de livraison disponibles pour votre zone
                        </p>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement des tarifs...</p>
                        </div>
                    ) : tariffs.length > 0 ? (
                        <div className={styles.tariffsList}>
                            {tariffs.map((tariff) => (
                                <div key={tariff.id} className={styles.tariffCard}>
                                    <div className={styles.tariffHeader}>
                                        <span className={styles.vehicleType}>
                                            {vehicleTypeLabels[tariff.vehicleType || 'AUTRE']}
                                        </span>
                                        <span className={styles.tariffName}>{tariff.name}</span>
                                    </div>

                                    {tariff.description && (
                                        <p className={styles.tariffDescription}>{tariff.description}</p>
                                    )}

                                    <div className={styles.priceGrid}>
                                        <div className={styles.priceItem}>
                                            <span className={styles.priceLabel}>Prix de base</span>
                                            <span className={styles.priceValue}>
                                                {formatPrice(tariff.basePrice)} KMF
                                            </span>
                                        </div>
                                        <div className={styles.priceItem}>
                                            <span className={styles.priceLabel}>Prix/km</span>
                                            <span className={styles.priceValue}>
                                                {formatPrice(tariff.pricePerKm)} KMF
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.distanceInfo}>
                                        <span className={styles.distanceLabel}>Distance:</span>
                                        <span className={styles.distanceValue}>
                                            {tariff.minDistance} - {tariff.maxDistance} km
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>📦</span>
                            <h3>Aucun tarif disponible</h3>
                            <p>Aucun livreur n&apos;a encore défini de tarifs pour cette zone</p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
