'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getIncomingDeliveryRequests,
    getActiveDeliveryRequests,
    getBusinessVehicles,
    acceptDelivery,
    rejectDeliveryRequest,
    pickupDeliveryRequest,
    completeDelivery,
    IncomingDeliveryRequest,
    Vehicle
} from '@/lib/api/delivery';
import styles from './tasks.module.css';

type TabType = 'INCOMING' | 'ACTIVE';

export default function LivreurTasksPage() {
    const { selectedBusiness } = useBusinessStore();

    // États
    const [tab, setTab] = useState<TabType>('INCOMING');
    const [incomingRequests, setIncomingRequests] = useState<IncomingDeliveryRequest[]>([]);
    const [activeRequests, setActiveRequests] = useState<IncomingDeliveryRequest[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Modal Acceptation avec choix véhicule
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    const [currentRequestToAccept, setCurrentRequestToAccept] = useState<IncomingDeliveryRequest | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    // Modal Validation livraison
    const [completeModalVisible, setCompleteModalVisible] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
    const [deliveryCode, setDeliveryCode] = useState('');
    const [validating, setValidating] = useState(false);

    // Modal Détails
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [currentRequestDetails, setCurrentRequestDetails] = useState<IncomingDeliveryRequest | null>(null);

    // Chargement des données
    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            const [incoming, active, vehiclesData] = await Promise.all([
                getIncomingDeliveryRequests(selectedBusiness.id),
                getActiveDeliveryRequests(selectedBusiness.id),
                getBusinessVehicles(selectedBusiness.id)
            ]);

            setIncomingRequests(incoming);
            setActiveRequests(active);
            setVehicles(vehiclesData.filter(v => v.isActive));
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Formatages
    const formatDistance = (meters: number) => (meters / 1000).toFixed(1);
    const formatCost = (cost: string | number) => {
        const num = typeof cost === 'string' ? parseInt(cost) : cost;
        return num.toLocaleString();
    };
    const getFeePayerLabel = (payer: 'SENDER' | 'RECEIVER') =>
        payer === 'SENDER' ? 'Commerçant' : 'Client';

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'En attente', color: '#92400E', bg: '#FEF3C7' };
            case 'ACCEPTED':
            case 'ACTIVE':
                return { label: 'Acceptée', color: '#1E40AF', bg: '#DBEAFE' };
            case 'PICKED_UP':
                return { label: 'Colis récupéré', color: '#166534', bg: '#DCFCE7' };
            default:
                return { label: status, color: '#666', bg: '#F3F4F6' };
        }
    };

    // Ouvrir modal acceptation
    const openAcceptModal = (request: IncomingDeliveryRequest) => {
        if (vehicles.length === 0) {
            alert('Aucun véhicule actif. Ajoutez un véhicule dans votre profil.');
            return;
        }
        setCurrentRequestToAccept(request);
        setSelectedVehicleId(null);
        setAcceptModalVisible(true);
    };

    // Accepter livraison
    const handleAcceptDelivery = async () => {
        if (!currentRequestToAccept || !selectedVehicleId) return;

        setActionLoadingId(currentRequestToAccept.id);

        try {
            await acceptDelivery(currentRequestToAccept.id, selectedVehicleId);
            alert('✅ Livraison acceptée !');
            setAcceptModalVisible(false);
            setCurrentRequestToAccept(null);
            await loadData();
        } catch (error: any) {
            console.error('Erreur acceptation:', error);
            alert(error?.response?.data?.message || 'Impossible d\'accepter');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Refuser livraison
    const handleReject = async (request: IncomingDeliveryRequest) => {
        if (!confirm('Refuser cette livraison ?')) return;

        setActionLoadingId(request.id);

        try {
            await rejectDeliveryRequest(request.id);
            setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
        } catch (error) {
            console.error('Erreur refus:', error);
            alert('Impossible de refuser');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Confirmer retrait
    const handlePickup = async (requestId: string) => {
        if (!confirm('Confirmer le retrait du colis ?')) return;

        setActionLoadingId(requestId);

        try {
            await pickupDeliveryRequest(requestId);
            alert('✅ Retrait confirmé ! En route vers le client 🚀');
            await loadData();
        } catch (error: any) {
            console.error('Erreur pickup:', error);
            alert(error?.response?.data?.message || 'Impossible de confirmer');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Ouvrir modal validation
    const openCompleteModal = (requestId: string) => {
        setCurrentRequestId(requestId);
        setDeliveryCode('');
        setCompleteModalVisible(true);
    };

    // Valider livraison
    const handleCompleteDelivery = async () => {
        if (!currentRequestId || !deliveryCode.trim()) {
            alert('Entrez le code de sécurité');
            return;
        }

        setValidating(true);

        try {
            await completeDelivery(currentRequestId, { deliveryCode: deliveryCode.trim() });
            alert('✅ Livraison validée ! Merci 🚀');
            setCompleteModalVisible(false);
            await loadData();
        } catch (error: any) {
            console.error('Erreur validation:', error);
            alert(error?.response?.data?.message || 'Code incorrect');
        } finally {
            setValidating(false);
        }
    };

    // Ouvrir détails
    const openDetailsModal = (request: IncomingDeliveryRequest) => {
        setCurrentRequestDetails(request);
        setDetailsModalVisible(true);
    };

    const data = tab === 'INCOMING' ? incomingRequests : activeRequests;

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Missions">
                <div className={styles.container}>
                    {/* Onglets - Comme mobile */}
                    <div className={styles.tabsContainer}>
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

                    {/* Bouton refresh */}
                    <button
                        className={styles.refreshBtn}
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? '⏳ Actualisation...' : '🔄 Actualiser'}
                    </button>

                    {/* Liste des demandes */}
                    <div className={styles.tasksList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Chargement des demandes...</p>
                            </div>
                        ) : data.length > 0 ? (
                            data.map((request) => {
                                const statusConfig = getStatusConfig(request.status);
                                const isPending = request.status === 'PENDING';
                                const isActive = request.status === 'ACCEPTED' || request.status === 'ACTIVE';
                                const isPickedUp = request.status === 'PICKED_UP';
                                const isLoading = actionLoadingId === request.id;

                                return (
                                    <div
                                        key={request.id}
                                        className={styles.taskCard}
                                        onClick={() => isPending && openDetailsModal(request)}
                                        style={{ cursor: isPending ? 'pointer' : 'default' }}
                                    >
                                        {/* Header */}
                                        <div className={styles.cardHeader}>
                                            <div className={styles.senderInfo}>
                                                {request.sender.logoUrl ? (
                                                    <img
                                                        src={request.sender.logoUrl}
                                                        alt={request.sender.name}
                                                        className={styles.senderLogo}
                                                    />
                                                ) : (
                                                    <div className={styles.senderLogoPlaceholder}>🏪</div>
                                                )}
                                                <div>
                                                    <span className={styles.senderName}>{request.sender.name}</span>
                                                    <span className={styles.orderNumber}>
                                                        Commande #{request.order.orderNumber}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={styles.statusChip}
                                                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Adresses */}
                                        <div className={styles.addresses}>
                                            <div className={styles.addressRow}>
                                                <span className={styles.addressIcon}>🏪</span>
                                                <span>{request.pickupAddress}</span>
                                            </div>
                                            <div className={styles.addressRow}>
                                                <span className={styles.addressIcon}>📍</span>
                                                <span>{request.deliveryAddress}</span>
                                            </div>
                                        </div>

                                        {/* Méta */}
                                        <div className={styles.metaRow}>
                                            <span>📏 {formatDistance(request.distanceMeters)} km</span>
                                            <span>💰 {formatCost(request.estimatedCost)} KMF</span>
                                            <span>💳 {getFeePayerLabel(request.feePayer)}</span>
                                        </div>

                                        {/* Actions pour PENDING */}
                                        {isPending && (
                                            <>
                                                <div className={styles.detailsHint}>
                                                    ℹ️ Touchez pour voir les détails
                                                </div>
                                                <div className={styles.actionsRow}>
                                                    <button
                                                        className={styles.rejectBtn}
                                                        onClick={(e) => { e.stopPropagation(); handleReject(request); }}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? '...' : 'Refuser'}
                                                    </button>
                                                    <button
                                                        className={styles.acceptBtn}
                                                        onClick={(e) => { e.stopPropagation(); openAcceptModal(request); }}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? '...' : 'Accepter'}
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Bouton pickup pour ACTIVE */}
                                        {isActive && (
                                            <button
                                                className={styles.pickupBtn}
                                                onClick={() => handlePickup(request.id)}
                                                disabled={isLoading}
                                            >
                                                📦 Confirmer le retrait du colis
                                            </button>
                                        )}

                                        {/* Bouton valider pour PICKED_UP */}
                                        {isPickedUp && (
                                            <button
                                                className={styles.completeBtn}
                                                onClick={() => openCompleteModal(request.id)}
                                            >
                                                ✅ Valider la livraison
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>
                                    {tab === 'INCOMING' ? '📬' : '🛵'}
                                </span>
                                <h3>
                                    {tab === 'INCOMING'
                                        ? 'Aucune demande en attente'
                                        : 'Aucune livraison en cours'}
                                </h3>
                                <p>
                                    {tab === 'INCOMING'
                                        ? 'Les nouvelles demandes apparaîtront ici.'
                                        : 'Acceptez des demandes pour commencer.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Choix Véhicule */}
                {acceptModalVisible && (
                    <div className={styles.modalOverlay} onClick={() => setAcceptModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Choisir un véhicule</h2>
                                <button className={styles.modalClose} onClick={() => setAcceptModalVisible(false)}>✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                {vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className={`${styles.vehicleOption} ${selectedVehicleId === vehicle.id ? styles.vehicleSelected : ''}`}
                                        onClick={() => setSelectedVehicleId(vehicle.id)}
                                    >
                                        <span className={styles.vehicleRadio}>
                                            {selectedVehicleId === vehicle.id ? '🔘' : '⚪'}
                                        </span>
                                        <span>
                                            {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={() => setAcceptModalVisible(false)}>
                                    Annuler
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleAcceptDelivery}
                                    disabled={!selectedVehicleId}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Validation Code */}
                {completeModalVisible && (
                    <div className={styles.modalOverlay} onClick={() => !validating && setCompleteModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Valider la livraison</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => !validating && setCompleteModalVisible(false)}
                                    disabled={validating}
                                >✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <p className={styles.modalHint}>
                                    Demandez au client le code de sécurité à 4 chiffres.
                                </p>
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
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => !validating && setCompleteModalVisible(false)}
                                    disabled={validating}
                                >
                                    Annuler
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleCompleteDelivery}
                                    disabled={validating}
                                >
                                    {validating ? 'Validation...' : 'Valider'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Détails */}
                {detailsModalVisible && currentRequestDetails && (
                    <div className={styles.modalOverlay} onClick={() => setDetailsModalVisible(false)}>
                        <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Détails de la demande</h2>
                                <button className={styles.modalClose} onClick={() => setDetailsModalVisible(false)}>✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.detailSection}>
                                    <h4>Commerçant</h4>
                                    <p>{currentRequestDetails.sender.name}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h4>Commande</h4>
                                    <p>#{currentRequestDetails.order.orderNumber}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h4>Retrait</h4>
                                    <p>{currentRequestDetails.pickupAddress}</p>
                                </div>
                                <div className={styles.detailSection}>
                                    <h4>Livraison</h4>
                                    <p>{currentRequestDetails.deliveryAddress}</p>
                                    {currentRequestDetails.deliveryNotes && (
                                        <p className={styles.notes}>📝 {currentRequestDetails.deliveryNotes}</p>
                                    )}
                                </div>
                                <div className={styles.detailSection}>
                                    <h4>Informations</h4>
                                    <p>Distance : {formatDistance(currentRequestDetails.distanceMeters)} km</p>
                                    <p>Coût : {formatCost(currentRequestDetails.estimatedCost)} KMF</p>
                                    <p>Payé par : {getFeePayerLabel(currentRequestDetails.feePayer)}</p>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => { setDetailsModalVisible(false); handleReject(currentRequestDetails); }}
                                >
                                    Refuser
                                </button>
                                <button
                                    className={styles.acceptBtn}
                                    onClick={() => { setDetailsModalVisible(false); openAcceptModal(currentRequestDetails); }}
                                >
                                    Accepter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
