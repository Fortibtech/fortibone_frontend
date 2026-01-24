'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { updateBusiness } from '@/lib/api/business';
import styles from './settings.module.css';

// Icons
const icons = {
    business: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    notifications: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    security: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    danger: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
};

export default function RestaurateurSettingsPage() {
    const router = useRouter();
    const selectedBusiness = useBusinessStore((s) => s.selectedBusiness);
    const setSelectedBusiness = useBusinessStore((s) => s.setSelectedBusiness);

    const [loading, setLoading] = useState(false);

    // Business settings
    const [businessName, setBusinessName] = useState('');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [orderAlerts, setOrderAlerts] = useState(true);

    useEffect(() => {
        if (selectedBusiness) {
            setBusinessName(selectedBusiness.name || '');
            setDescription(selectedBusiness.description || '');
            setPhone((selectedBusiness as any).phone || '');
            setEmail((selectedBusiness as any).email || '');
            setAddress((selectedBusiness as any).address || '');
        }
    }, [selectedBusiness]);

    const handleSave = async () => {
        if (!selectedBusiness) return;
        setLoading(true);

        try {
            const updated = await updateBusiness(selectedBusiness.id, {
                name: businessName,
                description,
            });
            setSelectedBusiness(updated);
            toast.success('Paramètres sauvegardés avec succès !');
        } catch (err: any) {
            console.error('Erreur sauvegarde:', err);
            toast.error('Erreur lors de la sauvegarde', {
                description: err.response?.data?.message || err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!selectedBusiness) {
        return (
            <DashboardLayout businessType="RESTAURATEUR">
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <p>Sélectionnez un restaurant pour accéder aux paramètres</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout businessType="RESTAURATEUR">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Paramètres</h1>
                    <p className={styles.subtitle}>Gérez les paramètres de votre restaurant</p>
                </div>

                {/* Toast handles success/error messages now */}

                {/* Business Info Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>{icons.business}</span>
                        Informations du restaurant
                    </h2>

                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {selectedBusiness.name?.charAt(0) || 'R'}
                        </div>
                        <div className={styles.avatarInfo}>
                            <h3>{selectedBusiness.name}</h3>
                            <p>{selectedBusiness.type || 'Restaurant'}</p>
                            <button className={styles.changeAvatarBtn}>Changer le logo</button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nom du restaurant</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Nom du restaurant"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez votre restaurant (cuisine, ambiance...)"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Téléphone</label>
                            <input
                                type="tel"
                                className={styles.input}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+269 XXX XX XX"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contact@restaurant.com"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Adresse</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Adresse complète"
                        />
                    </div>
                </div>

                {/* Notifications Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>{icons.notifications}</span>
                        Notifications
                    </h2>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <div className={styles.toggleLabel}>Notifications par email</div>
                            <div className={styles.toggleDescription}>
                                Recevoir les notifications importantes par email
                            </div>
                        </div>
                        <div
                            className={`${styles.toggle} ${emailNotifications ? styles.active : ''}`}
                            onClick={() => setEmailNotifications(!emailNotifications)}
                        >
                            <div className={styles.toggleKnob} />
                        </div>
                    </div>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <div className={styles.toggleLabel}>Notifications push</div>
                            <div className={styles.toggleDescription}>
                                Recevoir les alertes en temps réel
                            </div>
                        </div>
                        <div
                            className={`${styles.toggle} ${pushNotifications ? styles.active : ''}`}
                            onClick={() => setPushNotifications(!pushNotifications)}
                        >
                            <div className={styles.toggleKnob} />
                        </div>
                    </div>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <div className={styles.toggleLabel}>Alertes de commandes</div>
                            <div className={styles.toggleDescription}>
                                Être notifié pour chaque nouvelle commande
                            </div>
                        </div>
                        <div
                            className={`${styles.toggle} ${orderAlerts ? styles.active : ''}`}
                            onClick={() => setOrderAlerts(!orderAlerts)}
                        >
                            <div className={styles.toggleKnob} />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>{icons.security}</span>
                        Sécurité
                    </h2>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <div className={styles.toggleLabel}>Changer le mot de passe</div>
                            <div className={styles.toggleDescription}>
                                Mettre à jour votre mot de passe de connexion
                            </div>
                        </div>
                        <button className={styles.cancelButton}>Modifier</button>
                    </div>
                </div>

                {/* Save Button */}
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                    <button
                        className={styles.cancelButton}
                        onClick={() => router.back()}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
