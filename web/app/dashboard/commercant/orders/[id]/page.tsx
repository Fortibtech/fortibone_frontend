'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axiosInstance';
import styles from './order-detail.module.css';

interface OrderLine {
    id: string;
    quantity: number;
    price: number;
    variantId: string;
    variant?: {
        name: string;
        imageUrl?: string;
    };
}

interface Order {
    id: string;
    orderNumber: string;
    type: string;
    status: string;
    totalAmount: number;
    notes?: string;
    createdAt: string;
    customer?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
    lines: OrderLine[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING_PAYMENT: { label: 'En attente de paiement', color: '#f59e0b', bg: '#fef3c7' },
    PENDING: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
    CONFIRMED: { label: 'Confirmée', color: '#3b82f6', bg: '#dbeafe' },
    PROCESSING: { label: 'En traitement', color: '#8b5cf6', bg: '#f3e8ff' },
    SHIPPED: { label: 'Expédiée', color: '#06b6d4', bg: '#cffafe' },
    DELIVERED: { label: 'Livrée', color: '#10b981', bg: '#ecfdf5' },
    COMPLETED: { label: 'Terminée', color: '#10b981', bg: '#ecfdf5' },
    CANCELLED: { label: 'Annulée', color: '#ef4444', bg: '#fee2e2' },
};

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const { selectedBusiness } = useBusinessStore();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCarrier, setSelectedCarrier] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!selectedBusiness || !orderId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.get(`/businesses/${selectedBusiness.id}/orders/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, selectedBusiness]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(value);
    };

    if (loading) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Commande">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Chargement de la commande...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!order) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Commande">
                    <div className={styles.errorContainer}>
                        <span className={styles.errorIcon}>❌</span>
                        <p>Commande introuvable</p>
                        <button onClick={() => router.back()}>Retour</button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: '#6b7280', bg: '#f3f4f6' };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Commande">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ←
                        </button>
                        <div className={styles.headerContent}>
                            <span className={styles.headerLabel}>Commande</span>
                            <h1 className={styles.orderNumber}>#{order.orderNumber}</h1>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className={styles.clientCard}>
                        <div className={styles.clientAvatar}>
                            {order.customer?.profileImageUrl ? (
                                <img src={order.customer.profileImageUrl} alt="Client" />
                            ) : (
                                <span>{order.customer?.firstName?.charAt(0) || 'C'}</span>
                            )}
                        </div>
                        <div className={styles.clientInfo}>
                            <span className={styles.clientLabel}>Client</span>
                            <span className={styles.clientName}>
                                {order.customer?.firstName} {order.customer?.lastName}
                            </span>
                        </div>
                        <div className={styles.statusSection}>
                            <span className={styles.statusLabel}>Statut</span>
                            <span
                                className={styles.statusBadge}
                                style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
                            >
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className={styles.infoCard}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Date</span>
                            <span className={styles.infoValue}>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.notes && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Notes</span>
                                <span className={styles.infoValue}>{order.notes}</span>
                            </div>
                        )}
                    </div>

                    {/* Articles */}
                    <div className={styles.articlesCard}>
                        <h2 className={styles.sectionTitle}>Articles commandés</h2>
                        <table className={styles.articlesTable}>
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Qté</th>
                                    <th>Prix U.</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.lines.map((line) => (
                                    <tr key={line.id}>
                                        <td>{line.variant?.name || 'Article'}</td>
                                        <td>x{line.quantity}</td>
                                        <td>{formatAmount(line.price)} KMF</td>
                                        <td>{formatAmount(line.price * line.quantity)} KMF</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Total</span>
                            <span className={styles.totalValue}>
                                {formatAmount(order.totalAmount)} KMF
                            </span>
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className={styles.deliveryCard}>
                        <h2 className={styles.sectionTitle}>Livraison</h2>
                        <label className={styles.fieldLabel}>Choisir le livreur</label>
                        <select
                            className={styles.select}
                            value={selectedCarrier}
                            onChange={(e) => setSelectedCarrier(e.target.value)}
                        >
                            <option value="">Sélectionner un livreur</option>
                            <option value="super-livraison">Super Livraison (Demo)</option>
                        </select>

                        <button className={styles.mapLink}>
                            📍 Définir les points de récupération et livraison sur la carte
                        </button>

                        <button className={styles.estimateBtn}>
                            Estimer la livraison
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
