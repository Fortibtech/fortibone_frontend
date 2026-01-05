'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import WalletStatisticsView from '@/components/wallet/WalletStatisticsView';
import { useBusinessStore } from '@/stores/businessStore';
import { getWallet, getCurrencySymbolById } from '@/lib/api';
import styles from './statistics.module.css';

export default function WalletStatisticsPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [currency, setCurrency] = useState('KMF'); // Default to KMF
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                // Priorité 1: Utiliser la devise du business sélectionné
                if (selectedBusiness?.currencyId) {
                    const symbol = await getCurrencySymbolById(selectedBusiness.currencyId);
                    if (symbol) {
                        setCurrency(symbol);
                        setLoading(false);
                        return;
                    }
                }

                // Priorité 2: Récupérer via le wallet (fallback)
                const wallet = await getWallet();
                if (wallet?.currency?.symbol) {
                    setCurrency(wallet.currency.symbol);
                }
            } catch (error) {
                console.error('Error fetching currency:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrency();
    }, [selectedBusiness]);

    return (
        <DashboardLayout businessType="COMMERCANT">
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Statistiques Financières</h1>
                    <div style={{ width: 40 }} />
                </div>

                <div className={styles.content}>
                    {!loading && <WalletStatisticsView symbol={currency} period="6m" />}
                </div>
            </div>
        </DashboardLayout>
    );
}
