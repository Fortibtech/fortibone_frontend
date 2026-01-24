'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { getMyOrders, Order } from '@/lib/api/orders';
import styles from './orders.module.css';

export default function ProOrdersPage() {
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

    const getStatusStyle = (status: Order['status']) => {
        switch (status) {
            case 'PENDING_PAYMENT': return { text: 'En attente de paiement', color: '#F97316', bg: '#FFF7ED' };
            case 'PENDING': return { text: 'Nouvelle', color: '#B45309', bg: '#FFFBEB' };
            case 'CONFIRMED': return { text: 'Confirmée', color: '#7C3AED', bg: '#F5F3FF' };
            case 'PROCESSING': return { text: 'En préparation', color: '#D97706', bg: '#FFFBEB' };
            case 'SHIPPED': return { text: 'Expédiée', color: '#2563EB', bg: '#EFF6FF' };
            case 'DELIVERED': return { text: 'Livrée', color: '#16A34A', bg: '#F0FDF4' };
            case 'COMPLETED': return { text: 'Terminée', color: '#059669', bg: '#ECFDF5' };
            case 'CANCELLED': return { text: 'Annulée', color: '#EF4444', bg: '#FEF2F2' };
            case 'PAID': return { text: 'Payée', color: '#059669', bg: '#D1FAE5' };
            default: return { text: status, color: '#374151', bg: '#F3F4F6' };
        }
    };

    const handleOrderClick = (orderId: string) => {
        router.push(`/dashboard/commercant/achats/orders/${orderId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Mes commandes fournisseurs">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button onClick={() => router.push('/dashboard/commercant/achats')} className={styles.backButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Retour
                        </button>
                        <h1 className={styles.title}>Mes commandes chez les fournisseurs</h1>
                    </div>

                    {/* Content */}
                    {loading && page === 1 ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Chargement des commandes...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>📦</span>
                            <p className={styles.emptyTitle}>Aucune commande pour le moment</p>
                            <p className={styles.emptySubtitle}>
                                Passez votre première commande auprès d&apos;un fournisseur
                            </p>
                            <button
                                className={styles.continueBtn}
                                onClick={() => router.push('/dashboard/commercant/achats')}
                            >
                                Voir les fournisseurs
                            </button>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {/* Table Header (Desktop Only) */}
                            <div className={styles.tableHeader}>
                                <span>Commande</span>
                                <span>Fournisseur</span>
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
                                            <span>#{order.orderNumber}</span>
                                            <span className={styles.cellDate}>{formatDate(order.createdAt)}</span>
                                        </div>

                                        {/* Supplier Name */}
                                        <div className={styles.cellSupplier}>
                                            {order.business?.name || 'Fournisseur'}
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
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
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
                                    {loading ? 'Chargement...' : 'Charger plus de commandes'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
