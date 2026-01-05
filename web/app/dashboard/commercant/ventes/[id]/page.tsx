'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getOrderById, updateOrderStatus, Order, OrderStatus } from '@/lib/api/orders';
import {
    getLivreurs,
    createDeliveryEstimate,
    createDeliveryRequest,
    getTariffs,
    type Livreur,
    type EstimateResponse,
    type EstimateOption,
    type Tariff,
    type FeePayer,
} from '@/lib/api/delivery';
import styles from './order-detail.module.css';

const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: 'En attente de paiement',
    PENDING: 'Nouvelle commande',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En préparation',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée',
    PAID: 'Payée',
};

const statusColors: Record<string, { color: string; bg: string }> = {
    PENDING_PAYMENT: { color: '#F97316', bg: '#FFF7ED' },
    PENDING: { color: '#EA580C', bg: '#FFEDD5' },
    CONFIRMED: { color: '#8B5CF6', bg: '#F5F3FF' },
    PROCESSING: { color: '#D97706', bg: '#FFFBEB' },
    SHIPPED: { color: '#2563EB', bg: '#EFF6FF' },
    DELIVERED: { color: '#16A34A', bg: '#F0FDF4' },
    COMPLETED: { color: '#059669', bg: '#ECFDF5' },
    CANCELLED: { color: '#EF4444', bg: '#FEF2F2' },
    REFUNDED: { color: '#6B7280', bg: '#F3F4F6' },
    PAID: { color: '#059669', bg: '#D1FAE5' },
};

// Default pickup coordinates (can be updated via map)
const DEFAULT_PICKUP = { lat: 4.0511, lng: 9.7679 };

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id as string;
    const { selectedBusiness } = useBusinessStore();

    // Order state
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Delivery state
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null);
    const [loadingLivreurs, setLoadingLivreurs] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Coordinates
    const [pickupCoords] = useState(DEFAULT_PICKUP);
    const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Estimation
    const [estimating, setEstimating] = useState(false);
    const [estimationResult, setEstimationResult] = useState<EstimateResponse | null>(null);
    const [selectedOption, setSelectedOption] = useState<EstimateOption | null>(null);

    // Modal & Addresses
    const [modalOpen, setModalOpen] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [feePayer, setFeePayer] = useState<FeePayer>('SENDER');
    const [creatingDelivery, setCreatingDelivery] = useState(false);

    // Delivery code result
    const [deliveryCode, setDeliveryCode] = useState<string | null>(null);

    // Load order
    const loadOrder = useCallback(async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const data = await getOrderById(orderId);
            setOrder(data);
            // Set business address as default pickup
            if (selectedBusiness?.address) {
                setPickupAddress(selectedBusiness.address);
            }
        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setLoading(false);
        }
    }, [orderId, selectedBusiness]);

    // Load livreurs
    const loadLivreurs = useCallback(async () => {
        try {
            setLoadingLivreurs(true);
            const response = await getLivreurs({ limit: 100 });
            setLivreurs(response.data);
            if (response.data.length > 0) {
                setSelectedCarrierId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error loading livreurs:', error);
        } finally {
            setLoadingLivreurs(false);
        }
    }, []);

    useEffect(() => {
        loadOrder();
        loadLivreurs();
    }, [loadOrder, loadLivreurs]);

    // Handle status update
    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        if (!order || updating) return;
        try {
            setUpdating(true);
            const updated = await updateOrderStatus(order.id, newStatus);
            setOrder({ ...order, ...updated, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Impossible de mettre à jour le statut');
        } finally {
            setUpdating(false);
        }
    };

    // Handle delivery estimation
    const handleEstimate = async () => {
        if (!selectedCarrierId || !deliveryCoords) {
            alert('Sélectionnez un livreur et définissez les coordonnées de livraison');
            return;
        }

        try {
            setEstimating(true);
            const result = await createDeliveryEstimate({
                pickupLat: pickupCoords.lat,
                pickupLng: pickupCoords.lng,
                deliveryLat: deliveryCoords.lat,
                deliveryLng: deliveryCoords.lng,
                carrierId: selectedCarrierId,
            });

            setEstimationResult(result);
            if (result.options.length > 0) {
                setSelectedOption(result.options[0]);
            }
            setModalOpen(true);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de l\'estimation');
        } finally {
            setEstimating(false);
        }
    };

    // Handle delivery creation
    const handleCreateDelivery = async () => {
        if (!order || !selectedCarrierId || !estimationResult || !selectedOption || !deliveryCoords) {
            alert('Données incomplètes');
            return;
        }

        if (!pickupAddress.trim() || !deliveryAddress.trim()) {
            alert('Veuillez renseigner les adresses');
            return;
        }

        try {
            setCreatingDelivery(true);
            const response = await createDeliveryRequest({
                orderId: order.id,
                carrierId: selectedCarrierId,
                pickupAddress: pickupAddress.trim(),
                pickupLat: pickupCoords.lat,
                pickupLng: pickupCoords.lng,
                deliveryAddress: deliveryAddress.trim(),
                deliveryLat: deliveryCoords.lat,
                deliveryLng: deliveryCoords.lng,
                distanceMeters: Math.round(estimationResult.distanceKm * 1000),
                estimatedCost: selectedOption.totalCost,
                feePayer,
                tariffId: selectedOption.tariffId,
            });

            setDeliveryCode(response.deliveryCode);
            setModalOpen(false);
            alert(`Demande de livraison créée ! Code de suivi : ${response.deliveryCode}`);
        } catch (error: any) {
            const msg = error.response?.status === 409
                ? 'Une demande existe déjà pour cette commande'
                : error.response?.data?.message || 'Erreur lors de la création';
            alert(msg);
        } finally {
            setCreatingDelivery(false);
        }
    };

    // Quick set delivery coords (demo - normally from map)
    const setDemoDeliveryCoords = () => {
        setDeliveryCoords({ lat: 4.0611, lng: 9.7779 });
        setDeliveryAddress('123 Rue de Livraison, Douala');
    };

    const selectedCarrier = livreurs.find(l => l.id === selectedCarrierId);
    const filteredLivreurs = livreurs.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading || !order) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Détail commande">
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const statusConfig = statusColors[order.status] || { color: '#666', bg: '#F3F4F6' };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title={`Commande #${order.orderNumber}`}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button onClick={() => router.back()} className={styles.backBtn}>
                            ← Retour
                        </button>
                        <h1>Commande #{order.orderNumber}</h1>
                    </div>

                    {/* Client & Status Card */}
                    <div className={styles.card}>
                        <div className={styles.cardRow}>
                            <div className={styles.clientInfo}>
                                <div className={styles.avatar}>
                                    {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0] || ''}
                                </div>
                                <div>
                                    <span className={styles.label}>Client</span>
                                    <span className={styles.value}>
                                        {order.customer?.firstName} {order.customer?.lastName}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.statusBox}>
                                <span className={styles.label}>Statut</span>
                                <span
                                    className={styles.statusBadge}
                                    style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                                >
                                    {statusLabels[order.status] || order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className={styles.card}>
                        <h2>Informations</h2>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.notes && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Notes</span>
                                <span className={styles.infoValue}>{order.notes}</span>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className={styles.card}>
                        <h2>Articles commandés</h2>
                        <div className={styles.itemsList}>
                            {order.lines?.map((line) => (
                                <div key={line.id} className={styles.orderItem}>
                                    <span className={styles.itemName}>
                                        {line.variant?.name || line.variant?.product?.name || 'Article'}
                                    </span>
                                    <span className={styles.itemQty}>x{line.quantity}</span>
                                    <span className={styles.itemPrice}>
                                        {(line.price * line.quantity).toLocaleString('fr-FR')} KMF
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <strong>{parseFloat(order.totalAmount).toLocaleString('fr-FR')} KMF</strong>
                        </div>
                    </div>

                    {/* Delivery Section */}
                    {livreurs.length > 0 && !deliveryCode && (
                        <div className={styles.card}>
                            <h2>🚚 Livraison</h2>

                            {/* Carrier Selector */}
                            <label className={styles.fieldLabel}>Choisir le livreur</label>
                            <div className={styles.dropdownWrapper}>
                                <button
                                    className={styles.dropdownBtn}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    disabled={loadingLivreurs}
                                >
                                    <span>
                                        {selectedCarrier ? selectedCarrier.name : 'Sélectionner...'}
                                    </span>
                                    <span>{dropdownOpen ? '▲' : '▼'}</span>
                                </button>

                                {dropdownOpen && (
                                    <div className={styles.dropdown}>
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={styles.searchInput}
                                            autoFocus
                                        />
                                        <div className={styles.dropdownList}>
                                            {filteredLivreurs.map((carrier) => (
                                                <button
                                                    key={carrier.id}
                                                    className={`${styles.dropdownItem} ${selectedCarrierId === carrier.id ? styles.selected : ''}`}
                                                    onClick={() => {
                                                        setSelectedCarrierId(carrier.id);
                                                        setSearchQuery('');
                                                        setDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className={`${styles.onlineDot} ${carrier.isOnline ? styles.online : ''}`} />
                                                    <span className={styles.carrierName}>{carrier.name}</span>
                                                    {carrier.averageRating > 0 && (
                                                        <span className={styles.rating}>
                                                            ⭐ {carrier.averageRating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                            {filteredLivreurs.length === 0 && (
                                                <p className={styles.noResult}>Aucun livreur trouvé</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Coordinates */}
                            <div className={styles.coordsSection}>
                                <label className={styles.fieldLabel}>Point de livraison</label>
                                {deliveryCoords ? (
                                    <p className={styles.coordsText}>
                                        📍 {deliveryCoords.lat.toFixed(4)}, {deliveryCoords.lng.toFixed(4)}
                                    </p>
                                ) : (
                                    <button
                                        className={styles.setLocationBtn}
                                        onClick={setDemoDeliveryCoords}
                                    >
                                        📍 Définir point de livraison (démo)
                                    </button>
                                )}
                            </div>

                            {/* Estimate Button */}
                            <button
                                className={styles.estimateBtn}
                                onClick={handleEstimate}
                                disabled={!selectedCarrierId || !deliveryCoords || estimating}
                            >
                                {estimating ? '⏳ Estimation...' : '📊 Estimer la livraison'}
                            </button>
                        </div>
                    )}

                    {/* Delivery Code Display */}
                    {deliveryCode && (
                        <div className={styles.card}>
                            <h2>✅ Livraison demandée</h2>
                            <div className={styles.deliveryCodeBox}>
                                <span className={styles.codeLabel}>Code de suivi</span>
                                <span className={styles.codeValue}>{deliveryCode}</span>
                            </div>
                            <p className={styles.codeInfo}>
                                Communiquez ce code au client pour la validation de la livraison.
                            </p>
                        </div>
                    )}

                    {/* Order Actions */}
                    <div className={styles.actionsCard}>
                        {order.status === 'PENDING' && (
                            <>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => handleStatusUpdate('CONFIRMED')}
                                    disabled={updating}
                                >
                                    ✅ Confirmer la commande
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                    onClick={() => handleStatusUpdate('CANCELLED')}
                                    disabled={updating}
                                >
                                    ❌ Annuler
                                </button>
                            </>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleStatusUpdate('PROCESSING')}
                                disabled={updating}
                            >
                                🔧 Lancer la préparation
                            </button>
                        )}
                        {order.status === 'PROCESSING' && (
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleStatusUpdate('SHIPPED')}
                                disabled={updating}
                            >
                                📦 Marquer comme expédié
                            </button>
                        )}
                    </div>

                    {/* Estimation Modal */}
                    {modalOpen && estimationResult && selectedCarrier && (
                        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2>Choisir une option de livraison</h2>
                                    <button onClick={() => setModalOpen(false)}>✕</button>
                                </div>

                                <div className={styles.modalBody}>
                                    <p className={styles.carrierInfo}>
                                        <strong>{selectedCarrier.name}</strong> – Distance: {estimationResult.distanceKm.toFixed(2)} km
                                    </p>

                                    {/* Tariff Options */}
                                    <h3>Options disponibles</h3>
                                    {estimationResult.options.length === 0 ? (
                                        <p className={styles.noOptions}>Aucune option disponible</p>
                                    ) : (
                                        <div className={styles.optionsList}>
                                            {estimationResult.options.map((option) => (
                                                <button
                                                    key={option.tariffId}
                                                    className={`${styles.optionCard} ${selectedOption?.tariffId === option.tariffId ? styles.selectedOption : ''}`}
                                                    onClick={() => setSelectedOption(option)}
                                                >
                                                    <div className={styles.optionHeader}>
                                                        <strong>{option.tariffName}</strong>
                                                        <span>{option.vehicleType}</span>
                                                    </div>
                                                    <span className={styles.optionPrice}>
                                                        {option.totalCost.toLocaleString('fr-FR')} {option.currency}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Addresses */}
                                    <h3>Adresses</h3>
                                    <label className={styles.fieldLabel}>Récupération</label>
                                    <input
                                        type="text"
                                        className={styles.addressInput}
                                        value={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        placeholder="Adresse de récupération"
                                    />

                                    <label className={styles.fieldLabel}>Livraison</label>
                                    <input
                                        type="text"
                                        className={styles.addressInput}
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="Adresse de livraison"
                                    />

                                    {/* Fee Payer */}
                                    <h3>Qui paie la livraison ?</h3>
                                    <div className={styles.feePayerRow}>
                                        <button
                                            className={`${styles.feePayerBtn} ${feePayer === 'SENDER' ? styles.active : ''}`}
                                            onClick={() => setFeePayer('SENDER')}
                                        >
                                            🏪 Commerçant
                                        </button>
                                        <button
                                            className={`${styles.feePayerBtn} ${feePayer === 'RECEIVER' ? styles.active : ''}`}
                                            onClick={() => setFeePayer('RECEIVER')}
                                        >
                                            👤 Client
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.modalFooter}>
                                    <button
                                        className={styles.cancelModalBtn}
                                        onClick={() => setModalOpen(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        className={styles.confirmModalBtn}
                                        onClick={handleCreateDelivery}
                                        disabled={creatingDelivery || !selectedOption}
                                    >
                                        {creatingDelivery ? '⏳ Création...' : '✅ Créer la demande'}
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
