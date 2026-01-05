'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import WalletStatisticsView from '@/components/wallet/WalletStatisticsView';
import { useUserStore } from '@/stores/userStore';
import styles from './stats.module.css';

export default function ParticulierStatsPage() {
    const router = useRouter();
    const { userProfile } = useUserStore();
    // Default currency for Particulier (usually KMF/XAF based on region, fallback KMF)
    // In a real app we might fetch user wallet to get currency, or pass it to view
    // For now we assume KMF as per Mobile (finance/Stats uses KMF default)
    const currency = 'KMF';

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Statistiques Financières</h1>
                    <div style={{ width: 40 }} />
                </div>

                <div className={styles.content}>
                    <WalletStatisticsView symbol={currency} period="6m" />
                </div>
            </div>
        </DashboardLayout>
    );
}
