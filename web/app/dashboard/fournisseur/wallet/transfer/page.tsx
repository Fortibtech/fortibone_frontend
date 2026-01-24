'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, transferMoney, type Wallet } from '@/lib/api';
import styles from '../deposit/deposit.module.css';

const presets = [5000, 10000, 25000, 50000, 100000];

export default function TransferPage() {
    const router = useRouter();
    const pathname = usePathname();
    const dashboardType = pathname.split('/')[2] || 'commercant';

    const [amount, setAmount] = useState<number>(10000);
    const [customInput, setCustomInput] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');
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
    const currencySymbol = wallet?.currency?.symbol || 'XAF';

    const handlePreset = (val: number) => {
        if (val > balance) {
            setError(`Solde insuffisant`);
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

    const handleTransfer = async () => {
        if (amount < 100) {
            setError('Montant minimum: 100 ' + currencySymbol);
            return;
        }

        if (amount > balance) {
            setError('Solde insuffisant');
            return;
        }

        if (!recipient.trim()) {
            setError('Veuillez entrer un email ou téléphone');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await transferMoney(amount, recipient.trim());

            setSuccess(`${amount.toLocaleString('fr-FR')} ${currencySymbol} envoyés avec succès!`);
            setTimeout(() => {
                router.push(`/dashboard/${dashboardType}/wallet`);
            }, 2000);
        } catch (err: any) {
            let msg = err.message || 'Échec du transfert';
            if (msg.includes('non trouvé')) msg = 'Aucun utilisateur trouvé avec cet identifiant';
            if (msg.includes('Solde insuffisant')) msg = "Vous n'avez pas assez sur votre portefeuille";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const canTransfer = amount >= 100 && amount <= balance && recipient.trim().length > 0;

    return (
        <DashboardLayout businessType={dashboardType.toUpperCase() as any}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Transfert d&apos;argent</h1>
                </div>

                <div className={styles.content}>
                    {/* Balance Card */}
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        border: '2px solid #00BFA5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Solde disponible</p>
                        <p style={{ fontSize: 32, fontWeight: 700, color: '#00BFA5' }}>
                            {balance.toLocaleString('fr-FR')} {currencySymbol}
                        </p>
                    </div>

                    {/* Montant */}
                    <div className={styles.section}>
                        <label className={styles.label}>Montant à transférer</label>
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

                    {/* Destinataire */}
                    <div className={styles.section}>
                        <label className={styles.label}>Destinataire</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="Email du destinataire"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                        <p className={styles.helpText}>
                            Exemple: jean@gmail.com
                        </p>
                    </div>

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
                        onClick={handleTransfer}
                        disabled={loading || !canTransfer}
                    >
                        {loading ? 'Traitement...' : "Envoyer l'argent"}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
