'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { createOrder } from '@/lib/api/orders';
import styles from './cart.module.css';

type PaymentOption = 'CARD' | 'CASH' | 'WALLET';

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();

    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentUI, setShowPaymentUI] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentOption>('CARD');

    const totalPrice = getTotalPrice().toFixed(2);
    const totalItemsCount = getTotalItems();

    const handleBuyNow = async () => {
        if (items.length === 0) {
            alert('Votre panier est vide');
            return;
        }

        if (!confirm(`Valider ${totalItemsCount} article(s) pour ${totalPrice} XAF ?`)) {
            return;
        }

        setIsLoading(true);
        try {
            // Group items by businessId
            const grouped = items.reduce((acc, item) => {
                if (!acc[item.businessId]) {
                    acc[item.businessId] = [];
                }
                acc[item.businessId].push(item);
                return acc;
            }, {} as Record<string, CartItem[]>);

            // Create one order per business
            const orderPromises = Object.entries(grouped).map(([businessId, businessItems]) =>
                createOrder({
                    businessId,
                    type: 'SALE',
                    lines: businessItems.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                    notes: `Commande web - Paiement: ${selectedPayment}`,
                })
            );

            await Promise.all(orderPromises);

            alert(`✅ Commande(s) passée(s) avec succès!\n${orderPromises.length} commande(s) créée(s).`);
            clearCart();
            router.push('/dashboard/particulier/orders');
        } catch (error: any) {
            alert(`❌ Erreur: ${error.message || 'Échec de la commande'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        if (showPaymentUI) {
            setShowPaymentUI(false);
        } else {
            router.back();
        }
    };

    const renderCartItem = (item: CartItem) => {
        const formattedPrice = item.price.toFixed(2);

        return (
            <div key={item.id} className={styles.cartItem}>
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                ) : (
                    <div className={styles.itemImagePlaceholder}>📦</div>
                )}
                <div className={styles.itemDetails}>
                    <span className={styles.itemName}>
                        {item.name}
                        {item.variantName ? ` - ${item.variantName}` : ''}
                    </span>
                    <span className={styles.itemPrice}>
                        {formattedPrice} XAF × {item.quantity}
                    </span>
                    <div className={styles.quantityControls}>
                        <button
                            className={styles.quantityBtn}
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            −
                        </button>
                        <span className={styles.quantityText}>{item.quantity}</span>
                        <button
                            className={styles.quantityBtn}
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
                <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.productId, item.variantId)}
                >
                    🗑️
                </button>
            </div>
        );
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={handleGoBack} className={styles.backButton}>←</button>
                    <h1 className={styles.title}>
                        {showPaymentUI ? 'Paiement' : `Panier (${totalItemsCount})`}
                    </h1>
                    <div style={{ width: 40 }} />
                </div>

                {showPaymentUI ? (
                    /* Payment UI */
                    <div className={styles.paymentContent}>
                        <div className={styles.paymentHeader}>
                            <span className={styles.paymentIcon}>✅</span>
                            <h2 className={styles.paymentTitle}>Finaliser la commande</h2>
                        </div>

                        <div className={styles.totalSection}>
                            <span className={styles.totalLabel}>Total à payer</span>
                            <span className={styles.totalAmount}>{totalPrice} XAF</span>
                        </div>

                        <p className={styles.paymentMethodLabel}>Mode de paiement</p>
                        <div className={styles.paymentOptions}>
                            {(['CARD', 'CASH', 'WALLET'] as PaymentOption[]).map((method) => (
                                <button
                                    key={method}
                                    className={`${styles.paymentOption} ${selectedPayment === method ? styles.selected : ''}`}
                                    onClick={() => setSelectedPayment(method)}
                                >
                                    <span className={styles.paymentIcon}>
                                        {method === 'CARD' ? '💳' : method === 'CASH' ? '💵' : '👛'}
                                    </span>
                                    <span className={styles.paymentOptionText}>
                                        {method === 'CARD' ? 'Carte bancaire' : method === 'CASH' ? 'Espèces' : 'Portefeuille'}
                                    </span>
                                    {selectedPayment === method && <span>✓</span>}
                                </button>
                            ))}
                        </div>

                        <button
                            className={styles.payButton}
                            onClick={handleBuyNow}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Traitement...' : `Confirmer • ${totalPrice} XAF`}
                        </button>
                    </div>
                ) : (
                    /* Cart Content */
                    <>
                        {items.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🛒</span>
                                <p className={styles.emptyText}>Votre panier est vide</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.itemsList}>
                                    {items.map(renderCartItem)}
                                </div>

                                <div className={styles.footer}>
                                    <div className={styles.totalContainer}>
                                        <span className={styles.footerLabel}>Total</span>
                                        <span className={styles.footerPrice}>{totalPrice} XAF</span>
                                    </div>

                                    <button
                                        className={styles.buyNowButton}
                                        onClick={handleBuyNow}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Traitement...' : `⚡ Passer la commande • ${totalPrice} XAF`}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
