'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, createDeposit, type Wallet } from '@/lib/api';
import styles from './deposit.module.css';

const presets = [10000, 20000, 50000, 100000];

export default function DepositPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';

    const [method, setMethod] = useState<'STRIPE' | 'KARTAPAY'>('STRIPE');
    const [amount, setAmount] = useState<number>(50000);
    const [customInput, setCustomInput] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const data = await getWallet();
                setWallet(data);
            } catch (err) {
                console.error('Erreur chargement wallet:', err);
            }
        };
        fetchWallet();
    }, []);

    const currencySymbol = wallet?.currency?.symbol || 'XAF';

    const handlePreset = (val: number) => {
        setAmount(val);
        setCustomInput('');
    };

    const handleCustomAmount = (text: string) => {
        const nums = text.replace(/[^0-9]/g, '');
        setCustomInput(nums);
        if (nums) {
            setAmount(parseInt(nums));
        }
    };

    const handleDeposit = async () => {
        if (amount < 1000) {
            setError('Montant minimum: 1 000 ' + currencySymbol);
            return;
        }

        if (method === 'KARTAPAY' && !phoneNumber.match(/^\+[0-9]{10,14}$/)) {
            setError('Format téléphone invalide (ex: +261341234567)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createDeposit({
                amount,
                method,
                metadata: method === 'KARTAPAY'
                    ? { phoneNumber, note: 'Dépôt via application web' }
                    : { note: 'Dépôt via carte bancaire' }
            });

            setSuccess(`Dépôt de ${amount.toLocaleString('fr-FR')} ${currencySymbol} initié avec succès!`);
            setTimeout(() => {
                router.push(`/dashboard/${dashboardType}/wallet`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du dépôt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Dépôt d&apos;Argent</h1>
                </div>

                {/* Progress */}
                <div className={styles.progress}>
                    <div className={styles.progressBar}>
                        <div className={`${styles.progressSegment} ${styles.active}`} />
                        <div className={styles.progressSegment} />
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Méthode */}
                    <div className={styles.section}>
                        <label className={styles.label}>Méthode de paiement</label>
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${method === 'STRIPE' ? styles.active : ''}`}
                                onClick={() => setMethod('STRIPE')}
                            >
                                Carte bancaire
                            </button>
                            <button
                                className={`${styles.tab} ${method === 'KARTAPAY' ? styles.active : ''}`}
                                onClick={() => setMethod('KARTAPAY')}
                            >
                                Mobile Money
                            </button>
                        </div>
                    </div>

                    {/* Montant */}
                    <div className={styles.section}>
                        <label className={styles.label}>Montant</label>
                        <div className={styles.card}>
                            <div className={styles.amountDisplay}>
                                <span className={styles.amountValue}>{amount.toLocaleString('fr-FR')}</span>
                                <span className={styles.currency}>{currencySymbol}</span>
                            </div>

                            <div className={styles.presets}>
                                {presets.map((val) => (
                                    <button
                                        key={val}
                                        className={`${styles.preset} ${amount === val ? styles.active : ''}`}
                                        onClick={() => handlePreset(val)}
                                    >
                                        {val.toLocaleString('fr-FR')}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                className={styles.customInput}
                                placeholder="Montant personnalisé..."
                                value={customInput ? parseInt(customInput).toLocaleString('fr-FR') : ''}
                                onChange={(e) => handleCustomAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Champs spécifiques */}
                    {method === 'STRIPE' && (
                        <div className={styles.section}>
                            <label className={styles.label}>Carte bancaire</label>
                            <div className={styles.cardInputWrapper}>
                                <p className={styles.stripeNote}>
                                    Vous serez redirigé vers une page de paiement sécurisée Stripe.
                                </p>
                            </div>
                        </div>
                    )}

                    {method === 'KARTAPAY' && (
                        <div className={styles.section}>
                            <label className={styles.label}>Numéro Mobile Money</label>
                            <input
                                type="tel"
                                className={styles.input}
                                placeholder="+261 34 12 345 67"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <p className={styles.helpText}>
                                Vous recevrez une notification pour confirmer le paiement
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.cancelButton}
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleDeposit}
                        disabled={loading || amount < 1000}
                    >
                        {loading ? 'Traitement...' : method === 'STRIPE' ? 'Payer par carte' : 'Continuer'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
