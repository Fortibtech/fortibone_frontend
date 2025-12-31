'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import styles from './security.module.css';

export default function SecurityPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'password' | 'sessions' | 'log'>('password');

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Tous les champs sont requis');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            setPasswordLoading(true);

            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors du changement de mot de passe');
            }

            setPasswordSuccess('Mot de passe changé avec succès');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Sécurité</h1>
                    <div style={{ width: 45 }} />
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'password' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Mot de passe
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        Sessions
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'log' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('log')}
                    >
                        Historique
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Changer le mot de passe</h2>
                            <form onSubmit={handlePasswordChange} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Mot de passe actuel
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Entrez votre mot de passe actuel"
                                        disabled={passwordLoading}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Au moins 6 caractères"
                                        disabled={passwordLoading}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Confirmer le nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez le nouveau mot de passe"
                                        disabled={passwordLoading}
                                    />
                                </div>

                                {passwordError && (
                                    <div className={styles.error}>{passwordError}</div>
                                )}

                                {passwordSuccess && (
                                    <div className={styles.success}>{passwordSuccess}</div>
                                )}

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Sessions actives</h2>
                            <p className={styles.description}>
                                Gérez vos sessions actives. Vous pouvez révoquer l'accès aux appareils que vous n'utilisez plus.
                            </p>
                            <div className={styles.placeholder}>
                                <span className={styles.placeholderIcon}>🔒</span>
                                <p>Fonctionnalité en cours de développement</p>
                                <p className={styles.placeholderSubtext}>
                                    Bientôt, vous pourrez voir tous vos appareils connectés
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Security Log Tab */}
                    {activeTab === 'log' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Historique de sécurité</h2>
                            <p className={styles.description}>
                                Consultez l'historique de vos connexions et activit és de sécurité.
                            </p>
                            <div className={styles.placeholder}>
                                <span className={styles.placeholderIcon}>📜</span>
                                <p>Fonctionnalité en cours de développement</p>
                                <p className={styles.placeholderSubtext}>
                                    Bientôt, vous pourrez voir votre historique de connexion
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
