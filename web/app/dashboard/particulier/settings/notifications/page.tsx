'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import styles from './notifications.module.css';

interface NotificationPreferences {
    email: {
        orders: boolean;
        promotions: boolean;
        updates: boolean;
        account: boolean;
    };
    inApp: {
        orders: boolean;
        promotions: boolean;
        updates: boolean;
        account: boolean;
    };
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email: {
            orders: true,
            promotions: true,
            updates: false,
            account: true,
        },
        inApp: {
            orders: true,
            promotions: false,
            updates: true,
            account: true,
        },
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
    });

    const handleToggle = (channel: 'email' | 'inApp', category: keyof NotificationPreferences['email']) => {
        setPreferences(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [category]: !prev[channel][category],
            },
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setSaveSuccess(false);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // await api.put('/users/me/notification-preferences', preferences);

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
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
                    <h1 className={styles.title}>Notifications</h1>
                    <div style={{ width: 45 }} />
                </div>

                <div className={styles.content}>
                    {/* Email Notifications */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📧 Notifications par email</h2>
                        <div className={styles.settingsList}>
                            <ToggleSetting
                                label="Commandes"
                                description="Confirmation, expédition, livraison"
                                checked={preferences.email.orders}
                                onChange={() => handleToggle('email', 'orders')}
                            />
                            <ToggleSetting
                                label="Promotions & offres"
                                description="Réductions, nouveautés, codes promo"
                                checked={preferences.email.promotions}
                                onChange={() => handleToggle('email', 'promotions')}
                            />
                            <ToggleSetting
                                label="Mises à jour"
                                description="Nouvelles fonctionnalités, améliorations"
                                checked={preferences.email.updates}
                                onChange={() => handleToggle('email', 'updates')}
                            />
                            <ToggleSetting
                                label="Compte & sécurité"
                                description="Connexions, changements de mot de passe"
                                checked={preferences.email.account}
                                onChange={() => handleToggle('email', 'account')}
                            />
                        </div>
                    </div>

                    {/* In-App Notifications */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔔 Notifications dans l'application</h2>
                        <div className={styles.settingsList}>
                            <ToggleSetting
                                label="Commandes"
                                description="Nouveaux statuts de vos commandes"
                                checked={preferences.inApp.orders}
                                onChange={() => handleToggle('inApp', 'orders')}
                            />
                            <ToggleSetting
                                label="Promotions & offres"
                                description="Offres spéciales et réductions"
                                checked={preferences.inApp.promotions}
                                onChange={() => handleToggle('inApp', 'promotions')}
                            />
                            <ToggleSetting
                                label="Mises à jour"
                                description="Nouveautés de la plateforme"
                                checked={preferences.inApp.updates}
                                onChange={() => handleToggle('inApp', 'updates')}
                            />
                            <ToggleSetting
                                label="Compte & sécurité"
                                description="Alertes de sécurité importantes"
                                checked={preferences.inApp.account}
                                onChange={() => handleToggle('inApp', 'account')}
                            />
                        </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🌙 Heures tranquilles</h2>
                        <p className={styles.description}>
                            Ne pas recevoir de notifications pendant certaines heures
                        </p>
                        <div className={styles.quietHours}>
                            <ToggleSetting
                                label="Activer les heures tranquilles"
                                checked={preferences.quietHoursEnabled}
                                onChange={() => setPreferences(prev => ({
                                    ...prev,
                                    quietHoursEnabled: !prev.quietHoursEnabled,
                                }))}
                            />
                            {preferences.quietHoursEnabled && (
                                <div className={styles.timeInputs}>
                                    <div className={styles.timeInput}>
                                        <label>Début</label>
                                        <input
                                            type="time"
                                            value={preferences.quietHoursStart}
                                            onChange={(e) => setPreferences(prev => ({
                                                ...prev,
                                                quietHoursStart: e.target.value,
                                            }))}
                                        />
                                    </div>
                                    <span className={styles.timeSeparator}>→</span>
                                    <div className={styles.timeInput}>
                                        <label>Fin</label>
                                        <input
                                            type="time"
                                            value={preferences.quietHoursEnd}
                                            onChange={(e) => setPreferences(prev => ({
                                                ...prev,
                                                quietHoursEnd: e.target.value,
                                            }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className={styles.footer}>
                        {saveSuccess && (
                            <div className={styles.success}>
                                ✓ Préférences sauvegardées
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            className={styles.saveButton}
                            disabled={loading}
                        >
                            {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Toggle Setting Component
interface ToggleSettingProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
    return (
        <div className={styles.toggleSetting}>
            <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>{label}</span>
                {description && <span className={styles.toggleDescription}>{description}</span>}
            </div>
            <button
                className={`${styles.toggle} ${checked ? styles.toggleActive : ''}`}
                onClick={onChange}
                role="switch"
                aria-checked={checked}
            >
                <span className={styles.toggleThumb} />
            </button>
        </div>
    );
}
