'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getOrderById, payOrder, Order, OrderStatus } from '@/lib/api/orders';
import styles from './order-detail.module.css';

type PaymentMethod = 'WALLET' | 'KARTAPAY' | 'STRIPE';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const orderId = params.id;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Payment modal state - MATCHING MOBILE
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paying, setPaying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (err: any) {
            console.error('Error fetching order:', err);
            setError(err.message || 'Erreur lors du chargement de la commande');
        } finally {
            setLoading(false);
        }
    };

    // PAYMENT HANDLER - MATCHING MOBILE
    const handlePay = async () => {
        if (!order) return;
        setPaymentError(null);

        // Validation - matching mobile
        if (paymentMethod === 'KARTAPAY' && !/^\+?(261|237)\d{8,10}$/.test(phoneNumber.replace(/\s/g, ''))) {
            setPaymentError('Format invalide : +261XXXXXXXXX ou +237XXXXXXXXX');
            return;
        }

        setPaying(true);
        try {
            await payOrder({
                orderId: order.id,
                method: paymentMethod,
                ...(paymentMethod === 'KARTAPAY' && { phoneNumber: phoneNumber.replace(/\s/g, '') }),
            });

            // Success - reload order to get new status
            await fetchOrderDetails();
            setPaymentModal(false);
            setPhoneNumber('');
            alert('Paiement réussi !'); // Can replace with toast later

        } catch (err: any) {
            const errorMessage = err.message || 'Une erreur est survenue lors du paiement';
            setPaymentError(errorMessage);

            // Prompt to recharge if insufficient balance - like mobile
            if (errorMessage.toLowerCase().includes('solde insuffisant')) {
                if (window.confirm(`${errorMessage}\n\nVoulez-vous recharger votre portefeuille ?`)) {
                    router.push('/dashboard/particulier/finance/wallet/deposit');
                }
            }
        } finally {
            setPaying(false);
        }
    };

    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return { text: 'En attente de paiement', color: '#F97316', bg: '#FFEDD5', icon: '⏳' };
            case 'PENDING':
                return { text: 'Nouvelle commande', color: '#EA580C', bg: '#FFF7C2', icon: '📋' };
            case 'CONFIRMED':
                return { text: 'Confirmée', color: '#7C3AED', bg: '#EDE9FE', icon: '✓' };
            case 'PROCESSING':
                return { text: 'En préparation', color: '#D97706', bg: '#FFFBEB', icon: '👨‍🍳' };
            case 'SHIPPED':
                return { text: 'Expédiée', color: '#2563EB', bg: '#DBEAFE', icon: '🚚' };
            case 'DELIVERED':
                return { text: 'Livrée', color: '#16A34A', bg: '#DCFCE7', icon: '📦' };
            case 'COMPLETED':
                return { text: 'Terminée', color: '#059669', bg: '#D1FAE5', icon: '✅' };
            case 'CANCELLED':
                return { text: 'Annulée', color: '#EF4444', bg: '#FECACA', icon: '❌' };
            case 'PAID':
                return { text: 'Payée', color: '#059669', bg: '#D1FAE5', icon: '💳' };
            case 'REFUNDED':
                return { text: 'Remboursée', color: '#6B7280', bg: '#E5E7EB', icon: '↩️' };
            default:
                return { text: status, color: '#6B7280', bg: '#F3F4F6', icon: '📄' };
        }
    };

    const statusSteps: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    const getCurrentStepIndex = (status: OrderStatus) => {
        if (status === 'CANCELLED' || status === 'REFUNDED') return -1;
        if (status === 'PENDING_PAYMENT') return 0;
        if (status === 'PAID') return 1;
        return statusSteps.indexOf(status);
    };

    if (loading) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Chargement de la commande...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !order) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.error}>
                    <span className={styles.errorIcon}>❌</span>
                    <h2>Commande non trouvée</h2>
                    <p>{error || 'Cette commande n\'existe pas ou a été supprimée.'}</p>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        Retour aux commandes
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const status = getStatusStyle(order.status);
    const currentStep = getCurrentStepIndex(order.status);
    const total = parseFloat(order.totalAmount).toLocaleString('fr-FR');

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Commande #{order.orderNumber}</h1>
                    <div style={{ width: 45 }} />
                </div>

                {/* Status Card */}
                <div className={styles.statusCard}>
                    <div
                        className={styles.statusBadge}
                        style={{ backgroundColor: status.bg, color: status.color }}
                    >
                        <span className={styles.statusIcon}>{status.icon}</span>
                        <span>{status.text}</span>
                    </div>
                    <p className={styles.orderDate}>
                        Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Status Timeline */}
                {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                    <div className={styles.timeline}>
                        <h3>Suivi de commande</h3>
                        <div className={styles.timelineSteps}>
                            {statusSteps.map((step, index) => {
                                const stepStyle = getStatusStyle(step);
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div
                                        key={step}
                                        className={`${styles.timelineStep} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                                    >
                                        <div className={styles.stepDot}>
                                            {isCompleted ? '✓' : (index + 1)}
                                        </div>
                                        <span className={styles.stepLabel}>{stepStyle.text}</span>
                                        {index < 4 && <div className={styles.stepLine} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Business Info */}
                <div className={styles.section}>
                    <h3>Vendeur</h3>
                    <div className={styles.businessCard}>
                        <div className={styles.businessLogo}>
                            {order.business.logoUrl ? (
                                <img src={order.business.logoUrl} alt={order.business.name} />
                            ) : (
                                <span>🏪</span>
                            )}
                        </div>
                        <div className={styles.businessInfo}>
                            <span className={styles.businessName}>{order.business.name}</span>
                            {order.business.description && (
                                <span className={styles.businessDesc}>{order.business.description}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Lines */}
                <div className={styles.section}>
                    <h3>Articles commandés ({order.lines.length})</h3>
                    <div className={styles.orderLines}>
                        {order.lines.map((line) => (
                            <div key={line.id} className={styles.lineItem}>
                                <div className={styles.lineImage}>
                                    {line.variant.product.images?.[0] ? (
                                        <img src={line.variant.product.images[0]} alt={line.variant.product.name} />
                                    ) : (
                                        <span>📦</span>
                                    )}
                                </div>
                                <div className={styles.lineDetails}>
                                    <span className={styles.lineName}>{line.variant.product.name}</span>
                                    {line.variant.sku && (
                                        <span className={styles.lineVariant}>{line.variant.sku}</span>
                                    )}
                                    <span className={styles.lineQuantity}>Quantité: {line.quantity}</span>
                                </div>
                                <div className={styles.linePrice}>
                                    {(line.price * line.quantity).toLocaleString('fr-FR')} KMF
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>Sous-total</span>
                        <span>{total} KMF</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Livraison</span>
                        <span>0 KMF</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>{total} KMF</span>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className={styles.section}>
                        <h3>Notes</h3>
                        <p className={styles.notes}>{order.notes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    {order.status === 'PENDING_PAYMENT' && (
                        <button
                            className={styles.payBtn}
                            onClick={() => {
                                setPaymentModal(true);
                                setPaymentMethod('WALLET');
                                setPhoneNumber('');
                                setPaymentError(null);
                            }}
                        >
                            💳 Payer maintenant
                        </button>
                    )}
                    <button
                        className={styles.contactBtn}
                        onClick={() => alert('Fonctionnalité à venir: contacter le vendeur')}
                    >
                        📞 Contacter le vendeur
                    </button>
                </div>
            </div>

            {/* PAYMENT MODAL - MATCHING MOBILE */}
            {paymentModal && (
                <div className={styles.modalOverlay} onClick={() => setPaymentModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Payer : {total} KMF</h2>
                            <button className={styles.closeBtn} onClick={() => setPaymentModal(false)}>
                                ✕
                            </button>
                        </div>

                        {/* Payment Method Tabs - MATCHING MOBILE */}
                        <div className={styles.paymentTabs}>
                            {(['WALLET', 'STRIPE', 'KARTAPAY'] as PaymentMethod[]).map((method) => (
                                <button
                                    key={method}
                                    className={`${styles.paymentTab} ${paymentMethod === method ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    {method === 'WALLET' ? 'Portefeuille' :
                                        method === 'STRIPE' ? 'Carte bancaire' : 'KARTAPAY'}
                                </button>
                            ))}
                        </div>

                        {/* Payment Content */}
                        <div className={styles.paymentBody}>
                            {paymentMethod === 'WALLET' && (
                                <div className={styles.walletInfo}>
                                    <span className={styles.walletIcon}>💰</span>
                                    <p>Payer avec votre solde</p>
                                    <span className={styles.walletAmount}>{total} KMF seront débités</span>
                                </div>
                            )}

                            {paymentMethod === 'STRIPE' && (
                                <div className={styles.walletInfo}>
                                    <span className={styles.walletIcon}>💳</span>
                                    <p>Paiement par carte bancaire</p>
                                    <span className={styles.walletAmount}>Non disponible pour le moment</span>
                                </div>
                            )}

                            {paymentMethod === 'KARTAPAY' && (
                                <div className={styles.inputContainer}>
                                    <label>Numéro de téléphone</label>
                                    <input
                                        type="tel"
                                        placeholder="+261 34 12 345 67"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={styles.phoneInput}
                                    />
                                </div>
                            )}

                            {paymentError && (
                                <div className={styles.paymentError}>
                                    ❌ {paymentError}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelPayBtn}
                                onClick={() => setPaymentModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className={styles.confirmPayBtn}
                                onClick={handlePay}
                                disabled={paying || paymentMethod === 'STRIPE'}
                            >
                                {paying ? 'Paiement en cours...' : 'Payer maintenant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
