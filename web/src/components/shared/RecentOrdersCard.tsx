'use client';

import Link from 'next/link';
import styles from './RecentOrdersCard.module.css';

export interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number | string;
    business?: {
        id: string;
        name: string;
    };
    customer?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface RecentOrdersCardProps {
    orders: Order[];
    loading?: boolean;
    title?: string;
    viewAllLink?: string;
    currencySymbol?: string;
    limit?: number;
}

const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return styles.statusPending;
    if (statusLower.includes('processing')) return styles.statusProcessing;
    if (statusLower.includes('confirmed')) return styles.statusConfirmed;
    if (statusLower.includes('delivered')) return styles.statusDelivered;
    if (statusLower.includes('completed')) return styles.statusCompleted;
    if (statusLower.includes('cancelled')) return styles.statusCancelled;
    return styles.statusPending;
};

const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'PENDING': 'En attente',
        'PENDING_PAYMENT': 'Paiement en attente',
        'CONFIRMED': 'Confirmée',
        'PROCESSING': 'En cours',
        'SHIPPED': 'Expédiée',
        'DELIVERED': 'Livrée',
        'COMPLETED': 'Terminée',
        'CANCELLED': 'Annulée',
    };
    return statusMap[status] || status;
};

export default function RecentOrdersCard({
    orders,
    loading = false,
    title = 'Commandes récentes',
    viewAllLink,
    currencySymbol = 'KMF',
    limit = 5,
}: RecentOrdersCardProps) {
    const displayOrders = orders.slice(0, limit);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <span className={styles.titleIcon}>📦</span>
                    {title}
                </h3>
                {viewAllLink && (
                    <Link href={viewAllLink} className={styles.viewAllLink}>
                        Voir tout →
                    </Link>
                )}
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Chargement...</p>
                </div>
            ) : displayOrders.length > 0 ? (
                <div className={styles.ordersList}>
                    {displayOrders.map((order) => (
                        <div key={order.id} className={styles.orderItem}>
                            <div className={styles.orderInfo}>
                                <span className={styles.orderNumber}>
                                    #{order.orderNumber}
                                </span>
                                <span className={styles.orderBusiness}>
                                    {order.business?.name || order.customer
                                        ? `${order.customer?.firstName} ${order.customer?.lastName}`
                                        : 'Client'}
                                </span>
                            </div>
                            <div className={styles.orderMeta}>
                                <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                                    {formatStatus(order.status)}
                                </span>
                                <span className={styles.orderAmount}>
                                    {typeof order.totalAmount === 'number'
                                        ? order.totalAmount.toLocaleString()
                                        : parseFloat(order.totalAmount).toLocaleString()
                                    } {currencySymbol}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <p className={styles.emptyText}>Aucune commande récente</p>
                </div>
            )}
        </div>
    );
}
