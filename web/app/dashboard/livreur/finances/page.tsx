'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useUserStore } from '@/stores/userStore';
import { getWallet, getWalletTransactions } from '@/lib/api/wallet';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './finances.module.css';

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'EARNING';
    amount: string;
    description: string;
    status: string;
    createdAt: string;
}

export default function LivreurFinancesPage() {
    const { userProfile } = useUserStore();
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletData, transactionsData] = await Promise.all([
                    getWallet(),
                    getWalletTransactions({ limit: 10 }),
                ]);
                setWallet(walletData);
                setTransactions(transactionsData?.data?.map((t: any) => ({
                    ...t,
                    description: t.metadata?.note || `Transaction ${t.id.slice(0, 8)}`,
                    type: t.type || 'DEPOSIT',
                })) || []);
            } catch (error) {
                console.error('Error fetching wallet data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTransactionIcon = (type: string) => {
        const icons: Record<string, string> = {
            'DEPOSIT': '💰',
            'WITHDRAWAL': '💸',
            'TRANSFER': '↔️',
            'PAYMENT': '🛒',
            'EARNING': '🚴',
        };
        return icons[type] || '💳';
    };

    const getTransactionColor = (type: string) => {
        if (['DEPOSIT', 'EARNING'].includes(type)) return styles.positive;
        if (['WITHDRAWAL', 'PAYMENT'].includes(type)) return styles.negative;
        return styles.neutral;
    };

    const formatAmount = (amount: string, type: string) => {
        const value = parseFloat(amount);
        const prefix = ['DEPOSIT', 'EARNING'].includes(type) ? '+' : '-';
        return `${prefix}${value.toLocaleString()}`;
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Finances">
                <div className={styles.container}>
                    {/* En-tête */}
                    <div className={styles.header}>
                        <h1>Mes Finances</h1>
                        <p>Gérez votre portefeuille et suivez vos transactions</p>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <>
                            {/* Carte de solde */}
                            <div className={styles.balanceCard}>
                                <div className={styles.balanceLabel}>Solde disponible</div>
                                <div className={styles.balanceAmount}>
                                    {wallet ? (
                                        <>
                                            {parseFloat(wallet.balance).toLocaleString()}
                                            <span className={styles.currency}>{wallet.currency?.symbol || 'KMF'}</span>
                                        </>
                                    ) : (
                                        '0 KMF'
                                    )}
                                </div>
                                <div className={styles.balanceNote}>
                                    Portefeuille lié à : {userProfile?.email}
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className={styles.actionsGrid}>
                                <Link href="/dashboard/livreur/wallet/deposit" className={styles.actionCard}>
                                    <span className={styles.actionIcon}>💰</span>
                                    <span className={styles.actionLabel}>Recharger</span>
                                </Link>
                                <Link href="/dashboard/livreur/wallet/withdraw" className={styles.actionCard}>
                                    <span className={styles.actionIcon}>💸</span>
                                    <span className={styles.actionLabel}>Retirer</span>
                                </Link>
                                <Link href="/dashboard/livreur/wallet/transfer" className={styles.actionCard}>
                                    <span className={styles.actionIcon}>↔️</span>
                                    <span className={styles.actionLabel}>Transférer</span>
                                </Link>
                                <Link href="/dashboard/livreur/earnings" className={styles.actionCard}>
                                    <span className={styles.actionIcon}>📊</span>
                                    <span className={styles.actionLabel}>Revenus</span>
                                </Link>
                            </div>

                            {/* Transactions récentes */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Transactions récentes</h2>
                                    <Link href="/dashboard/livreur/wallet/history" className={styles.viewAll}>
                                        Voir tout →
                                    </Link>
                                </div>

                                <div className={styles.transactionsList}>
                                    {transactions.length === 0 ? (
                                        <div className={styles.empty}>
                                            <span className={styles.emptyIcon}>📋</span>
                                            <p>Aucune transaction</p>
                                        </div>
                                    ) : (
                                        transactions.map(tx => (
                                            <div key={tx.id} className={styles.transactionItem}>
                                                <div className={styles.txIcon}>
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div className={styles.txInfo}>
                                                    <span className={styles.txDescription}>{tx.description}</span>
                                                    <span className={styles.txDate}>
                                                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className={`${styles.txAmount} ${getTransactionColor(tx.type)}`}>
                                                    {formatAmount(tx.amount, tx.type)} KMF
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Note importante */}
                            <div className={styles.infoCard}>
                                <span className={styles.infoIcon}>ℹ️</span>
                                <p>
                                    Le portefeuille est lié à votre compte ({userProfile?.email}),
                                    pas à votre entreprise. Votre solde reste le même quel que soit
                                    le business sélectionné.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
