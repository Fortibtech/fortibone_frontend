'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWalletTransactions, type WalletTransaction, type TransactionType, type TransactionStatus } from '@/lib/api';
import styles from './transactions.module.css';

type DatePreset = 'all' | 'today' | 'week' | 'month';

export default function TransactionsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';

    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | ''>('');
    const [datePreset, setDatePreset] = useState<DatePreset>('all');
    const [showFilters, setShowFilters] = useState(false);

    const limit = 20;

    const loadTransactions = useCallback(async (isRefresh = false) => {
        if (!hasMore && !isRefresh) return;

        try {
            isRefresh ? setLoading(true) : setLoadingMore(true);
            const currentPage = isRefresh ? 1 : page;

            let startDate: string | undefined;
            let endDate: string | undefined;
            const today = new Date();

            if (datePreset === 'today') {
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
            } else if (datePreset === 'week') {
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = weekAgo.toISOString().split('T')[0];
            } else if (datePreset === 'month') {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            }

            const response = await getWalletTransactions({
                page: currentPage,
                limit,
                search: searchText || undefined,
                type: selectedType || undefined,
                status: selectedStatus || undefined,
                startDate,
                endDate,
            });

            const data = response.data || [];
            setTransactions(isRefresh ? data : [...transactions, ...data]);
            setHasMore(data.length === limit);
            if (!isRefresh) setPage(p => p + 1);
            if (isRefresh) setPage(2);
        } catch (error) {
            console.error('Erreur chargement transactions:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page, hasMore, searchText, selectedType, selectedStatus, datePreset, transactions]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadTransactions(true);
    }, [searchText, selectedType, selectedStatus, datePreset]);

    const resetFilters = () => {
        setSelectedType('');
        setSelectedStatus('');
        setDatePreset('all');
        setSearchText('');
    };

    const activeFiltersCount = (selectedType ? 1 : 0) + (selectedStatus ? 1 : 0) + (datePreset !== 'all' ? 1 : 0);

    const getTransactionTitle = (tx: WalletTransaction) => {
        const provider = tx.provider?.toUpperCase();
        switch (provider) {
            case 'DEPOSIT': return "Dépôt d'argent";
            case 'WITHDRAWAL': return "Retrait d'argent";
            case 'PAYMENT': return 'Paiement reçu';
            case 'REFUND': return 'Remboursement';
            case 'TRANSFER': return 'Transfert';
            default: return tx.provider || 'Transaction';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Historique</h1>
                    <button
                        className={styles.filterButton}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                        </svg>
                        {activeFiltersCount > 0 && (
                            <span className={styles.filterBadge}>{activeFiltersCount}</span>
                        )}
                    </button>
                </div>

                {/* Search */}
                <div className={styles.searchContainer}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Rechercher..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <button onClick={() => setSearchText('')} className={styles.clearButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className={styles.filtersPanel}>
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Type</label>
                            <div className={styles.chips}>
                                {(['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'TRANSFER'] as TransactionType[]).map((t) => (
                                    <button
                                        key={t}
                                        className={`${styles.chip} ${selectedType === t ? styles.active : ''}`}
                                        onClick={() => setSelectedType(selectedType === t ? '' : t)}
                                    >
                                        {t === 'DEPOSIT' ? 'Dépôt' : t === 'WITHDRAWAL' ? 'Retrait' : t === 'PAYMENT' ? 'Paiement' : 'Transfert'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status filter - MATCHING MOBILE */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Statut</label>
                            <div className={styles.chips}>
                                {(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] as TransactionStatus[]).map((s) => (
                                    <button
                                        key={s}
                                        className={`${styles.chip} ${selectedStatus === s ? styles.active : ''}`}
                                        onClick={() => setSelectedStatus(selectedStatus === s ? '' : s)}
                                    >
                                        {s === 'COMPLETED' ? 'Terminée' : s === 'PENDING' ? 'En attente' : s === 'FAILED' ? 'Échouée' : 'Annulée'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Période</label>
                            <div className={styles.chips}>
                                {(['all', 'today', 'week', 'month'] as DatePreset[]).map((p) => (
                                    <button
                                        key={p}
                                        className={`${styles.chip} ${datePreset === p ? styles.active : ''}`}
                                        onClick={() => setDatePreset(p)}
                                    >
                                        {p === 'all' ? 'Tout' : p === 'today' ? "Aujourd'hui" : p === 'week' ? '7 jours' : 'Ce mois'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className={styles.resetButton} onClick={resetFilters}>
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}

                {/* Transactions List */}
                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <p className={styles.emptyTitle}>Aucune transaction</p>
                            <p className={styles.emptyText}>
                                {activeFiltersCount > 0 ? 'Modifiez les filtres' : 'Elles apparaîtront ici'}
                            </p>
                        </div>
                    ) : (
                        transactions.map((tx) => {
                            const isIncome = parseFloat(String(tx.amount)) > 0 || tx.provider?.toUpperCase() === 'DEPOSIT';
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
                                        <span className={styles.txTitle}>{getTransactionTitle(tx)}</span>
                                        <span className={styles.txReference}>{tx.providerTransactionId || tx.id}</span>
                                        <span className={styles.txDate}>{formatDate(tx.createdAt)}</span>
                                    </div>
                                    <span className={`${styles.txAmount} ${isIncome ? styles.positive : styles.negative}`}>
                                        {isIncome ? '+' : '-'} {Math.abs(parseFloat(String(tx.amount))).toLocaleString('fr-FR')} {tx.currencyCode}
                                    </span>
                                </div>
                            );
                        })
                    )}

                    {loadingMore && (
                        <div className={styles.loadingMore}>
                            <div className={styles.spinner} />
                        </div>
                    )}

                    {hasMore && !loading && !loadingMore && transactions.length > 0 && (
                        <button className={styles.loadMoreButton} onClick={() => loadTransactions()}>
                            Charger plus
                        </button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
