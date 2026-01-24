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

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await getMyOrders({ page, limit: 10 });
                if (page === 1) {
                    setOrders(response.data || []);
                } else {
                    setOrders(prev => [...prev, ...(response.data || [])]);
                }
                setHasMore(page < (response.totalPages || 1));
            } catch (error) {
                console.error('Erreur chargement commandes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page]);

    // Status styles exactly aligned with mobile getStatusStyle()
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Retour
                    </button>
                    <h1 className={styles.title}>Vos commandes</h1>
                </div>

                {/* Content */}
                {loading && page === 1 ? (
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
                        {/* Table Header (Desktop Only) */}
                        <div className={styles.tableHeader}>
                            <span>Commande</span>
                            <span>Date</span>
                            <span>Statut</span>
                            <span>Total</span>
                            <span style={{ textAlign: 'right' }}>Détails</span>
                        </div>

                        {orders.map((order) => {
                            const status = getStatusStyle(order.status);
                            const total = parseFloat(String(order.totalAmount)).toLocaleString('fr-FR');

                            return (
                                <div
                                    key={order.id}
                                    className={styles.orderItem}
                                    onClick={() => handleOrderClick(order.id)}
                                >
                                    {/* Order ID */}
                                    <div className={styles.cellOrder}>
                                        <div className={styles.rowBetween}>
                                            <span>#{order.orderNumber}</span>
                                            {/* Mobile-only status badge if needed, or keeping unified structure */}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className={styles.cellDate}>
                                        {formatDate(order.createdAt)}
                                    </div>

                                    {/* Status */}
                                    <div className={styles.cellStatus}>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ backgroundColor: status.bg, color: status.color }}
                                        >
                                            {status.text}
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <div className={styles.cellTotal}>
                                        {total} KMF
                                    </div>

                                    {/* Action Arrow */}
                                    <div className={styles.cellAction}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </div>
                                </div>
                            );
                        })}

                        {hasMore && (
                            <button
                                className={styles.loadMore}
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={loading}
                            >
                                {loading ? 'Chargement...' : 'Charger les commandes suivantes'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
