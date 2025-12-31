'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBusiness, type CreateBusinessData } from '@/lib/api/business';
import { getCurrencies, type Currency } from '@/lib/api/currency';
import { getSectors, type Sector } from '@/lib/api/sectors';
import styles from './form.module.css';

type CommerceType = 'PHYSICAL' | 'ONLINE' | 'HYBRID';

export default function CreateCommercantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Données du formulaire
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        postalCode: '',
        siret: '',
        websiteUrl: '',
        currencyId: '',
        sectorId: '',
        commerceType: 'PHYSICAL' as CommerceType,
        latitude: 0,
        longitude: 0,
    });

    // Charger les données
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                const [currencyData, sectorData] = await Promise.all([
                    getCurrencies(),
                    getSectors('COMMERCANT'),
                ]);
                setCurrencies(currencyData);
                setSectors(sectorData);

                // Définir devise par défaut (XAF)
                const defaultCurrency = currencyData.find(c => c.code === 'XAF' || c.code === 'KMF');
                if (defaultCurrency) {
                    setFormData(prev => ({ ...prev, currencyId: defaultCurrency.id }));
                }
            } catch (error) {
                console.error('Erreur chargement données:', error);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Effacer l'erreur
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
        if (!formData.description.trim() || formData.description.length < 20) {
            newErrors.description = 'La description doit faire au moins 20 caractères';
        }
        if (!formData.currencyId) newErrors.currencyId = 'La devise est requise';
        if (!formData.sectorId) newErrors.sectorId = 'Le secteur d\'activité est requis';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload: CreateBusinessData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                type: 'COMMERCANT',
                address: formData.address.trim(),
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                currencyId: formData.currencyId,
                activitySector: formData.sectorId,
                commerceType: formData.commerceType,
                postalCode: formData.postalCode || undefined,
                siret: formData.siret || undefined,
                websiteUrl: formData.websiteUrl || undefined,
            };

            await createBusiness(payload);

            // Succès - rediriger vers le dashboard
            alert('Commerce créé avec succès !');
            router.push('/dashboard/commercant');
        } catch (error: any) {
            console.error('Erreur création:', error);
            alert(error.message || 'Erreur lors de la création du commerce');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <button
                        className={styles.backButton}
                        onClick={() => router.back()}
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Créer mon commerce</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nom */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nom du commerce *</label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="ex: Boutique Marie"
                        />
                        {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>

                    {/* Type de commerce */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Type de commerce *</label>
                        <div className={styles.radioGroup}>
                            {(['PHYSICAL', 'ONLINE', 'HYBRID'] as CommerceType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`${styles.radioItem} ${formData.commerceType === type ? styles.radioItemSelected : ''}`}
                                    onClick={() => updateField('commerceType', type)}
                                >
                                    <span>{type === 'PHYSICAL' ? 'Physique' : type === 'ONLINE' ? 'En ligne' : 'Hybride'}</span>
                                    {formData.commerceType === type && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secteur d'activité */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Secteur d'activité *</label>
                        <select
                            className={`${styles.select} ${errors.sectorId ? styles.inputError : ''}`}
                            value={formData.sectorId}
                            onChange={(e) => updateField('sectorId', e.target.value)}
                        >
                            <option value="">Sélectionnez votre secteur</option>
                            {sectors.map((sector) => (
                                <option key={sector.id} value={sector.id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                        {errors.sectorId && <span className={styles.error}>{errors.sectorId}</span>}
                    </div>

                    {/* Adresse */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Adresse complète *</label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Rue, quartier, ville"
                        />
                        {errors.address && <span className={styles.error}>{errors.address}</span>}
                    </div>

                    {/* Code postal */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Code postal</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.postalCode}
                            onChange={(e) => updateField('postalCode', e.target.value)}
                            placeholder="75001"
                        />
                    </div>

                    {/* SIRET */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>SIRET (facultatif)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.siret}
                            onChange={(e) => updateField('siret', e.target.value)}
                            placeholder="123 456 789 00012"
                        />
                    </div>

                    {/* Site web */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Site web (facultatif)</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={formData.websiteUrl}
                            onChange={(e) => updateField('websiteUrl', e.target.value)}
                            placeholder="https://maboutique.com"
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description *</label>
                        <textarea
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Parlez de vos produits, horaires, spécialités..."
                            rows={4}
                        />
                        <span className={styles.counter}>{formData.description.length}/20 min</span>
                        {errors.description && <span className={styles.error}>{errors.description}</span>}
                    </div>

                    {/* Devise */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Devise principale *</label>
                        <select
                            className={`${styles.select} ${errors.currencyId ? styles.inputError : ''}`}
                            value={formData.currencyId}
                            onChange={(e) => updateField('currencyId', e.target.value)}
                        >
                            <option value="">Sélectionnez une devise</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                        {errors.currencyId && <span className={styles.error}>{errors.currencyId}</span>}
                    </div>

                    {/* Bouton submit */}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinnerSmall} />
                                Création en cours...
                            </>
                        ) : (
                            'Créer mon commerce'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
