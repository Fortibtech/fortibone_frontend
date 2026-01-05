'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getBusinessOrders, updateOrderStatus } from '@/lib/api/orders';
import styles from './orders.module.css';

const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En traitement',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
};

export default function FournisseurOrdersPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (selectedBusiness) loadOrders();
    }, [selectedBusiness]);

    const loadOrders = async () => {
        if (!selectedBusiness) return;
        try {
            const data = await getBusinessOrders(selectedBusiness.id, { limit: 50 });
            setOrders(data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus as any);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status);
        return o.status === filter;
    });

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Commandes B2B">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Commandes fournisseur</h1>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{orders.length}</span>
                                <span className={styles.statLabel}>Total</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                                    {orders.filter(o => o.status === 'PENDING').length}
                                </span>
                                <span className={styles.statLabel}>En attente</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.filters}>
                        {['all', 'active', 'PENDING', 'PROCESSING', 'SHIPPED'].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'Toutes' : f === 'active' ? 'En cours' : statusLabels[f] || f}
                            </button>
                        ))}
                    </div>

                    <div className={styles.ordersList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Chargement...</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderNumber}>
                                            <strong>#{order.orderNumber}</strong>
                                            <span className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <span className={styles.orderStatus}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className={styles.orderCustomer}>
                                        🏢 {order.customer?.firstName} {order.customer?.lastName}
                                    </div>
                                    <div className={styles.orderFooter}>
                                        <span className={styles.orderTotal}>
                                            {parseFloat(order.totalAmount).toLocaleString('fr-FR')} KMF
                                        </span>
                                        <div className={styles.orderActions}>
                                            <button
                                                className={styles.detailBtn}
                                                onClick={() => router.push(`/dashboard/fournisseur/orders/${order.id}`)}
                                            >
                                                Voir détail
                                            </button>
                                            {order.status === 'PENDING' && (
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                                >
                                                    Confirmer
                                                </button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                                                >
                                                    Préparer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Aucune commande B2B</p>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

