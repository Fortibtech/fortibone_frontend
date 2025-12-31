'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getBusinessOrders } from '@/lib/api/orders';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './ventes.module.css';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    customer?: {
        firstName: string;
        lastName: string;
    };
    lines?: Array<{
        id: string;
        productName: string;
        quantity: number;
        unitPrice: string;
    }>;
}

export default function VentesPage() {
    const { selectedBusiness } = useBusinessStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!selectedBusiness) {
                setLoading(false);
                return;
            }
            try {
                const data = await getBusinessOrders(selectedBusiness.id, { limit: 50 });
                // Filtrer uniquement les commandes de type SALE (ventes)
                const salesOrders = data?.data?.filter((o: any) => o.type === 'SALE') || data?.data || [];
                setOrders(salesOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [selectedBusiness]);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);
        if (filter === 'completed') return order.status === 'COMPLETED' || order.status === 'DELIVERED';
        if (filter === 'cancelled') return order.status === 'CANCELLED';
        return true;
    });

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'En attente',
            'CONFIRMED': 'Confirmée',
            'PROCESSING': 'En préparation',
            'READY': 'Prête',
            'DELIVERED': 'Livrée',
            'COMPLETED': 'Terminée',
            'CANCELLED': 'Annulée',
        };
        return labels[status] || status;
    };

    const getStatusClass = (status: string) => {
        if (['PENDING'].includes(status)) return styles.statusPending;
        if (['CONFIRMED', 'PROCESSING'].includes(status)) return styles.statusProcessing;
        if (['READY', 'DELIVERED', 'COMPLETED'].includes(status)) return styles.statusCompleted;
        if (['CANCELLED'].includes(status)) return styles.statusCancelled;
        return '';
    };

    const totalSales = orders.reduce((acc, order) => {
        if (order.status !== 'CANCELLED') {
            return acc + parseFloat(order.totalAmount || '0');
        }
        return acc;
    }, 0);

    const pendingCount = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Ventes">
                <div className={styles.container}>
                    {/* En-tête avec stats */}
                    <div className={styles.header}>
                        <h1>Ventes</h1>
                        <p>Gérez vos ventes et suivez vos commandes clients</p>
                    </div>

                    {/* Cartes de statistiques */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#ecfdf5' }}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Total des ventes</span>
                                <span className={styles.statValue}>{totalSales.toLocaleString()} KMF</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>⏳</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>En attente</span>
                                <span className={styles.statValue}>{pendingCount}</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>✅</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Terminées</span>
                                <span className={styles.statValue}>{completedCount}</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#ede9fe' }}>📦</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Total commandes</span>
                                <span className={styles.statValue}>{orders.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Toutes
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            En cours
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Terminées
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'cancelled' ? styles.active : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Annulées
                        </button>
                    </div>

                    {/* Liste des commandes */}
                    <div className={styles.ordersList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Chargement des ventes...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className={styles.empty}>
                                <div className={styles.emptyIcon}>📋</div>
                                <h3>Aucune vente</h3>
                                <p>{filter === 'all' ? 'Vous n\'avez pas encore de ventes' : 'Aucune vente dans cette catégorie'}</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderNumber}>#{order.orderNumber}</span>
                                        <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className={styles.orderBody}>
                                        <div className={styles.orderCustomer}>
                                            <span className={styles.customerIcon}>👤</span>
                                            <span>{order.customer?.firstName} {order.customer?.lastName || 'Client'}</span>
                                        </div>
                                        <div className={styles.orderMeta}>
                                            <span className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className={styles.orderAmount}>
                                                {parseFloat(order.totalAmount).toLocaleString()} KMF
                                            </span>
                                        </div>
                                    </div>
                                    {order.lines && order.lines.length > 0 && (
                                        <div className={styles.orderItems}>
                                            {order.lines.slice(0, 3).map((line: any, idx: number) => (
                                                <span key={idx} className={styles.orderItem}>
                                                    {line.quantity}x {line.productName}
                                                </span>
                                            ))}
                                            {order.lines.length > 3 && (
                                                <span className={styles.moreItems}>
                                                    +{order.lines.length - 3} autres
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Lien vers Analytics */}
                    <Link href="/dashboard/commercant/analytics" className={styles.analyticsLink}>
                        <span>📊</span>
                        <span>Voir les analytics avancées</span>
                        <span>→</span>
                    </Link>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
