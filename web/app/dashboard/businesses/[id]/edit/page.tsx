'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore, Business, BusinessType } from '@/stores/businessStore';
import { getBusinessById, updateBusiness } from '@/lib/api/business';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './edit.module.css';

const BUSINESS_CONFIG: Record<BusinessType, { icon: string; color: string; label: string }> = {
    COMMERCANT: { icon: '🏪', color: '#7C3AED', label: 'Commerçant' },
    RESTAURATEUR: { icon: '🍽️', color: '#F59E0B', label: 'Restaurateur' },
    FOURNISSEUR: { icon: '📦', color: '#10B981', label: 'Fournisseur' },
    LIVREUR: { icon: '🚚', color: '#3B82F6', label: 'Livreur' },
};

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const businessId = params.id as string;
    const { businesses, setBusinesses } = useBusinessStore();

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phoneNumber: '',
    });

    useEffect(() => {
        const loadBusiness = async () => {
            try {
                setLoading(true);
                // First try to get from store
                const storedBusiness = businesses.find(b => b.id === businessId);
                if (storedBusiness) {
                    setBusiness(storedBusiness);
                    setFormData({
                        name: storedBusiness.name || '',
                        description: storedBusiness.description || '',
                        address: storedBusiness.address || '',
                        phoneNumber: storedBusiness.phoneNumber || '',
                    });
                } else {
                    // Fetch from API
                    const data = await getBusinessById(businessId);
                    if (data) {
                        setBusiness(data);
                        setFormData({
                            name: data.name || '',
                            description: data.description || '',
                            address: data.address || '',
                            phoneNumber: data.phoneNumber || '',
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading business:', error);
            } finally {
                setLoading(false);
            }
        };

        if (businessId) {
            loadBusiness();
        }
    }, [businessId, businesses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business) return;

        try {
            setSaving(true);
            await updateBusiness(business.id, formData);

            // Update in store
            const updatedBusinesses = businesses.map(b =>
                b.id === business.id ? { ...b, ...formData } : b
            );
            setBusinesses(updatedBusinesses);

            router.push('/dashboard/businesses');
        } catch (error) {
            console.error('Error saving business:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Modifier">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Chargement...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!business) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="COMMERCANT" title="Modifier">
                    <div className={styles.errorContainer}>
                        <p>Commerce introuvable</p>
                        <button onClick={() => router.back()}>Retour</button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const config = BUSINESS_CONFIG[business.type];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Modifier">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ← Retour
                        </button>
                        <div
                            className={styles.businessIcon}
                            style={{ backgroundColor: `${config.color}15` }}
                        >
                            <span>{config.icon}</span>
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.title}>Modifier le commerce</h1>
                            <span className={styles.businessType} style={{ color: config.color }}>
                                {config.label}
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Nom du commerce *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Ma Boutique"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Décrivez votre activité..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="address">Adresse</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Ex: 123 Rue du Commerce"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phoneNumber">Téléphone</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Ex: +269 XX XX XX"
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => router.back()}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={saving}
                            >
                                {saving ? 'Sauvegarde...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
