'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, getWalletTransactions, type Wallet, type WalletTransaction } from '@/lib/api';
import styles from './finance.module.css';

export default function FinancePage() {
    const router = useRouter();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [hidden, setHidden] = useState(false);
    const [totalDeposits, setTotalDeposits] = useState(0);
    const [totalWithdrawals, setTotalWithdrawals] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Matched Mobile logic: Fetch 100 transactions to calculate expenses accurately
                const [walletData, txData] = await Promise.all([
                    getWallet(),
                    getWalletTransactions({ page: 1, limit: 100 })
                ]);
                setWallet(walletData);
                const allTransactions = txData.data || [];
                setTransactions(allTransactions);

                // Calculate Expenses like mobile TotalExpensesCard
                // Mobile Logic: Sum of negative amounts OR specific provider types
                let expensesSum = 0;
                allTransactions.forEach((tx: WalletTransaction) => {
                    const provider = (tx.provider || '').toUpperCase();
                    const amountRaw = parseFloat(String(tx.amount)) || 0;

                    // Expense conditions from mobile
                    const isExpense = amountRaw < 0 || ['PAYMENT', 'TRANSFER', 'WITHDRAWAL'].includes(provider);

                    if (isExpense && amountRaw < 0) {
                        expensesSum += amountRaw;
                    }
                });

                setTotalWithdrawals(Math.abs(expensesSum));

                // Note: "Total Deposits" is replaced by "Available Balance" in UI to match mobile
                // so we don't strictly need to calculate total deposits here anymore, 
                // but keeping it simple.
            } catch (error) {
                console.error('Erreur chargement wallet:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const balance = parseFloat(wallet?.balance || '0');
    const currencySymbol = wallet?.currency?.symbol || 'KMF';

    const formatAmount = (amount: number) => amount.toLocaleString('fr-FR');

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header - Mobile Style */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Finances</h1>
                    <button className={styles.refreshBtn} onClick={() => window.location.reload()}>
                        🔄
                    </button>
                </div>

                {/* Balance Card - Mobile Style (Green bordered) */}
                <div className={styles.balanceCard}>
                    <div className={styles.balanceRow}>
                        <div className={styles.walletIcon}>💳</div>
                        <span className={styles.balanceLabel}>Active Balance</span>
                    </div>

                    <div className={styles.balanceAmountRow}>
                        {loading ? (
                            <div className={styles.skeleton} style={{ width: 180, height: 32 }} />
                        ) : (
                            <span className={styles.balanceAmount}>
                                {hidden ? '••••••' : `${formatAmount(balance)} ${currencySymbol}`}
                            </span>
                        )}
                        <button className={styles.eyeBtn} onClick={() => setHidden(!hidden)}>
                            {hidden ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    {/* Action Buttons - Mobile Style */}
                    <div className={styles.actionsRow}>
                        <Link href="/dashboard/particulier/finance/wallet/deposit" className={styles.depositBtn}>
                            ↙️ Dépôt
                        </Link>
                        <Link href="/dashboard/particulier/finance/wallet/withdraw" className={styles.withdrawBtn}>
                            ↗️ Retrait
                        </Link>
                        <Link href="/dashboard/particulier/finance/wallet/transfer" className={styles.transferBtn}>
                            ↔️ Transfer
                        </Link>
                    </div>
                </div>

                {/* Stats Card - Mobile Style */}
                <div className={styles.statsCard}>
                    <div className={styles.statsHeader}>
                        <span className={styles.statsTitle}>Statistiques</span>
                        <Link href="/dashboard/particulier/finance/stats" className={styles.seeMore}>
                            Voir plus →
                        </Link>
                    </div>
                    <div className={styles.statsRow}>
                        {/* LEFT: Available Balance (Green Theme like Mobile AvailableBalanceCard) */}
                        <div className={styles.statBox}>
                            <div className={styles.statIcon} style={{ color: '#4CAF50' }}>↙️</div>
                            <span className={styles.statLabel}>Solde disponible</span>
                            <span className={styles.statValue} style={{ color: '#000' }}>
                                {loading ? '...' : `${formatAmount(balance)} ${currencySymbol}`}
                            </span>
                        </div>
                        {/* RIGHT: Expenses (Yellow Theme like Mobile TotalExpensesCard) */}
                        <div className={`${styles.statBox} ${styles.expenseBox}`}>
                            <div className={styles.statIcon} style={{ color: '#FFC107' }}>↗️</div>
                            <span className={styles.statLabel}>En dépenses</span>
                            <span className={styles.statValue} style={{ color: '#000' }}>
                                {loading ? '...' : `${formatAmount(totalWithdrawals)} ${currencySymbol}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions - Mobile Style */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Transactions récentes</h2>
                        <Link href="/dashboard/particulier/finance/wallet/transactions" className={styles.seeAll}>
                            Voir tout
                        </Link>
                    </div>

                    {loading ? (
                        <div className={styles.txList}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.txItem}>
                                    <div className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className={styles.skeleton} style={{ width: '60%', height: 14, marginBottom: 6 }} />
                                        <div className={styles.skeleton} style={{ width: '40%', height: 12 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>💳</span>
                            <p>Aucune transaction récente</p>
                        </div>
                    ) : (
                        <div className={styles.txList}>
                            {transactions.slice(0, 5).map((tx) => {
                                const isIncome = parseFloat(String(tx.amount)) > 0 || tx.provider?.toUpperCase() === 'DEPOSIT';
                                return (
                                    <div key={tx.id} className={styles.txItem}>
                                        <div className={`${styles.txIcon} ${isIncome ? styles.income : styles.expense}`}>
                                            {isIncome ? '↓' : '↑'}
                                        </div>
                                        <div className={styles.txInfo}>
                                            <span className={styles.txTitle}>
                                                {tx.provider === 'DEPOSIT' ? 'Dépôt' :
                                                    tx.provider === 'WITHDRAWAL' ? 'Retrait' :
                                                        tx.provider === 'TRANSFER' ? 'Transfert' : tx.provider}
                                            </span>
                                            {/* Reference ID like Mobile */}
                                            <span className={styles.txRef}>
                                                {(tx as any).providerTransactionId || (tx as any).orderId || tx.id || 'N/A'}
                                            </span>
                                            <span className={styles.txDate}>
                                                {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
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
