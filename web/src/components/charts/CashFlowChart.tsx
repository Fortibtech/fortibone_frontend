'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getWalletTransactions } from '@/lib/api';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import styles from './Charts.module.css';

export interface CashFlowData {
    month: string;
    revenue: number;
    expense: number;
}

interface CashFlowChartProps {
    period?: '6m' | '12m';
    currency?: string;
}

export default function CashFlowChart({
    period = '6m',
    currency = 'XAF',
}: CashFlowChartProps) {
    const [data, setData] = useState<CashFlowData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllTransactionsInPeriod = async (start: string, end: string) => {
            const allTxs: any[] = [];
            let page = 1;
            while (true) {
                const res = await getWalletTransactions({
                    startDate: start,
                    endDate: end,
                    status: 'COMPLETED',
                    limit: 100,
                    page,
                });
                const items = Array.isArray(res) ? res : res?.data || [];
                allTxs.push(...items);
                if (items.length < 100) break;
                page++;
            }
            return allTxs;
        };

        const load = async () => {
            setLoading(true);
            try {
                const monthsCount = period === '6m' ? 6 : 12;
                const endDate = new Date();
                const startDateObj = subMonths(endDate, monthsCount - 1);

                const start = format(startOfMonth(startDateObj), 'yyyy-MM-dd');
                const end = format(endOfMonth(endDate), 'yyyy-MM-dd');

                const transactions = await fetchAllTransactionsInPeriod(start, end);

                const months = eachMonthOfInterval({
                    start: startDateObj,
                    end: endDate,
                });

                const result: CashFlowData[] = months.map((monthDate) => {
                    const monthKey = format(monthDate, 'yyyy-MM');
                    const monthName =
                        format(monthDate, 'MMM', { locale: fr }).charAt(0).toUpperCase() +
                        format(monthDate, 'MMM', { locale: fr }).slice(1);

                    const monthTxs = transactions.filter(
                        (t: any) =>
                            format(new Date(t.createdAt || t.created_at), 'yyyy-MM') ===
                            monthKey
                    );

                    let revenue = 0;
                    let expense = 0;

                    monthTxs.forEach((t: any) => {
                        const amount = Number(t.amount) || 0;
                        const provider = (t.provider || '').toString().toUpperCase();
                        const type = (t.type || '').toString().toUpperCase();

                        const isIncome =
                            amount > 0 ||
                            provider === 'DEPOSIT' ||
                            provider === 'REFUND' ||
                            provider === 'ADJUSTMENT' ||
                            type === 'DEPOSIT' ||
                            type === 'REFUND';

                        if (isIncome) {
                            revenue += Math.abs(amount);
                        } else {
                            expense += Math.abs(amount);
                        }
                    });

                    return {
                        month: monthName,
                        revenue: Math.round(revenue / 1000), // en milliers
                        expense: Math.round(expense / 1000), // en milliers
                    };
                });

                setData(result);
            } catch (err) {
                console.error('Erreur CashFlowChart :', err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [period]);

    const formatAxisLabel = (value: number) => {
        if (value === 0) return '0';
        return `${Math.round(value)}K`;
    };

    if (loading) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#10b981' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📊</span>
                        Flux de trésorerie
                    </h3>
                    <p className={styles.chartSubtitle}>
                        {period === '6m' ? '6' : '12'} mois • {currency}
                    </p>
                </div>
                <div className={styles.loadingChart}>
                    <div className={styles.spinner} style={{ borderTopColor: '#10b981' }} />
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#10b981' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📊</span>
                        Flux de trésorerie
                    </h3>
                    <p className={styles.chartSubtitle}>
                        {period === '6m' ? '6' : '12'} mois • {currency}
                    </p>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>📊</span>
                    <p className={styles.emptyText}>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer} style={{ borderColor: '#10b981' }}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    <span className={styles.chartIcon}>📊</span>
                    Flux de trésorerie
                </h3>
                <p className={styles.chartSubtitle}>
                    {period === '6m' ? '6' : '12'} mois • Montant en K{currency}
                </p>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAxisLabel}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => [`${value || 0}K ${currency}`, '']}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '16px' }}
                            formatter={(value) => (
                                <span style={{ color: '#374151', fontSize: '13px' }}>{value}</span>
                            )}
                        />
                        <Bar
                            dataKey="revenue"
                            name="Revenus"
                            fill="#00af66"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                        />
                        <Bar
                            dataKey="expense"
                            name="Dépenses"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
