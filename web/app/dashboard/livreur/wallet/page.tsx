'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, getWalletTransactions, type Wallet, type WalletTransaction } from '@/lib/api';
import styles from './wallet.module.css';

// Icons
const icons = {
    deposit: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </svg>
    ),
    withdraw: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    ),
    transfer: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    history: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
};

export default function WalletPage() {
    const pathname = usePathname();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [walletData, txData] = await Promise.all([
                    getWallet(),
                    getWalletTransactions({ page: 1, limit: 5 })
                ]);
                setWallet(walletData);
                setTransactions(txData.data || []);
            } catch (error) {
                console.error('Erreur chargement wallet:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatAmount = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return num.toLocaleString('fr-FR', { minimumFractionDigits: 0 });
    };

    const currencySymbol = wallet?.currency?.symbol || 'XAF';

    // Extraire le type de dashboard depuis le pathname
    const dashboardType = pathname.split('/')[2] || 'commercant';

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Mon Portefeuille</h1>
                    <p className={styles.subtitle}>Gérez vos finances en toute simplicité</p>
                </div>

                {/* Balance Card */}
                <div className={styles.balanceCard}>
                    <div className={styles.balanceInfo}>
                        <span className={styles.balanceLabel}>Solde disponible</span>
                        {loading ? (
                            <div className={styles.skeleton} style={{ width: 200, height: 48 }} />
                        ) : (
                            <span className={styles.balanceAmount}>
                                {formatAmount(wallet?.balance || 0)} {currencySymbol}
                            </span>
                        )}
                    </div>
                    <div className={styles.balanceActions}>
                        <Link href={`/dashboard/${dashboardType}/wallet/deposit`} className={styles.actionButton}>
                            {icons.deposit}
                            <span>Dépôt</span>
                        </Link>
                        <Link href={`/dashboard/${dashboardType}/wallet/withdraw`} className={styles.actionButton}>
                            {icons.withdraw}
                            <span>Retrait</span>
                        </Link>
                        <Link href={`/dashboard/${dashboardType}/wallet/transfer`} className={styles.actionButton}>
                            {icons.transfer}
                            <span>Transfert</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <Link href={`/dashboard/${dashboardType}/wallet/transactions`} className={styles.quickLink}>
                        {icons.history}
                        <span>Historique des transactions</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>

                {/* Recent Transactions */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Transactions récentes</h2>
                        <Link href={`/dashboard/${dashboardType}/wallet/transactions`} className={styles.seeAll}>
                            Voir tout
                        </Link>
                    </div>

                    {loading ? (
                        <div className={styles.transactionsList}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.transactionItem}>
                                    <div className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className={styles.skeleton} style={{ width: '60%', height: 16, marginBottom: 8 }} />
                                        <div className={styles.skeleton} style={{ width: '40%', height: 12 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <p>Aucune transaction récente</p>
                        </div>
                    ) : (
                        <div className={styles.transactionsList}>
                            {transactions.map((tx) => {
                                const isIncome = parseFloat(String(tx.amount)) > 0 ||
                                    tx.provider?.toUpperCase() === 'DEPOSIT';

                                return (
                                    <div key={tx.id} className={styles.transactionItem}>
                                        <div className={`${styles.txIcon} ${isIncome ? styles.income : styles.expense}`}>
                                            {isIncome ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="19" x2="12" y2="5" />
                                                    <polyline points="5 12 12 5 19 12" />
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <polyline points="19 12 12 19 5 12" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className={styles.txInfo}>
                                            <span className={styles.txTitle}>
                                                {tx.provider === 'DEPOSIT' ? 'Dépôt' :
                                                    tx.provider === 'WITHDRAWAL' ? 'Retrait' :
                                                        tx.provider === 'TRANSFER' ? 'Transfert' :
                                                            tx.provider === 'PAYMENT' ? 'Paiement' : tx.provider}
                                            </span>
                                            <span className={styles.txDate}>
                                                {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <span className={`${styles.txAmount} ${isIncome ? styles.positive : styles.negative}`}>
                                            {isIncome ? '+' : '-'} {formatAmount(Math.abs(parseFloat(String(tx.amount))))} {currencySymbol}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
