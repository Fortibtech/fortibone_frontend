'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
    getIncomingDeliveryRequests,
    getActiveDeliveryRequests,
    acceptDelivery,
    rejectDeliveryRequest,
    pickupDeliveryRequest,
    completeDelivery,
    getBusinessVehicles,
    type IncomingDeliveryRequest,
    type Vehicle,
} from '@/lib/api/delivery';
import styles from './courses.module.css';

type TabType = 'INCOMING' | 'ACTIVE';

export default function CoursesPage() {
    const { selectedBusiness } = useBusinessStore();
    const [tab, setTab] = useState<TabType>('INCOMING');
    const [incomingRequests, setIncomingRequests] = useState<IncomingDeliveryRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<IncomingDeliveryRequest[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Modals
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [currentRequestToAccept, setCurrentRequestToAccept] = useState<IncomingDeliveryRequest | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
    const [deliveryCode, setDeliveryCode] = useState('');
    const [validating, setValidating] = useState(false);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [currentRequestDetails, setCurrentRequestDetails] = useState<IncomingDeliveryRequest | null>(null);

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Load data
    const loadIncoming = useCallback(async (): Promise<void> => {
        if (!selectedBusiness?.id) return;
        try {
            const data = await getIncomingDeliveryRequests(selectedBusiness.id);
            setIncomingRequests(data);
        } catch (error) {
            console.error('Error loading incoming:', error);
        }
    }, [selectedBusiness?.id]);

    const loadActive = useCallback(async (): Promise<void> => {
        if (!selectedBusiness?.id) return;
        try {
            const data = await getActiveDeliveryRequests(selectedBusiness.id);
            setActiveRequests(data);
        } catch (error) {
            console.error('Error loading active:', error);
        }
    }, [selectedBusiness?.id]);

    const loadVehicles = useCallback(async (): Promise<void> => {
        if (!selectedBusiness?.id) return;
        try {
            const data = await getBusinessVehicles(selectedBusiness.id);
            setVehicles(data.filter((v) => v.isActive));
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setVehicles([]);
        }
    }, [selectedBusiness?.id]);

    // Initial load
    const init = useCallback(async () => {
        if (!selectedBusiness?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            await Promise.all([loadIncoming(), loadActive(), loadVehicles()]);
        } catch (error) {
            console.error('Init error:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness?.id, loadIncoming, loadActive, loadVehicles]);

    useEffect(() => {
        init();
    }, [init]);

    // Auto-refresh polling (every 30 seconds)
    useEffect(() => {
        if (!selectedBusiness?.id) return;

        const poll = async () => {
            await Promise.all([loadIncoming(), loadActive()]);
        };

        pollingInterval.current = setInterval(poll, 30000); // 30 seconds

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [selectedBusiness?.id, loadIncoming, loadActive]);

    // Manual refresh
    const onRefresh = useCallback(async () => {
        if (!selectedBusiness?.id) return;
        setRefreshing(true);
        await Promise.all([loadIncoming(), loadActive(), loadVehicles()]);
        setRefreshing(false);
    }, [selectedBusiness?.id, loadIncoming, loadActive, loadVehicles]);

    // Accept delivery
    const openAcceptModal = (request: IncomingDeliveryRequest) => {
        if (vehicles.length === 0) {
            alert('Aucun véhicule actif. Ajoutez d\'abord un véhicule dans votre profil.');
            return;
        }
        setCurrentRequestToAccept(request);
        setSelectedVehicleId(null);
        setAcceptModalOpen(true);
    };

    const handleAcceptDelivery = async () => {
        if (!currentRequestToAccept || !selectedVehicleId) return;

        setActionLoadingId(currentRequestToAccept.id);
        // Optimistic update
        setIncomingRequests((prev) => prev.filter((r) => r.id !== currentRequestToAccept.id));

        try {
            await acceptDelivery(currentRequestToAccept.id, selectedVehicleId);
            setAcceptModalOpen(false);
            setCurrentRequestToAccept(null);
            await loadActive();
        } catch (error: any) {
            // Rollback
            setIncomingRequests((prev) => [currentRequestToAccept, ...prev]);
            alert(error.message || 'Impossible d\'accepter la livraison');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Reject delivery
    const handleReject = async (request: IncomingDeliveryRequest) => {
        if (!confirm('Êtes-vous sûr de vouloir refuser cette livraison ?')) return;

        setActionLoadingId(request.id);
        setIncomingRequests((prev) => prev.filter((r) => r.id !== request.id));

        try {
            await rejectDeliveryRequest(request.id);
        } catch (error) {
            setIncomingRequests((prev) => [request, ...prev]);
            alert('Impossible de refuser la demande');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Confirm pickup
    const handlePickup = async (requestId: string) => {
        if (!confirm('Avez-vous bien récupéré le colis chez le commerçant ?')) return;

        setActionLoadingId(requestId);
        // Optimistic update
        setActiveRequests((prev) =>
            prev.map((r) => (r.id === requestId ? { ...r, status: 'PICKED_UP' as any } : r))
        );

        try {
            await pickupDeliveryRequest(requestId);
            await loadActive();
        } catch (error: any) {
            // Rollback
            setActiveRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'ACTIVE' as any } : r)));
            alert(error.message || 'Impossible de confirmer le retrait');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Complete delivery
    const openCompleteModal = (requestId: string) => {
        setCurrentRequestId(requestId);
        setDeliveryCode('');
        setCompleteModalOpen(true);
    };

    const handleCompleteDelivery = async () => {
        if (!currentRequestId || !deliveryCode.trim()) {
            alert('Entrez le code de sécurité fourni par le client');
            return;
        }

        setValidating(true);
        const previousActive = activeRequests;
        setActiveRequests(activeRequests.filter((r) => r.id !== currentRequestId));

        try {
            await completeDelivery(currentRequestId, { deliveryCode: deliveryCode.trim() });
            alert('Livraison validée avec succès ! 🚀');
            setCompleteModalOpen(false);
            await loadActive();
        } catch (error: any) {
            setActiveRequests(previousActive);
            alert(error.message || 'Code incorrect ou erreur serveur');
        } finally {
            setValidating(false);
        }
    };

    // View details
    const openDetailsModal = (request: IncomingDeliveryRequest) => {
        setCurrentRequestDetails(request);
        setDetailsModalOpen(true);
    };

    // Formatting helpers
    const formatDistance = (meters: number) => (meters / 1000).toFixed(1);
    const formatCost = (cost: string) => parseInt(cost).toLocaleString();
    const getFeePayerLabel = (payer: 'SENDER' | 'RECEIVER') => (payer === 'SENDER' ? 'Commerçant' : 'Client');

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'En attente', color: '#92400E', bg: '#FEF3C7' };
            case 'ACTIVE':
            case 'ACCEPTED':
                return { label: 'Acceptée', color: '#1E40AF', bg: '#DBEAFE' };
            case 'PICKED_UP':
                return { label: 'Colis récupéré', color: '#166534', bg: '#DCFCE7' };
            default:
                return { label: status, color: '#666', bg: '#F3F4F6' };
        }
    };

    const getVehicleDisplayName = (vehicle: Vehicle) => {
        if (vehicle.name) return vehicle.name;
        return `${vehicle.brand} ${vehicle.model}`;
    };

    const data = tab === 'INCOMING' ? incomingRequests : activeRequests;

    if (loading) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="LIVREUR" title="Courses">
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement des demandes...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Courses">
                <div className={styles.container}>
                    {/* Header with refresh */}
                    <div className={styles.header}>
                        <div>
                            <h1>Mes Courses</h1>
                            <p className={styles.subtitle}>Auto-actualisation toutes les 30s</p>
                        </div>
                        <button
                            onClick={onRefresh}
                            className={styles.refreshBtn}
                            disabled={refreshing}
                        >
                            {refreshing ? '🔄' : '↻'} Actualiser
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${tab === 'INCOMING' ? styles.tabActive : ''}`}
                            onClick={() => setTab('INCOMING')}
                        >
                            En attente ({incomingRequests.length})
                        </button>
                        <button
                            className={`${styles.tab} ${tab === 'ACTIVE' ? styles.tabActive : ''}`}
                            onClick={() => setTab('ACTIVE')}
                        >
                            En cours ({activeRequests.length})
                        </button>
                    </div>

                    {/* List */}
                    <div className={styles.list}>
                        {data.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>
                                    {tab === 'INCOMING' ? '📬' : '🚴'}
                                </span>
                                <h3>
                                    {tab === 'INCOMING' ? 'Aucune demande en attente' : 'Aucune livraison en cours'}
                                </h3>
                                <p>
                                    {tab === 'INCOMING'
                                        ? 'Les nouvelles demandes apparaîtront ici'
                                        : 'Une fois acceptée, vos courses seront listées ici'}
                                </p>
                            </div>
                        ) : (
                            data.map((item) => {
                                const distanceKm = formatDistance(item.distanceMeters);
                                const statusConfig = getStatusConfig(item.status);
                                const isPending = item.status === 'PENDING';
                                const isActive = item.status === 'ACCEPTED' || item.status === 'ACTIVE';
                                const isPickedUp = item.status === 'PICKED_UP';
                                const isActionLoading = actionLoadingId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={styles.card}
                                        onClick={() => isPending && openDetailsModal(item)}
                                        style={{ cursor: isPending ? 'pointer' : 'default' }}
                                    >
                                        {/* Header */}
                                        <div className={styles.cardHeader}>
                                            <div className={styles.senderRow}>
                                                {item.sender.logoUrl ? (
                                                    <img src={item.sender.logoUrl} alt="" className={styles.senderLogo} />
                                                ) : (
                                                    <div className={styles.logoPlaceholder}>🏪</div>
                                                )}
                                                <div>
                                                    <div className={styles.senderName}>{item.sender.name}</div>
                                                    <div className={styles.orderNumber}>Commande #{item.order.orderNumber}</div>
                                                </div>
                                            </div>
                                            <div className={styles.statusChip} style={{ Background: statusConfig.bg, color: statusConfig.color }}>
                                                {statusConfig.label}
                                            </div>
                                        </div>

                                        {/* Addresses */}
                                        <div className={styles.addressRow}>
                                            <span>🏪</span>
                                            <span className={styles.addressText}>{item.pickupAddress}</span>
                                        </div>
                                        <div className={styles.addressRow}>
                                            <span>📍</span>
                                            <span className={styles.addressText}>{item.deliveryAddress}</span>
                                        </div>

                                        {/* Meta */}
                                        <div className={styles.metaRow}>
                                            <div className={styles.metaItem}>
                                                <span>🧭</span> {distanceKm} km
                                            </div>
                                            <div className={styles.metaItem}>
                                                <span>💰</span> {formatCost(item.estimatedCost)} KMF
                                            </div>
                                            <div className={styles.metaItem}>
                                                <span>💳</span> {getFeePayerLabel(item.feePayer)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {isPending && (
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(item);
                                                    }}
                                                    disabled={isActionLoading}
                                                >
                                                    Refuser
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.acceptBtn}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openAcceptModal(item);
                                                    }}
                                                    disabled={isActionLoading}
                                                >
                                                    Accepter
                                                </button>
                                            </div>
                                        )}

                                        {isActive && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.pickupBtn}`}
                                                onClick={() => handlePickup(item.id)}
                                                disabled={isActionLoading}
                                            >
                                                ✅ Confirmer le retrait du colis
                                            </button>
                                        )}

                                        {isPickedUp && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.completeBtn}`}
                                                onClick={() => openCompleteModal(item.id)}
                                            >
                                                ✔️ Valider la livraison
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Accept Modal */}
                    {acceptModalOpen && (
                        <div className={styles.modalOverlay} onClick={() => setAcceptModalOpen(false)}>
                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2>Choisir un véhicule</h2>
                                    <button onClick={() => setAcceptModalOpen(false)}>✕</button>
                                </div>
                                <div className={styles.modalBody}>
                                    {vehicles.map((vehicle) => (
                                        <div
                                            key={vehicle.id}
                                            className={`${styles.vehicleOption} ${selectedVehicleId === vehicle.id ? styles.selected : ''}`}
                                            onClick={() => setSelectedVehicleId(vehicle.id)}
                                        >
                                            <span className={styles.radio}>
                                                {selectedVehicleId === vehicle.id ? '●' : '○'}
                                            </span>
                                            <span>{getVehicleDisplayName(vehicle)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.modalFooter}>
                                    <button onClick={() => setAcceptModalOpen(false)} className={styles.cancelBtn}>
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleAcceptDelivery}
                                        className={styles.confirmBtn}
                                        disabled={!selectedVehicleId}
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete Modal */}
                    {completeModalOpen && (
                        <div className={styles.modalOverlay} onClick={() => !validating && setCompleteModalOpen(false)}>
                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2>Valider la livraison</h2>
                                    <button onClick={() => !validating && setCompleteModalOpen(false)}>✕</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <p className={styles.modalDesc}>Demandez au client le code de sécurité à 4 chiffres.</p>
                                    <input
                                        type="text"
                                        className={styles.codeInput}
                                        placeholder="Ex: 1234"
                                        value={deliveryCode}
                                        onChange={(e) => setDeliveryCode(e.target.value)}
                                        maxLength={10}
                                        disabled={validating}
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.modalFooter}>
                                    <button onClick={() => !validating && setCompleteModalOpen(false)} className={styles.cancelBtn} disabled={validating}>
                                        Annuler
                                    </button>
                                    <button onClick={handleCompleteDelivery} className={styles.confirmBtn} disabled={validating}>
                                        {validating ? 'Validation...' : 'Valider'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Modal */}
                    {detailsModalOpen && currentRequestDetails && (
                        <div className={styles.modalOverlay} onClick={() => setDetailsModalOpen(false)}>
                            <div className={`${styles.modal} ${styles.detailsModal}`} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2>Détails de la demande</h2>
                                    <button onClick={() => setDetailsModalOpen(false)}>✕</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.detailSection}>
                                        <h3>Commerçant</h3>
                                        <p>{currentRequestDetails.sender.name}</p>
                                    </div>
                                    <div className={styles.detailSection}>
                                        <h3>Commande</h3>
                                        <p>#{currentRequestDetails.order.orderNumber}</p>
                                        {currentRequestDetails.order.notes && <p className={styles.notes}>{currentRequestDetails.order.notes}</p>}
                                    </div>
                                    <div className={styles.detailSection}>
                                        <h3>Retrait</h3>
                                        <p>{currentRequestDetails.pickupAddress}</p>
                                    </div>
                                    <div className={styles.detailSection}>
                                        <h3>Livraison</h3>
                                        <p>{currentRequestDetails.deliveryAddress}</p>
                                        {currentRequestDetails.deliveryNotes && <p className={styles.notes}>{currentRequestDetails.deliveryNotes}</p>}
                                    </div>
                                    <div className={styles.detailSection}>
                                        <h3>Informations</h3>
                                        <p>Distance: {formatDistance(currentRequestDetails.distanceMeters)} km</p>
                                        <p>Coût: {formatCost(currentRequestDetails.estimatedCost)} KMF</p>
                                        <p>Payé par: {getFeePayerLabel(currentRequestDetails.feePayer)}</p>
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button onClick={() => { setDetailsModalOpen(false); handleReject(currentRequestDetails); }} className={styles.rejectBtn}>
                                        Refuser
                                    </button>
                                    <button onClick={() => { setDetailsModalOpen(false); openAcceptModal(currentRequestDetails); }} className={styles.acceptBtn}>
                                        Accepter
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
