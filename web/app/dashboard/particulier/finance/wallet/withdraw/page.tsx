'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, createWithdraw, type Wallet } from '@/lib/api';
import styles from './withdraw.module.css';

const presets = [10000, 25000, 50000, 100000, 200000];

export default function WithdrawPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';

    const [method, setMethod] = useState<'KARTAPAY' | 'STRIPE'>('KARTAPAY');
    const [amount, setAmount] = useState<number>(25000);
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

    const balance = parseFloat(wallet?.balance || '0');
    const currencySymbol = wallet?.currency?.symbol || 'KMF';

    const handlePreset = (val: number) => {
        if (val > balance) {
            setError(`Solde insuffisant. Disponible: ${balance.toLocaleString('fr-FR')} ${currencySymbol}`);
            return;
        }
        setAmount(val);
        setCustomInput('');
        setError(null);
    };

    const handleCustomAmount = (text: string) => {
        const nums = text.replace(/[^0-9]/g, '');
        setCustomInput(nums);
        if (nums) {
            const val = parseInt(nums);
            if (val > balance) {
                setError('Solde insuffisant');
                return;
            }
            setAmount(val);
            setError(null);
        }
    };

    const handleWithdraw = async () => {
        if (amount < 1000) {
            setError('Montant minimum: 1 000 ' + currencySymbol);
            return;
        }

        if (amount > balance) {
            setError('Solde insuffisant');
            return;
        }

        if (method === 'KARTAPAY' && !phoneNumber.match(/^\+[0-9]{10,14}$/)) {
            setError('Format téléphone invalide (ex: +261341234567)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await createWithdraw({
                amount,
                method,
                metadata: method === 'KARTAPAY'
                    ? { mobileMoneyNumber: phoneNumber.trim(), note: 'Retrait via application web' }
                    : undefined
            });

            if (result.onboardingUrl) {
                setError('Configuration requise. Veuillez finaliser votre compte.');
                window.open(result.onboardingUrl, '_blank');
                return;
            }

            if (!result.success) {
                setError(result.message || 'Échec du retrait');
                return;
            }

            setSuccess(`Retrait de ${amount.toLocaleString('fr-FR')} ${currencySymbol} initié avec succès!`);
            setTimeout(() => {
                router.push(`/dashboard/${dashboardType}/wallet`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du retrait');
        } finally {
            setLoading(false);
        }
    };

    const canWithdraw = amount >= 1000 && amount <= balance &&
        (method === 'KARTAPAY' ? phoneNumber.length > 8 : true);

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Retrait d&apos;Argent</h1>
                </div>

                <div className={styles.content}>
                    {/* Balance Card - Mobile Style */}
                    <div className={styles.balanceCard}>
                        <span className={styles.balanceLabel}>Solde disponible</span>
                        <span className={styles.balanceAmount}>
                            {balance.toLocaleString('fr-FR')} {currencySymbol}
                        </span>
                    </div>

                    {/* Méthode */}
                    <div className={styles.section}>
                        <label className={styles.label}>Méthode de retrait</label>
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${method === 'KARTAPAY' ? styles.active : ''}`}
                                onClick={() => setMethod('KARTAPAY')}
                            >
                                Mobile Money
                            </button>
                            <button
                                className={`${styles.tab} ${method === 'STRIPE' ? styles.active : ''}`}
                                onClick={() => setMethod('STRIPE')}
                            >
                                Carte bancaire
                            </button>
                        </div>
                    </div>

                    {/* Montant */}
                    <div className={styles.section}>
                        <label className={styles.label}>Montant à retirer</label>
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
                                    disabled={val > balance}
                                    style={{ opacity: val > balance ? 0.5 : 1 }}
                                >
                                    {val.toLocaleString('fr-FR')}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            className={styles.customInput}
                            placeholder="Montant personnalisé..."
                            value={customInput}
                            onChange={(e) => handleCustomAmount(e.target.value)}
                        />
                    </div>

                    {/* Mobile Money */}
                    {method === 'KARTAPAY' && (
                        <div className={styles.section}>
                            <label className={styles.label}>Numéro Mobile Money</label>
                            <input
                                type="tel"
                                className={styles.input}
                                placeholder="+261 34 12 34 56 ou +33 6 12 34 56 78"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <p className={styles.helpText}>
                                L&apos;argent sera envoyé sur ce numéro (MVola, Orange Money, MTN, etc.)
                            </p>
                        </div>
                    )}

                    {method === 'STRIPE' && (
                        <div className={styles.section}>
                            <label className={styles.label}>Retrait sur carte</label>
                            <p className={styles.helpText}>
                                Délai: 2 à 7 jours ouvrés. Frais possibles selon votre banque.
                            </p>
                        </div>
                    )}

                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}
                </div>

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
                        onClick={handleWithdraw}
                        disabled={loading || !canWithdraw}
                    >
                        {loading ? 'Traitement...' : method === 'STRIPE' ? 'Retrait sur carte' : 'Retrait Mobile Money'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
