'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { useRouter, useParams } from 'next/navigation';
import {
    getBusinessInventory,
    mapInventoryToDisplay,
    InventoryDisplayItem,
    adjustVariantStock,
    AdjustPayload,
    BatchPayload,
    addVariantBatch,
    getVariantBatches,
    Batch
} from '@/lib/api/inventory';
import styles from './detail.module.css';

// === Types ===
type OperationType = 'Entrée' | 'Sortie' | 'Ajustement';
type Motif =
    | 'Reception de stock'
    | 'Retour client'
    | 'Inventaire'
    | 'Défectueux'
    | 'Produit périmé'
    | 'Autre';

const operationTypes: readonly OperationType[] = ['Entrée', 'Sortie', 'Ajustement'];
const motifs: readonly Motif[] = [
    'Reception de stock',
    'Retour client',
    'Inventaire',
    'Défectueux',
    'Produit périmé',
    'Autre',
];

export default function StockAdjustmentPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { selectedBusiness } = useBusinessStore();
    const businessId = selectedBusiness?.id;

    // === États ===
    const [inventory, setInventory] = useState<InventoryDisplayItem[]>([]);
    const [operationType, setOperationType] = useState<OperationType>('Entrée');
    const [quantity, setQuantity] = useState<number>(1);
    const [motif, setMotif] = useState<Motif>('Reception de stock');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Modal form state
    const [batchQuantity, setBatchQuantity] = useState<number>(1);
    const [batchExpDate, setBatchExpDate] = useState<string>('');
    const [batchSubmitting, setBatchSubmitting] = useState(false);

    // Dropdowns
    const [showOperationType, setShowOperationType] = useState(false);
    const [showMotif, setShowMotif] = useState(false);
    const [showBatch, setShowBatch] = useState(false);

    // === Charger l'inventaire ===
    const fetchInventory = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            const res = await getBusinessInventory(businessId, 1, 100);
            const mapped = mapInventoryToDisplay(res.data);
            setInventory(mapped);
        } catch (err) {
            console.error('Erreur chargement inventaire:', err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    // === Charger les lots du variant ===
    const fetchBatches = useCallback(async () => {
        if (!productId) return;
        try {
            const data = await getVariantBatches(productId);
            setBatches(data);
            if (data.length > 0) {
                setSelectedBatchId(data[0].id);
            }
        } catch (err) {
            console.error('Erreur chargement lots:', err);
        }
    }, [productId]);

    useEffect(() => {
        fetchInventory();
        fetchBatches();
    }, [fetchInventory, fetchBatches]);

    // === Produit courant ===
    const currentProduct = useMemo(() => {
        if (!productId || inventory.length === 0) return null;
        return inventory.find((item) => item.id === productId) || null;
    }, [inventory, productId]);

    // === Ajustement du stock ===
    const handleAdjust = async () => {
        if (!currentProduct || !quantity || !motif) {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        setSubmitting(true);

        try {
            let quantityChange: number;
            let type: 'RETURN' | 'LOSS' | 'ADJUSTMENT' | 'EXPIRATION';

            if (operationType === 'Entrée') {
                quantityChange = +quantity;
                type = motif === 'Retour client' ? 'RETURN' : 'ADJUSTMENT';
            } else if (operationType === 'Sortie') {
                quantityChange = -quantity;
                type =
                    motif === 'Produit périmé'
                        ? 'EXPIRATION'
                        : motif === 'Défectueux'
                            ? 'LOSS'
                            : 'LOSS';
            } else {
                quantityChange = quantity;
                type = 'ADJUSTMENT';
            }

            const payload: AdjustPayload = {
                quantityChange,
                type,
                reason: motif,
                ...(selectedBatchId && { batchId: selectedBatchId }),
            };

            await adjustVariantStock(currentProduct.id, payload);

            alert(`✅ Stock ajusté : ${quantityChange >= 0 ? '+' : ''}${quantityChange} unité(s)`);
            setQuantity(1);
            fetchInventory();
            fetchBatches();
        } catch (err: any) {
            alert(`❌ Erreur : ${err.message || "Échec de l'ajustement du stock"}`);
        } finally {
            setSubmitting(false);
        }
    };

    // === Ajout de lot ===
    const handleAddBatch = async () => {
        if (!currentProduct || batchQuantity <= 0 || !batchExpDate) {
            alert('Veuillez remplir tous les champs du lot.');
            return;
        }

        setBatchSubmitting(true);

        try {
            const payload: BatchPayload = {
                quantity: batchQuantity,
                expirationDate: batchExpDate,
            };

            await addVariantBatch(currentProduct.id, payload);

            alert(`✅ ${batchQuantity} unité(s) ajoutée(s) au stock !`);
            setModalVisible(false);
            setBatchQuantity(1);
            setBatchExpDate('');
            fetchInventory();
            fetchBatches();
        } catch (err: any) {
            alert(`❌ Erreur : ${err.message || "Impossible d'ajouter le lot"}`);
        } finally {
            setBatchSubmitting(false);
        }
    };

    // === Format date for batch display ===
    const formatBatchLabel = (batch: Batch) => {
        const expDate = new Date(batch.expirationDate).toLocaleDateString('fr-FR');
        return `Lot (${batch.quantity} unités) - Exp: ${expDate}`;
    };

    // === Loading state ===
    if (loading && inventory.length === 0) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Ajustement de Stock">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Chargement de l'inventaire...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    // === Product not found ===
    if (!loading && !currentProduct) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Ajustement de Stock">
                    <div className={styles.errorContainer}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <h3>Produit non trouvé</h3>
                        <p>ID: {productId}</p>
                        <button onClick={() => router.back()} className={styles.backButton}>
                            Retour
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Ajustement de Stock">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button onClick={() => router.back()} className={styles.backBtn}>
                            ← Retour
                        </button>
                        <h1 className={styles.title}>Ajustement de Stock</h1>
                    </div>

                    {/* Product Card */}
                    {currentProduct && (
                        <div className={styles.productCard}>
                            <div className={styles.productImage}>
                                {currentProduct.imageUrl ? (
                                    <img src={currentProduct.imageUrl} alt={currentProduct.name} />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className={styles.productInfo}>
                                <div className={styles.productHeader}>
                                    <h2 className={styles.productName}>{currentProduct.name}</h2>
                                    <span
                                        className={styles.stockBadge}
                                        style={{
                                            backgroundColor: currentProduct.quantityInStock <= 10 ? '#fef3cd' : '#d4edda',
                                            color: currentProduct.quantityInStock <= 10 ? '#856404' : '#155724',
                                        }}
                                    >
                                        {currentProduct.quantityInStock <= 10 ? 'Faible' : 'OK'}
                                    </span>
                                </div>
                                <p className={styles.sku}>SKU: {currentProduct.sku}</p>

                                <div className={styles.productDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Prix Unitaire</span>
                                        <span className={styles.detailValue}>{currentProduct.price} KMF</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Stock Actuel</span>
                                        <span className={styles.detailValue}>{currentProduct.quantityInStock} unités</span>
                                    </div>
                                </div>

                                <button
                                    className={styles.consultButton}
                                    onClick={() => setModalVisible(true)}
                                >
                                    + Ajouter un lot
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className={styles.formSection}>
                        {/* Type d'Opération */}
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Type d'Opération <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <button
                                    className={styles.select}
                                    onClick={() => {
                                        setShowOperationType(!showOperationType);
                                        setShowMotif(false);
                                        setShowBatch(false);
                                    }}
                                >
                                    <span>{operationType}</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {showOperationType && (
                                    <div className={styles.dropdown}>
                                        {operationTypes.map((type) => (
                                            <button
                                                key={type}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setOperationType(type);
                                                    setShowOperationType(false);
                                                    if (type !== 'Ajustement') setQuantity(Math.abs(quantity));
                                                }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lot spécifique */}
                        {batches.length > 0 && (
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Lot spécifique
                                </label>
                                <div className={styles.selectWrapper}>
                                    <button
                                        className={styles.select}
                                        onClick={() => {
                                            setShowBatch(!showBatch);
                                            setShowOperationType(false);
                                            setShowMotif(false);
                                        }}
                                    >
                                        <span>
                                            {selectedBatchId
                                                ? formatBatchLabel(batches.find(b => b.id === selectedBatchId)!)
                                                : 'Sélectionner un lot'
                                            }
                                        </span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    {showBatch && (
                                        <div className={styles.dropdown}>
                                            {batches.map((batch) => (
                                                <button
                                                    key={batch.id}
                                                    className={styles.dropdownItem}
                                                    onClick={() => {
                                                        setSelectedBatchId(batch.id);
                                                        setShowBatch(false);
                                                    }}
                                                >
                                                    {formatBatchLabel(batch)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quantité */}
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Quantité <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.quantityContainer}>
                                <button
                                    className={styles.quantityButton}
                                    onClick={() => setQuantity(Math.max(1, Math.abs(quantity) - 1))}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <input
                                    type="number"
                                    className={styles.quantityInput}
                                    value={Math.abs(quantity)}
                                    onChange={(e) => {
                                        const num = parseInt(e.target.value, 10);
                                        if (!isNaN(num) && num >= 0) {
                                            setQuantity(quantity < 0 ? -num : num);
                                        }
                                    }}
                                    min={1}
                                />
                                <button
                                    className={styles.quantityButton}
                                    onClick={() => setQuantity(Math.abs(quantity) + 1)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <span className={styles.unitLabel}>Unité(s)</span>
                            </div>

                            {/* Toggle pour Ajustement */}
                            {operationType === 'Ajustement' && (
                                <div className={styles.toggleContainer}>
                                    <button
                                        className={`${styles.toggleBtn} ${quantity >= 0 ? styles.toggleActive : ''}`}
                                        onClick={() => setQuantity(Math.abs(quantity))}
                                    >
                                        + Ajout
                                    </button>
                                    <button
                                        className={`${styles.toggleBtn} ${quantity < 0 ? styles.toggleActive : ''}`}
                                        onClick={() => setQuantity(-Math.abs(quantity))}
                                    >
                                        - Retrait
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Motif */}
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Motif <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <button
                                    className={styles.select}
                                    onClick={() => {
                                        setShowMotif(!showMotif);
                                        setShowOperationType(false);
                                        setShowBatch(false);
                                    }}
                                >
                                    <span>{motif}</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {showMotif && (
                                    <div className={styles.dropdown}>
                                        {motifs.map((m) => (
                                            <button
                                                key={m}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setMotif(m);
                                                    setShowMotif(false);
                                                }}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className={styles.bottomActions}>
                        <button
                            className={styles.cancelButton}
                            onClick={() => router.back()}
                        >
                            Annuler
                        </button>
                        <button
                            className={`${styles.validateButton} ${submitting ? styles.validateButtonDisabled : ''}`}
                            onClick={handleAdjust}
                            disabled={submitting}
                        >
                            {submitting ? 'Validation...' : 'Valider'}
                        </button>
                    </div>
                </div>

                {/* Modal Ajouter Lot */}
                {modalVisible && (
                    <div className={styles.modalOverlay} onClick={() => setModalVisible(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Ajouter un nouveau lot</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setModalVisible(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        Quantité <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={batchQuantity}
                                        onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 0)}
                                        min={1}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        Date d'expiration <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={batchExpDate}
                                        onChange={(e) => setBatchExpDate(e.target.value)}
                                    />
                                </div>

                                <button
                                    className={`${styles.validateButton} ${batchSubmitting ? styles.validateButtonDisabled : ''}`}
                                    onClick={handleAddBatch}
                                    disabled={batchSubmitting}
                                    style={{ width: '100%', marginTop: '16px' }}
                                >
                                    {batchSubmitting ? 'Ajout en cours...' : 'Ajouter le lot'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
