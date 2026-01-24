'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getAnalyticsOverview, AnalyticsOverview } from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './analytics-ventes.module.css';

interface StatCard {
    title: string;
    value: string | number;
    icon: string;
    iconColor: string;
    bgColor: string;
}

export default function AnalyticsVentesPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsOverview | null>(null);
    const currencySymbol = 'KMF';

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await getAnalyticsOverview(selectedBusiness.id);
            setData(result);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatMoney = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const cards: StatCard[] = data ? [
        {
            title: 'Total des ventes',
            value: `${formatMoney(data.totalSalesAmount)} ${currencySymbol}`,
            icon: '$',
            iconColor: '#10B981',
            bgColor: '#D1FAE5',
        },
        {
            title: 'Commandes totales',
            value: data.totalSalesOrders.toLocaleString('fr-FR'),
            icon: '🛒',
            iconColor: '#10B981',
            bgColor: '#D1FAE5',
        },
        {
            title: 'Panier moyen',
            value: `${formatMoney(data.averageOrderValue)} ${currencySymbol}`,
            icon: '📈',
            iconColor: '#3B82F6',
            bgColor: '#DBEAFE',
        },
        {
            title: 'Produits vendus',
            value: data.totalProductsSold.toLocaleString('fr-FR'),
            icon: '📦',
            iconColor: '#F59E0B',
            bgColor: '#FEF3C7',
        },
        {
            title: 'Total des achats',
            value: `${formatMoney(data.totalPurchaseAmount)} ${currencySymbol}`,
            icon: '💳',
            iconColor: '#EF4444',
            bgColor: '#FEE2E2',
        },
        {
            title: "Commandes d'achat",
            value: data.totalPurchaseOrders.toLocaleString('fr-FR'),
            icon: '🛍️',
            iconColor: '#8B5CF6',
            bgColor: '#EDE9FE',
        },
        {
            title: 'Valeur du stock',
            value: `${formatMoney(data.currentInventoryValue)} ${currencySymbol}`,
            icon: '📊',
            iconColor: '#F97316',
            bgColor: '#FFEDD5',
        },
        {
            title: "Membres de l'équipe",
            value: data.totalMembers,
            icon: '👥',
            iconColor: '#06B6D4',
            bgColor: '#CFFAFE',
        },
        {
            title: 'Clients uniques',
            value: data.uniqueCustomers.toLocaleString('fr-FR'),
            icon: '✓',
            iconColor: '#84CC16',
            bgColor: '#ECFCCB',
        },
        {
            title: 'Note moyenne',
            value: `${data.averageBusinessRating.toFixed(1)} ⭐`,
            icon: '⭐',
            iconColor: '#FACC15',
            bgColor: '#FEF9C3',
        },
        {
            title: 'Total des avis',
            value: data.totalBusinessReviews.toLocaleString('fr-FR'),
            icon: '💬',
            iconColor: '#6366F1',
            bgColor: '#E0E7FF',
        },
    ] : [];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Vue d'ensemble">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ←
                        </button>
                        <h1 className={styles.title}>Vue d&apos;ensemble</h1>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement des statistiques...</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {cards.map((card, index) => (
                                <div key={index} className={styles.card}>
                                    <div
                                        className={styles.cardIcon}
                                        style={{ backgroundColor: card.bgColor }}
                                    >
                                        <span style={{ color: card.iconColor }}>{card.icon}</span>
                                    </div>
                                    <span className={styles.cardTitle}>{card.title}</span>
                                    <span className={styles.cardValue}>{card.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
