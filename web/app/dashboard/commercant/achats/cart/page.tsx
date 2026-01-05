'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useProCartStore } from '@/stores/proCartStore';
import { passMultipleOrders } from '@/lib/api/orders';
import { useBusinessStore } from '@/stores/businessStore';
import styles from './cart.module.css';

// Icons
const icons = {
    back: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    cart: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    trash: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    minus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
};

export default function CartPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { selectedBusiness } = useBusinessStore();

    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
    } = useProCartStore();

    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    const handleCheckout = async () => {
        if (items.length === 0) {
            setError('Votre panier est vide');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                items: items.map((item) => ({
                    variantId: item.variant.id,
                    quantity: item.quantity,
                })),
                useWallet: true,
            };

            const orders = await passMultipleOrders(payload);
            console.log('Commandes créées:', orders);

            clearCart();

            alert(`✅ ${orders.length} commande(s) créée(s) avec succès !`);
            router.push('/dashboard/commercant/achats');
        } catch (err: any) {
            console.error('Erreur checkout:', err);
            setError(err.message || 'Erreur lors de la commande');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => price.toLocaleString('fr-FR');

    // Group items by supplier
    const itemsBySupplier = items.reduce((acc, item) => {
        const key = item.supplierBusinessId;
        if (!acc[key]) {
            acc[key] = {
                supplierName: item.supplierName || 'Fournisseur',
                items: [],
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {} as Record<string, { supplierName: string; items: typeof items }>);

    if (items.length === 0) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Mon Panier">
                    <div className={styles.emptyContainer}>
                        <div className={styles.emptyIcon}>{icons.cart}</div>
                        <h2 className={styles.emptyTitle}>Votre panier est vide</h2>
                        <p className={styles.emptyText}>Ajoutez des produits pour passer commande</p>
                        <Link href="/dashboard/commercant/achats" className={styles.continueBtn}>
                            Continuer mes achats
                        </Link>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Mon Panier">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <Link href="/dashboard/commercant/achats" className={styles.backButton}>
                            {icons.back}
                        </Link>
                        <h1 className={styles.title}>Mon Panier ({totalItems})</h1>
                        <button className={styles.clearButton} onClick={clearCart}>
                            Vider
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Cart Items grouped by supplier */}
                    <div className={styles.cartContent}>
                        {Object.entries(itemsBySupplier).map(([supplierId, group]) => (
                            <div key={supplierId} className={styles.supplierGroup}>
                                <h3 className={styles.supplierTitle}>{group.supplierName}</h3>
                                {group.items.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.productName} />
                                            ) : (
                                                <span className={styles.imagePlaceholder}>📦</span>
                                            )}
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h4 className={styles.itemName}>{item.productName}</h4>
                                            <p className={styles.itemPrice}>
                                                {formatPrice(Number(item.variant.price))} KMF / pièce
                                            </p>
                                            <p className={styles.itemTotal}>
                                                Sous-total : {formatPrice(Number(item.variant.price) * item.quantity)} KMF
                                            </p>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.variant.id,
                                                            item.supplierBusinessId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    {icons.minus}
                                                </button>
                                                <span className={styles.qtyText}>{item.quantity}</span>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.variant.id,
                                                            item.supplierBusinessId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    {icons.plus}
                                                </button>
                                            </div>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() =>
                                                    removeItem(item.productId, item.variant.id, item.supplierBusinessId)
                                                }
                                            >
                                                {icons.trash}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Nombre d&apos;articles :</span>
                            <span className={styles.summaryValue}>{totalItems}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Total à payer :</span>
                            <span className={styles.totalAmount}>{formatPrice(totalPrice)} KMF</span>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <div className={styles.bottomBar}>
                        <button
                            className={`${styles.checkoutBtn} ${loading ? styles.checkoutBtnDisabled : ''}`}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className={styles.spinner} />
                            ) : (
                                'Passer la commande'
                            )}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
