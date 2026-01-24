'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import axiosInstance from '@/lib/api/axiosInstance';
import styles from './stock-adjustment.module.css';

const OPERATION_TYPES = [
    { value: 'IN', label: 'Entrée' },
    { value: 'OUT', label: 'Sortie' },
];

const MOTIVES = [
    { value: 'RECEPTION', label: 'Reception de stock' },
    { value: 'RETURN', label: 'Retour client' },
    { value: 'LOSS', label: 'Perte' },
    { value: 'DAMAGE', label: 'Dommage' },
    { value: 'EXPIRED', label: 'Expiré' },
    { value: 'ADJUSTMENT', label: 'Ajustement inventaire' },
    { value: 'OTHER', label: 'Autre' },
];

function StockAdjustmentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedBusiness } = useBusinessStore();

    const variantId = searchParams.get('variantId');
    const productName = searchParams.get('productName') || 'Produit';
    const sku = searchParams.get('sku') || '';
    const price = parseFloat(searchParams.get('price') || '0');
    const currentStock = parseInt(searchParams.get('stock') || '0', 10);
    const imageUrl = searchParams.get('imageUrl') || '';

    const [operationType, setOperationType] = useState('IN');
    const [batchId, setBatchId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [motive, setMotive] = useState('RECEPTION');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness || !variantId) return;

        try {
            setSubmitting(true);
            setError(null);

            await axiosInstance.post(`/businesses/${selectedBusiness.id}/inventory/movements`, {
                variantId,
                batchId: batchId || undefined,
                type: operationType,
                quantity,
                reason: motive,
            });

            router.back();
        } catch (err: any) {
            console.error('Error adjusting stock:', err);
            setError(err?.response?.data?.message || 'Erreur lors de l\'ajustement');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (val: number) => {
        return new Intl.NumberFormat('fr-FR').format(val);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    ‹
                </button>
                <h1 className={styles.title}>Ajustement de Stock</h1>
            </div>

            {/* Product Info Card */}
            <div className={styles.productCard}>
                {imageUrl && (
                    <img src={imageUrl} alt={productName} className={styles.productImage} />
                )}
                <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                        <h2 className={styles.productName}>{productName}</h2>
                        <span className={styles.statusBadge}>OK</span>
                    </div>
                    <p className={styles.productSku}>SKU: {sku}</p>
                    <div className={styles.productDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Prix Unitaire</span>
                            <span className={styles.detailValue}>{formatPrice(price)} KMF</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Stock Actuel</span>
                            <span className={styles.detailValue}>{currentStock}</span>
                        </div>
                    </div>
                    <button className={styles.viewProductLink} onClick={() => router.push(`/dashboard/fournisseur/products/inventory/${variantId}`)}>
                        Consulter le produit →
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Operation Type */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Type d&apos;Opération *</label>
                    <select
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value)}
                        className={styles.select}
                    >
                        {OPERATION_TYPES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Batch */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lot spécifique *</label>
                    <input
                        type="text"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        placeholder="Ex: Lot #002 (5 unités) Exp: 30/11/2025"
                        className={styles.input}
                    />
                </div>

                {/* Quantity */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Quantité *</label>
                    <div className={styles.quantityControl}>
                        <button
                            type="button"
                            className={styles.quantityBtn}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            -
                        </button>
                        <span className={styles.quantityValue}>{quantity}</span>
                        <button
                            type="button"
                            className={styles.quantityBtn}
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                        <span className={styles.quantityUnit}>Unité(s)</span>
                    </div>
                </div>

                {/* Motive */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Motif *</label>
                    <select
                        value={motive}
                        onChange={(e) => setMotive(e.target.value)}
                        className={styles.select}
                    >
                        {MOTIVES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                {/* Actions */}
                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => router.back()}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? 'En cours...' : 'Valider'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function StockAdjustmentPage() {
    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Ajustement de Stock">
                <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>}>
                    <StockAdjustmentContent />
                </Suspense>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

