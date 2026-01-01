'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getMyOrders, Order } from '@/lib/api/orders';
import styles from './orders.module.css';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getMyOrders({ page, limit: 10 });
            if (page === 1) {
                setOrders(response.data || []);
            } else {
                setOrders(prev => [...prev, ...(response.data || [])]);
            }
            setTotalPages(response.totalPages || 1);
            setHasMore(page < (response.totalPages || 1));
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: Order['status']) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return { text: 'En attente de paiement', color: '#F97316', bg: '#FFEDD5' };
            case 'PENDING':
                return { text: 'Nouvelle commande', color: '#EA580C', bg: '#FFF7C2' };
            case 'CONFIRMED':
                return { text: 'Confirmée', color: '#7C3AED', bg: '#EDE9FE' };
            case 'PROCESSING':
                return { text: 'En préparation', color: '#D97706', bg: '#FFFBEB' };
            case 'SHIPPED':
                return { text: 'Expédiée', color: '#2563EB', bg: '#DBEAFE' };
            case 'DELIVERED':
                return { text: 'Livrée', color: '#16A34A', bg: '#DCFCE7' };
            case 'COMPLETED':
                return { text: 'Terminée', color: '#059669', bg: '#D1FAE5' };
            case 'CANCELLED':
                return { text: 'Annulée', color: '#EF4444', bg: '#FECACA' };
            case 'PAID':
                return { text: 'Payée', color: '#059669', bg: '#D1FAE5' };
            case 'REFUNDED':
                return { text: 'Remboursée', color: '#6B7280', bg: '#E5E7EB' };
            default:
                return { text: status, color: '#6B7280', bg: '#F3F4F6' };
        }
    };

    const handleOrderClick = (orderId: string) => {
        router.push(`/dashboard/particulier/orders/${orderId}`);
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>←</button>
                    <h1 className={styles.title}>Vos commandes</h1>
                    <div style={{ width: 45 }} />
                </div>

                {/* Content */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement des commandes...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🛒</span>
                        <p className={styles.emptyTitle}>Aucune commande pour le moment</p>
                        <p className={styles.emptySubtitle}>
                            Elles apparaîtront ici dès que vous en passerez une
                        </p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {orders.map((order) => {
                            const status = getStatusStyle(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className={styles.orderItem}
                                    onClick={() => handleOrderClick(order.id)}
                                >
                                    <div className={styles.orderDetails}>
                                        <span className={styles.orderNumber}>
                                            Commande #{order.orderNumber}
                                        </span>
                                        <div className={styles.rowBetween}>
                                            <span className={styles.orderInfo}>
                                                Total: {parseFloat(order.totalAmount).toLocaleString('fr-FR')} KMF
                                            </span>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: status.bg, color: status.color }}
                                            >
                                                {status.text}
                                            </span>
                                        </div>
                                        <span className={styles.orderDate}>
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        {order.notes && (
                                            <span className={styles.orderNotes}>
                                                Note: {order.notes}
                                            </span>
                                        )}
                                    </div>
                                    <span className={styles.chevron}>›</span>
                                </div>
                            );
                        })}

                        {hasMore && orders.length > 0 && (
                            <button
                                className={styles.loadMore}
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={loading}
                            >
                                {loading ? 'Chargement...' : 'Charger plus'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
