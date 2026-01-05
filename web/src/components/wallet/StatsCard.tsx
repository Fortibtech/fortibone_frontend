'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWalletTransactions, type TransactionType, type TransactionStatus } from '@/lib/api/wallet';
import styles from './StatsCard.module.css';

interface StatsCardProps {
    symbol: string;
    dashboardType: string;
}

export default function StatsCard({ symbol, dashboardType }: StatsCardProps) {
    const [loading, setLoading] = useState(true);
    const [totalIn, setTotalIn] = useState(0);
    const [totalOut, setTotalOut] = useState(0);

    useEffect(() => {
        const fetchTotals = async () => {
            setLoading(true);
            try {
                const [inResp, outResp] = await Promise.all([
                    getWalletTransactions({
                        page: 1,
                        limit: 100,
                        type: 'DEPOSIT' as TransactionType,
                        status: 'COMPLETED' as TransactionStatus,
                    }),
                    getWalletTransactions({
                        page: 1,
                        limit: 100,
                        type: 'WITHDRAWAL' as TransactionType,
                        status: 'COMPLETED' as TransactionStatus,
                    }),
                ]);

                const inflows = Array.isArray(inResp?.data) ? inResp.data : [];
                const outflows = Array.isArray(outResp?.data) ? outResp.data : [];

                const sumIn = inflows.reduce(
                    (acc: number, t: any) => acc + Math.abs(Number(t.amount || 0)),
                    0
                );
                const sumOut = outflows.reduce(
                    (acc: number, t: any) => acc + Math.abs(Number(t.amount || 0)),
                    0
                );

                setTotalIn(sumIn);
                setTotalOut(sumOut);
            } catch (err) {
                console.error('Erreur fetchTotals:', err);
                setTotalIn(0);
                setTotalOut(0);
            } finally {
                setLoading(false);
            }
        };

        fetchTotals();
    }, []);

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Statistiques</h3>
                <Link href={`/dashboard/${dashboardType}/wallet/statistics`} className={styles.seeMore}>
                    <span>Voir plus</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            ) : (
                <div className={styles.statsRow}>
                    {/* Entrées */}
                    <div className={`${styles.statBox} ${styles.statBoxIn}`}>
                        <div className={styles.statLine}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{ transform: 'rotate(-45deg)' }}>
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                            </svg>
                            <span className={styles.statLabel}>Entrées</span>
                        </div>
                        <span className={styles.statAmount}>{formatAmount(totalIn)} {symbol}</span>
                    </div>

                    {/* Sorties */}
                    <div className={`${styles.statBox} ${styles.statBoxOut}`}>
                        <div className={styles.statLine}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ transform: 'rotate(-45deg)' }}>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                            </svg>
                            <span className={styles.statLabel}>Sorties</span>
                        </div>
                        <span className={styles.statAmount}>{formatAmount(totalOut)} {symbol}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
