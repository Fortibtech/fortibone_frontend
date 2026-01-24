'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getBusinessOrders, updateOrderStatus } from '@/lib/api/orders';
import styles from './ventes.module.css';

const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En préparation',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée',
};

const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    PROCESSING: '#8b5cf6',
    SHIPPED: '#06b6d4',
    DELIVERED: '#10b981',
    COMPLETED: '#059669',
    CANCELLED: '#ef4444',
    REFUNDED: '#6b7280',
};

export default function VentesPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        if (selectedBusiness) {
            loadOrders();
        }
    }, [selectedBusiness]);

    const loadOrders = async () => {
        if (!selectedBusiness) return;
        try {
            const data = await getBusinessOrders(selectedBusiness.id, { limit: 50 });
            setOrders(data.data || []);
        } catch (error: any) {
            console.error('Error loading orders:', error);
            toast.error('Erreur chargement des ventes', {
                description: error.message || 'Veuillez réessayer',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus as any);
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
            setSelectedOrder(null);
            toast.success(`Commande ${statusLabels[newStatus] || newStatus}`);
        } catch (error: any) {
            console.error('Error updating order status:', error);
            toast.error('Erreur changement statut', {
                description: error.response?.data?.message || error.message,
            });
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status);
        if (filter === 'completed') return ['DELIVERED', 'COMPLETED'].includes(o.status);
        return o.status === filter;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Ventes">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1>Gestion des ventes</h1>
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
                            <div className={styles.statItem}>
                                <span className={styles.statValue} style={{ color: '#8b5cf6' }}>
                                    {orders.filter(o => o.status === 'PROCESSING').length}
                                </span>
                                <span className={styles.statLabel}>En cours</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={styles.filters}>
                        {['all', 'active', 'PENDING', 'PROCESSING', 'completed'].map(f => {
                            const count = f === 'all' ? orders.length :
                                f === 'active' ? orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length :
                                    f === 'completed' ? orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length :
                                        orders.filter(o => o.status === f).length;
                            return (
                                <button
                                    key={f}
                                    className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? 'Toutes' :
                                        f === 'active' ? 'En cours' :
                                            f === 'completed' ? 'Terminées' :
                                                statusLabels[f] || f}
                                    <span className={styles.filterCount}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Orders List */}
                    <div className={styles.ordersList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Chargement des ventes...</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderNumber}>
                                            <strong>#{order.orderNumber}</strong>
                                            <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                        </div>
                                        <span
                                            className={styles.orderStatus}
                                            style={{
                                                backgroundColor: `${statusColors[order.status]}15`,
                                                color: statusColors[order.status]
                                            }}
                                        >
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>

                                    <div className={styles.orderCustomer}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                                    </div>

                                    <div className={styles.orderItems}>
                                        {order.lines?.slice(0, 3).map((line: any, idx: number) => (
                                            <div key={idx} className={styles.orderItem}>
                                                <span className={styles.itemQty}>{line.quantity}x</span>
                                                <span className={styles.itemName}>{line.variant?.product?.name || 'Produit'}</span>
                                            </div>
                                        ))}
                                        {order.lines?.length > 3 && (
                                            <span className={styles.moreItems}>+{order.lines.length - 3} autres...</span>
                                        )}
                                    </div>

                                    <div className={styles.orderFooter}>
                                        <span className={styles.orderTotal}>
                                            {parseFloat(order.totalAmount).toLocaleString('fr-FR')} KMF
                                        </span>
                                        <div className={styles.orderActions}>
                                            <button
                                                className={styles.detailBtn}
                                                onClick={() => router.push(`/dashboard/commercant/ventes/${order.id}`)}
                                            >
                                                Voir détail
                                            </button>
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className={styles.confirmBtn}
                                                        onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                                    >
                                                        Confirmer
                                                    </button>
                                                    <button
                                                        className={styles.cancelBtn}
                                                        onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                                                >
                                                    Lancer préparation
                                                </button>
                                            )}
                                            {order.status === 'PROCESSING' && (
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                                                >
                                                    Prêt à expédier
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                </svg>
                                <p>Aucune vente trouvée</p>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
