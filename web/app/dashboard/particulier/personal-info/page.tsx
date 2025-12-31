'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useUserStore } from '@/stores/userStore';
import styles from './personal-info.module.css';

export default function PersonalInfoPage() {
    const router = useRouter();
    const { userProfile, setUserProfile } = useUserStore();

    const [formData, setFormData] = useState({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        email: userProfile?.email || '',
        phone: userProfile?.phoneNumber || '',
        address: userProfile?.address || '',
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // TODO: Replace with actual API call
            // await api.put('/users/me', formData);

            // Update local store
            if (userProfile) {
                setUserProfile({
                    ...userProfile,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phone,
                    address: formData.address,
                });
            }

            alert('Informations mises à jour avec succès !');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
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
                    <h1 className={styles.title}>Informations personnelles</h1>
                    <div style={{ width: 45 }} />
                </div>

                <div className={styles.content}>
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Prénom</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                placeholder="Votre prénom"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nom</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                placeholder="Votre nom"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className={styles.disabled}
                            />
                            <span className={styles.hint}>L'email ne peut pas être modifié</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Téléphone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Votre numéro de téléphone"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Adresse</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Votre adresse complète"
                                rows={3}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSave}
                            className={styles.saveButton}
                            disabled={saving}
                        >
                            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
