'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getTariffs, getBusinessVehicles, Tariff, Vehicle, VehicleType } from '@/lib/api/delivery';
import styles from './earnings.module.css';

type TabType = 'REVENU' | 'TARIFS';

export default function LivreurEarningsPage() {
    const { selectedBusiness } = useBusinessStore();

    // États
    const [activeTab, setActiveTab] = useState<TabType>('REVENU');
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Ajout Tarif
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [creating, setCreating] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        basePrice: '',
        pricePerKm: '',
        minDistance: '',
        maxDistance: '',
        vehicleType: '' as VehicleType | '',
    });

    // Charger données
    const loadData = useCallback(async () => {
        if (!selectedBusiness?.id) return;
        try {
            setLoading(true);
            const [tariffsData, vehiclesData] = await Promise.all([
                getTariffs(selectedBusiness.id).catch(() => []),
                getBusinessVehicles(selectedBusiness.id).catch(() => []),
            ]);
            setTariffs(tariffsData || []);
            setVehicles(vehiclesData || []);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Helpers
    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '—' : `${num.toLocaleString()} KMF`;
    };

    const getDistanceText = (min: number, max: number | null) => {
        if (min === 0) return max ? `Jusqu'à ${max} km` : 'Sans limite';
        return max ? `${min} à ${max} km` : `À partir de ${min} km`;
    };

    const getVehicleLabel = (type: VehicleType) => {
        const labels: Record<VehicleType, string> = {
            MOTO: 'Moto',
            VELO: 'Vélo',
            SCOOTER: 'Scooter',
            VOITURE: 'Voiture',
            CAMIONNETTE: 'Camionnette',
            CAMION: 'Camion',
            DRONE: 'Drone',
            AUTRE: 'Autre',
        };
        return labels[type] || type;
    };

    // Calcul des revenus estimés (placeholder - l'API mobile est en développement)
    const estimatedMonthlyRevenue = tariffs.reduce((sum, t) => {
        const base = typeof t.basePrice === 'number' ? t.basePrice : parseFloat(t.basePrice) || 0;
        return sum + base * 10; // Estimation : 10 courses par tarif
    }, 0);

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Revenus">
                <div className={styles.container}>
                    {/* Onglets - Comme mobile */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'REVENU' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('REVENU')}
                        >
                            Revenus
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'TARIFS' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('TARIFS')}
                        >
                            Zone et tarifs
                        </button>
                    </div>

                    {activeTab === 'REVENU' ? (
                        /* ========== ONGLET REVENUS ========== */
                        <div className={styles.revenusContent}>
                            <div className={styles.inDevelopment}>
                                <span className={styles.constructionIcon}>🚧</span>
                                <h2>Page en cours de conception</h2>
                                <p>
                                    Cette section des revenus est actuellement en développement.
                                    Elle sera bientôt disponible avec toutes les statistiques et
                                    graphiques détaillés.
                                </p>
                            </div>

                            {/* Aperçu basique */}
                            <div className={styles.previewCards}>
                                <div className={styles.previewCard}>
                                    <span className={styles.previewIcon}>💰</span>
                                    <div>
                                        <span className={styles.previewLabel}>Revenus estimés (mois)</span>
                                        <span className={styles.previewValue}>
                                            {estimatedMonthlyRevenue.toLocaleString()} KMF
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.previewCard}>
                                    <span className={styles.previewIcon}>🚗</span>
                                    <div>
                                        <span className={styles.previewLabel}>Véhicules actifs</span>
                                        <span className={styles.previewValue}>
                                            {vehicles.filter(v => v.isActive).length}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.previewCard}>
                                    <span className={styles.previewIcon}>📋</span>
                                    <div>
                                        <span className={styles.previewLabel}>Tarifs configurés</span>
                                        <span className={styles.previewValue}>
                                            {tariffs.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ========== ONGLET ZONE ET TARIFS ========== */
                        <div className={styles.tarifsContent}>
                            {/* Bouton Ajouter */}
                            <button
                                className={styles.addButton}
                                onClick={() => setAddModalVisible(true)}
                            >
                                ➕ Ajouter un tarif
                            </button>

                            {/* Header */}
                            <div className={styles.tarifsHeader}>
                                <h2>Zones et tarifs</h2>
                                <p>Tarifs appliqués selon la zone et la distance de livraison</p>
                            </div>

                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner} />
                                    <p>Chargement des tarifs...</p>
                                </div>
                            ) : tariffs.length > 0 ? (
                                <div className={styles.tariffsList}>
                                    {tariffs.map((tariff) => (
                                        <div key={tariff.id} className={styles.tariffCard}>
                                            <div className={styles.tariffHeader}>
                                                <h3>{tariff.name}</h3>
                                                <span className={styles.mapIcon}>🗺️</span>
                                            </div>

                                            <div className={styles.tariffMeta}>
                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaIcon}>💰</span>
                                                    <div>
                                                        <span className={styles.metaLabel}>Forfait de base</span>
                                                        <span className={styles.metaValue}>
                                                            {formatPrice(tariff.basePrice)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaIcon}>⚡</span>
                                                    <div>
                                                        <span className={styles.metaLabel}>Prix par km</span>
                                                        <span className={styles.metaValue}>
                                                            {formatPrice(tariff.pricePerKm)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaIcon}>📍</span>
                                                    <div>
                                                        <span className={styles.metaLabel}>Distance</span>
                                                        <span className={styles.metaValue}>
                                                            {getDistanceText(tariff.minDistance, tariff.maxDistance || null)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {tariff.vehicleType && (
                                                <div className={styles.vehicleChip}>
                                                    🛵 {getVehicleLabel(tariff.vehicleType)}
                                                </div>
                                            )}

                                            <div className={styles.tariffActions}>
                                                <button className={styles.editBtn}>
                                                    ✏️ Modifier
                                                </button>
                                                <button className={styles.deleteBtn}>
                                                    🗑️ Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>🏷️</span>
                                    <h3>Aucune zone configurée</h3>
                                    <p>Ajoute tes premiers tarifs pour définir les prix de livraison.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Ajout Tarif (simplifié) */}
                {addModalVisible && (
                    <div className={styles.modalOverlay} onClick={() => !creating && setAddModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Nouvelle zone tarifaire</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setAddModalVisible(false)}
                                >✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <label>Nom de la zone *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Centre-ville"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                />

                                <label>Forfait de base (KMF) *</label>
                                <input
                                    type="number"
                                    placeholder="2000"
                                    value={addForm.basePrice}
                                    onChange={(e) => setAddForm({ ...addForm, basePrice: e.target.value })}
                                />

                                <label>Prix par km (KMF) *</label>
                                <input
                                    type="number"
                                    placeholder="500"
                                    value={addForm.pricePerKm}
                                    onChange={(e) => setAddForm({ ...addForm, pricePerKm: e.target.value })}
                                />

                                <label>Distance min (km)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={addForm.minDistance}
                                    onChange={(e) => setAddForm({ ...addForm, minDistance: e.target.value })}
                                />

                                <label>Distance max (km, vide = illimité)</label>
                                <input
                                    type="number"
                                    placeholder="Illimité"
                                    value={addForm.maxDistance}
                                    onChange={(e) => setAddForm({ ...addForm, maxDistance: e.target.value })}
                                />

                                {vehicles.length > 0 && (
                                    <>
                                        <label>Type de véhicule (optionnel)</label>
                                        <select
                                            value={addForm.vehicleType}
                                            onChange={(e) => setAddForm({ ...addForm, vehicleType: e.target.value as VehicleType })}
                                        >
                                            <option value="">Tous les véhicules</option>
                                            {Array.from(new Set(vehicles.map(v => v.type))).map(type => (
                                                <option key={type} value={type}>
                                                    {getVehicleLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setAddModalVisible(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    disabled={creating}
                                >
                                    {creating ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
