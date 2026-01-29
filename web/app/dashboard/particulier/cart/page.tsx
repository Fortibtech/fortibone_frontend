'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { createOrder, passMultipleOrders } from '@/lib/api/orders';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import styles from './cart.module.css';

type PaymentOption = 'CARD' | 'CASH' | 'WALLET';

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();

    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentUI, setShowPaymentUI] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentOption>('CARD');

    // Modal state for confirmations
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        showCancel: boolean;
        onConfirm?: () => void;
    }>({
        title: '',
        message: '',
        type: 'info',
        showCancel: false,
    });

    const totalPrice = getTotalPrice().toFixed(2);
    const totalItemsCount = getTotalItems();

    // Show confirmation before checkout (like mobile handleBuyNow)
    const handleBuyNow = () => {
        if (items.length === 0) {
            toast.info('Votre panier est vide');
            return;
        }

        // Show confirmation modal (like mobile Alert.alert)
        setModalConfig({
            title: 'Acheter maintenant',
            message: `Valider ${totalItemsCount} article(s) pour ${totalPrice} KMF ?\n\nCette action créera automatiquement une ou plusieurs commandes selon les vendeurs.`,
            type: 'info',
            showCancel: true,
            onConfirm: executeCheckout,
        });
        setModalOpen(true);
    };

    // Execute the actual checkout (aligned with mobile passMultipleOrders)
    const executeCheckout = async () => {
        setIsLoading(true);
        setModalOpen(false);

        try {
            // Payload aligned exactly with mobile (only variantId + quantity)
            const payload = {
                items: items.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity
                })),
                notes: 'Achat rapide – Acheter maintenant',
                useWallet: selectedPayment === 'WALLET',
            };

            const orders = await passMultipleOrders(payload);

            // Toast success like mobile Toast.show()
            toast.success('Achat réussi !', {
                description: `${orders.length} commande(s) créée(s).`,
            });

            clearCart();
            router.push('/dashboard/particulier/orders');
        } catch (error: any) {
            console.error('Checkout error:', error);
            const message = error.response?.data?.message || error.message || 'Impossible de passer la commande';

            // Toast error like mobile Toast.show()
            toast.error('Échec de l\'achat', {
                description: Array.isArray(message) ? message.join(', ') : message,
            });
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
                {/* Image */}
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                ) : (
                    <div className={styles.itemImagePlaceholder}>📦</div>
                )}

                {/* Details Container (Flex Row on Desktop) */}
                <div className={styles.itemDetails}>
                    {/* Info Column */}
                    <div className={styles.itemInfoCol}>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.variantName && (
                            <span className={styles.itemVariant}>{item.variantName}</span>
                        )}
                    </div>

                    {/* Actions Column (Qty + Price + Remove) */}
                    <div className={styles.itemActionsCol}>
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

                        <span className={styles.itemPrice}>
                            {(item.price * item.quantity).toLocaleString()} KMF
                        </span>

                        <button
                            className={styles.removeBtn}
                            onClick={() => removeItem(item.productId, item.variantId)}
                            title="Retirer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={handleGoBack} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h1 className={styles.title}>
                        {showPaymentUI ? 'Paiement sécurisé' : `Mon Panier (${totalItemsCount})`}
                    </h1>
                    <div style={{ width: 40 }} />
                </div>

                {showPaymentUI ? (
                    /* === PAYMENT UI (Centered Card) === */
                    <div className={styles.paymentContainer}>
                        <div className={styles.paymentHeader}>
                            <span className={styles.paymentIcon}>🛡️</span>
                            <h2 className={styles.paymentTitle}>Finaliser la commande</h2>
                        </div>

                        <div className={styles.paymentBody}>
                            <div className={styles.totalSection}>
                                <span className={styles.totalLabel}>Montant à payer</span>
                                <span className={styles.totalAmount}>{parseInt(totalPrice).toLocaleString()} KMF</span>
                            </div>

                            <p className={styles.paymentMethodLabel}>Choisir un mode de paiement</p>
                            <div className={styles.paymentOptions}>
                                {(['CARD', 'WALLET', 'CASH'] as PaymentOption[]).map((method) => (
                                    <button
                                        key={method}
                                        className={`${styles.paymentOption} ${selectedPayment === method ? styles.selected : ''}`}
                                        onClick={() => setSelectedPayment(method)}
                                    >
                                        <span className={styles.paymentIcon}>
                                            {method === 'CARD' ? '💳' : method === 'WALLET' ? '👛' : '💵'}
                                        </span>
                                        <div className={styles.paymentOptionText}>
                                            {method === 'CARD' ? 'Carte bancaire' : method === 'WALLET' ? 'Portefeuille Komora' : 'Paiement à la livraison'}
                                        </div>
                                        {selectedPayment === method && <span style={{ color: '#059669', fontSize: '20px' }}>●</span>}
                                    </button>
                                ))}
                            </div>

                            <button
                                className={styles.payButton}
                                onClick={handleBuyNow}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Validation en cours...' : `Confirmer le paiement`}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* === CART GRID === */
                    <>
                        {items.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🛒</span>
                                <p className={styles.emptyText}>Votre panier est vide</p>
                                <button onClick={() => router.back()} style={{ color: '#059669', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                    Continuer mes achats
                                </button>
                            </div>
                        ) : (
                            <div className={styles.cartLayout}>
                                {/* Left Column: Items */}
                                <div className={styles.itemsSection}>
                                    <div className={styles.itemsList}>
                                        {items.map(renderCartItem)}
                                    </div>
                                </div>

                                {/* Right Column: Summary (Sticky) */}
                                <div className={styles.summaryCard}>
                                    <h3 className={styles.summaryTitle}>Résumé de la commande</h3>

                                    <div className={styles.summaryRow}>
                                        <span>Sous-total ({totalItemsCount} articles)</span>
                                        <span>{parseInt(totalPrice).toLocaleString()} KMF</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Livraison</span>
                                        <span style={{ color: '#059669' }}>Gratuit</span>
                                    </div>

                                    <div className={styles.summaryTotal}>
                                        <span>Total</span>
                                        <span className={styles.totalValue}>{parseInt(totalPrice).toLocaleString()} KMF</span>
                                    </div>

                                    <button
                                        className={styles.buyNowButton}
                                        onClick={handleBuyNow}
                                        disabled={isLoading}
                                    >
                                        Passer la commande maintenant
                                    </button>

                                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
                                        🔒 Paiement 100% sécurisé
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                showCancel={modalConfig.showCancel}
                confirmText={modalConfig.showCancel ? 'Confirmer' : 'OK'}
            />
        </DashboardLayout>
    );
}
