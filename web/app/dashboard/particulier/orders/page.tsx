'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getMyOrders, Order } from '@/lib/api/orders';
import { Skeleton, EmptyState } from '@/components/ui';
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span className="hidden md:inline">Retour</span>
                    </button>
                    <h1 className={styles.title}>Vos commandes</h1>
                </div>

                {/* Content */}
                {loading && page === 1 ? (
                    <div className={styles.loading}>
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} height={100} style={{ borderRadius: 12 }} />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className={styles.empty}>
                        <EmptyState
                            title="Aucune commande"
                            description="Vos commandes passées apparaîtront ici."
                            icon={
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            }
                        />
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
                                    {/* Mobile Row 1: Order + Status */}
                                    <div className={styles.mobileRowTop}>
                                        <div className={styles.cellOrder}>#{order.orderNumber}</div>
                                        <div className={styles.cellStatus}>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: status.bg, color: status.color }}
                                            >
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Row 2: Date + Total */}
                                    <div className={styles.mobileRowBottom}>
                                        <div className={styles.cellDate}>
                                            {formatDate(order.createdAt)}
                                        </div>
                                        <div className={styles.cellTotal}>
                                            {total} KMF
                                        </div>
                                    </div>

                                    {/* Desktop Action (Hidden on Mobile) */}
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
                                {loading ? 'Chargement...' : 'Charger plus'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
