'use client';

import React from 'react';
import styles from './OrderCard.module.css';

interface OrderCardProps {
    orderId: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    date: string;
    items: number;
    total: number;
    currencyCode: string;
    onPress?: () => void;
}

const statusConfig = {
    pending: { label: 'En attente', color: '#f59e0b', icon: '🕐' },
    confirmed: { label: 'Confirmée', color: '#3b82f6', icon: '✓' },
    preparing: { label: 'En préparation', color: '#8b5cf6', icon: '🍳' },
    ready: { label: 'Prête', color: '#10b981', icon: '✓✓' },
    delivered: { label: 'Livrée', color: '#059669', icon: '✅' },
    cancelled: { label: 'Annulée', color: '#ef4444', icon: '✕' },
};

export default function OrderCard({
    orderId,
    status,
    date,
    items,
    total,
    currencyCode,
    onPress,
}: OrderCardProps) {
    const config = statusConfig[status];

    return (
        <button className={styles.card} onClick={onPress}>
            <div className={styles.header}>
                <div>
                    <p className={styles.orderId}>Commande #{orderId}</p>
                    <p className={styles.date}>{date}</p>
                </div>
                <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                </span>
            </div>
            <div className={styles.footer}>
                <span className={styles.items}>{items} article{items > 1 ? 's' : ''}</span>
                <span className={styles.total}>
                    {total.toLocaleString('fr-FR')} {currencyCode}
                </span>
            </div>
        </button>
    );
}
