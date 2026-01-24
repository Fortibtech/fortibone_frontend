'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getBusinessOrders, updateOrderStatus } from '@/lib/api/orders';
import styles from '../../fournisseur/orders/orders.module.css';

const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PROCESSING: 'En cuisine',
    COMPLETED: 'Servie',
    CANCELLED: 'Annulée',
};

export default function RestaurateurOrdersPage() {
    const { selectedBusiness } = useBusinessStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('active');

    useEffect(() => {
        if (selectedBusiness) loadOrders();
    }, [selectedBusiness]);

    const loadOrders = async () => {
        if (!selectedBusiness) return;
        try {
            const data = await getBusinessOrders(selectedBusiness.id, { limit: 50 });
            setOrders(data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus as any);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status);
        return o.status === filter;
    });

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Commandes">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Commandes en salle</h1>
                        <div className={styles.stats}>
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
                                <span className={styles.statLabel}>En cuisine</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.filters}>
                        {['active', 'PENDING', 'PROCESSING', 'COMPLETED'].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'active' ? 'En cours' : statusLabels[f] || f}
                            </button>
                        ))}
                    </div>

                    <div className={styles.ordersList}>
                        {loading ? (
                            <div className={styles.loading}><div className={styles.spinner} /></div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderNumber}>
                                            <strong>{order.tableNumber ? `Table ${order.tableNumber}` : `#${order.orderNumber}`}</strong>
                                        </div>
                                        <span className={styles.orderStatus}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className={styles.orderItems}>
                                        {order.lines?.slice(0, 4).map((line: any, idx: number) => (
                                            <div key={idx} className={styles.orderItem}>
                                                <span className={styles.itemQty}>{line.quantity}x</span>
                                                <span className={styles.itemName}>{line.variant?.product?.name || 'Plat'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.orderFooter}>
                                        <span className={styles.orderTotal}>
                                            {parseFloat(order.totalAmount).toLocaleString('fr-FR')} €
                                        </span>
                                        <div className={styles.orderActions}>
                                            {order.status === 'PENDING' && (
                                                <button className={styles.confirmBtn} onClick={() => handleStatusChange(order.id, 'CONFIRMED')}>
                                                    Accepter
                                                </button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button className={styles.confirmBtn} onClick={() => handleStatusChange(order.id, 'PROCESSING')}>
                                                    En cuisine
                                                </button>
                                            )}
                                            {order.status === 'PROCESSING' && (
                                                <button className={styles.confirmBtn} onClick={() => handleStatusChange(order.id, 'COMPLETED')}>
                                                    Servi
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}><p>Aucune commande</p></div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
