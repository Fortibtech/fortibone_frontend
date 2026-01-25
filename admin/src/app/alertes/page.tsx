'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    source: string;
}

const mockAlerts: Alert[] = [
    {
        id: '1',
        type: 'critical',
        title: 'Stock critique détecté',
        description: '5 produits ont un stock inférieur au seuil d\'alerte chez Commercant Demo',
        timestamp: '2026-01-06T01:30:00',
        isRead: false,
        source: 'Inventaire'
    },
    {
        id: '2',
        type: 'warning',
        title: 'Produits expirant bientôt',
        description: '12 produits expirent dans les 7 prochains jours',
        timestamp: '2026-01-06T00:45:00',
        isRead: false,
        source: 'Inventaire'
    },
    {
        id: '3',
        type: 'info',
        title: 'Nouveau commerçant inscrit',
        description: 'Boutique Mahaba a rejoint la plateforme',
        timestamp: '2026-01-05T23:15:00',
        isRead: true,
        source: 'Inscriptions'
    },
    {
        id: '4',
        type: 'success',
        title: 'Paiement validé',
        description: 'Transaction de 150 000 KMF validée avec succès',
        timestamp: '2026-01-05T22:00:00',
        isRead: true,
        source: 'Wallet'
    },
    {
        id: '5',
        type: 'warning',
        title: 'Livraison en retard',
        description: 'Commande #KL-2456 non livrée dans les délais',
        timestamp: '2026-01-05T20:30:00',
        isRead: true,
        source: 'Livraisons'
    },
];

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'critical': return '🔴';
        case 'warning': return '🟠';
        case 'info': return '🔵';
        case 'success': return '🟢';
        default: return '⚪';
    }
};

const getAlertColor = (type: string) => {
    switch (type) {
        case 'critical': return 'var(--color-error)';
        case 'warning': return 'var(--color-warning)';
        case 'info': return 'var(--color-secondary)';
        case 'success': return 'var(--color-primary)';
        default: return 'var(--color-gray-400)';
    }
};

export default function AlertesPage() {
    const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
    const [filter, setFilter] = useState<string>('all');

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !alert.isRead;
        return alert.type === filter;
    });

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    };

    const markAllAsRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    };

    const unreadCount = alerts.filter(a => !a.isRead).length;

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <Link href="/" style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        ← Retour au dashboard
                    </Link>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                        🔔 Alertes système
                    </h1>
                    <p style={{ color: 'var(--color-gray-500)', marginTop: '4px' }}>
                        {unreadCount} alerte(s) non lue(s)
                    </p>
                </div>
                <button
                    onClick={markAllAsRead}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Tout marquer comme lu
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['all', 'unread', 'critical', 'warning', 'info', 'success'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: filter === f ? 'var(--color-primary)' : 'white',
                            color: filter === f ? 'white' : 'var(--color-gray-600)',
                            border: '1px solid var(--color-gray-200)',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}
                    >
                        {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredAlerts.map(alert => (
                    <div
                        key={alert.id}
                        onClick={() => markAsRead(alert.id)}
                        className={styles.chartCard}
                        style={{
                            cursor: 'pointer',
                            borderLeft: `4px solid ${getAlertColor(alert.type)}`,
                            opacity: alert.isRead ? 0.7 : 1,
                            backgroundColor: alert.isRead ? 'var(--color-gray-50)' : 'white'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{ fontSize: '24px' }}>{getAlertIcon(alert.type)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                                        {alert.title}
                                        {!alert.isRead && (
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                backgroundColor: 'var(--color-primary-50)',
                                                color: 'var(--color-primary)',
                                                borderRadius: '10px',
                                                fontSize: '10px',
                                                fontWeight: '600'
                                            }}>
                                                Nouveau
                                            </span>
                                        )}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', marginBottom: '8px' }}>
                                    {alert.description}
                                </p>
                                <span style={{
                                    fontSize: '11px',
                                    color: 'var(--color-gray-400)',
                                    backgroundColor: 'var(--color-gray-100)',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    {alert.source}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
