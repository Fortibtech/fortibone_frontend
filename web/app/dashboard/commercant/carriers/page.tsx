'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axiosInstance';
import styles from './carriers.module.css';

interface Carrier {
    id: string;
    name: string;
    type: string;
}

interface Tariff {
    id: string;
    businessId: string;
    name: string;
    description?: string;
    basePrice: string;
    pricePerKm: string;
    minDistance: number;
    maxDistance: number;
    vehicleType?: string | null;
}

export default function CarriersPage() {
    const router = useRouter();
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loadingTariffs, setLoadingTariffs] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadCarriers();
    }, []);

    const loadCarriers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/businesses/carriers');
            const all = response.data || [];
            const livreurs = all.filter((b: Carrier) => b.type === 'LIVREUR');
            setCarriers(livreurs);
        } catch (error) {
            console.error('Error loading carriers:', error);
        } finally {
            setLoading(false);
        }
    };

    const openTariffs = async (carrier: Carrier) => {
        setSelectedCarrier(carrier);
        setModalOpen(true);
        setLoadingTariffs(true);
        setTariffs([]);

        try {
            const response = await axiosInstance.get(`/delivery/tariffs/${carrier.id}`);
            setTariffs(response.data || []);
        } catch (error) {
            console.error('Error loading tariffs:', error);
            setTariffs([]);
        } finally {
            setLoadingTariffs(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCarrier(null);
        setTariffs([]);
    };

    const formatPrice = (price: string) => {
        const num = parseInt(price, 10);
        return isNaN(num) ? '— KMF' : `${num.toLocaleString('fr-FR')} KMF`;
    };

    const formatDistance = (min: number, max: number) => {
        if (min === 0 && max === 0) return 'Illimité';
        if (min === 0) return `Jusqu'à ${max} km`;
        if (max === 0 || max >= 999999) return `À partir de ${min} km`;
        return `${min} - ${max} km`;
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Livreurs disponibles">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ←
                        </button>
                        <h1 className={styles.title}>Livreurs disponibles</h1>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement des livreurs...</p>
                        </div>
                    ) : carriers.length === 0 ? (
                        <div className={styles.emptyContainer}>
                            <p>Aucun livreur disponible pour le moment</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {carriers.map((carrier) => (
                                <button
                                    key={carrier.id}
                                    className={styles.carrierCard}
                                    onClick={() => openTariffs(carrier)}
                                >
                                    <div className={styles.carrierIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00A36C" strokeWidth="2">
                                            <circle cx="5" cy="18" r="3" />
                                            <circle cx="19" cy="18" r="3" />
                                            <path d="M12 2l2 7h4l4 4v5h-3" />
                                            <path d="M8 18H2v-5l4-4h4l2-7" />
                                        </svg>
                                    </div>
                                    <div className={styles.carrierInfo}>
                                        <span className={styles.carrierName}>{carrier.name}</span>
                                        <span className={styles.carrierType}>Livreur</span>
                                    </div>
                                    <span className={styles.carrierArrow}>›</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Modal des tarifs */}
                    {modalOpen && (
                        <div className={styles.modalOverlay} onClick={closeModal}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>
                                        Tarifs de {selectedCarrier?.name || 'Livreur'}
                                    </h2>
                                    <button className={styles.closeBtn} onClick={closeModal}>
                                        ✕
                                    </button>
                                </div>

                                <div className={styles.modalBody}>
                                    {loadingTariffs ? (
                                        <div className={styles.loadingTariffs}>
                                            <div className={styles.spinner} />
                                            <p>Chargement des tarifs...</p>
                                        </div>
                                    ) : tariffs.length === 0 ? (
                                        <div className={styles.emptyTariffs}>
                                            <p>Aucun tarif configuré pour ce livreur</p>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className={styles.tarifsTitle}>Tarifs disponibles</h3>
                                            {tariffs.map((tarif) => (
                                                <div key={tarif.id} className={styles.tarifCard}>
                                                    <h4 className={styles.tarifName}>{tarif.name}</h4>
                                                    {tarif.description && (
                                                        <p className={styles.tarifDescription}>{tarif.description}</p>
                                                    )}
                                                    <div className={styles.tarifDetails}>
                                                        <div className={styles.tarifRow}>
                                                            <span className={styles.tarifLabel}>Prix de base :</span>
                                                            <span className={styles.tarifValue}>{formatPrice(tarif.basePrice)}</span>
                                                        </div>
                                                        <div className={styles.tarifRow}>
                                                            <span className={styles.tarifLabel}>Prix par km :</span>
                                                            <span className={styles.tarifValue}>{formatPrice(tarif.pricePerKm)}/km</span>
                                                        </div>
                                                        <div className={styles.tarifRow}>
                                                            <span className={styles.tarifLabel}>Distance :</span>
                                                            <span className={styles.tarifValue}>
                                                                {formatDistance(tarif.minDistance, tarif.maxDistance)}
                                                            </span>
                                                        </div>
                                                        {tarif.vehicleType && (
                                                            <div className={styles.tarifRow}>
                                                                <span className={styles.tarifLabel}>Véhicule :</span>
                                                                <span className={styles.tarifValue}>{tarif.vehicleType}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                <div className={styles.modalFooter}>
                                    <button className={styles.closeButton} onClick={closeModal}>
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
