'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBusiness, type CreateBusinessData } from '@/lib/api/business';
import { getCurrencies, type Currency } from '@/lib/api/currency';
import { getSectors, type Sector } from '@/lib/api/sectors';
import styles from '../commercant/form.module.css';

type CuisineType = 'FAST_FOOD' | 'TRADITIONAL' | 'FINE_DINING' | 'CAFE' | 'OTHER';

export default function CreateRestaurateurPage() {
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
        cuisineType: 'TRADITIONAL' as CuisineType,
        latitude: 0,
        longitude: 0,
        tableCount: '',
        hasDelivery: false,
        hasTakeaway: false,
    });

    // Charger les données
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                const [currencyData, sectorData] = await Promise.all([
                    getCurrencies(),
                    getSectors('RESTAURATEUR'),
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

    const updateField = (field: string, value: string | boolean) => {
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
        if (!formData.sectorId) newErrors.sectorId = 'Le type de cuisine est requis';

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
                type: 'RESTAURATEUR',
                address: formData.address.trim(),
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                currencyId: formData.currencyId,
                activitySector: formData.sectorId,
                postalCode: formData.postalCode || undefined,
                siret: formData.siret || undefined,
                websiteUrl: formData.websiteUrl || undefined,
            };

            await createBusiness(payload);

            // Succès - rediriger vers le dashboard
            alert('Restaurant créé avec succès !');
            router.push('/dashboard/restaurateur');
        } catch (error: any) {
            console.error('Erreur création:', error);
            alert(error.message || 'Erreur lors de la création du restaurant');
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
                    <h1 className={styles.title}>Créer mon restaurant</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nom */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nom du restaurant *</label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="ex: Le Petit Bistrot"
                        />
                        {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>

                    {/* Type de cuisine */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Type de cuisine *</label>
                        <div className={styles.radioGroup}>
                            {([
                                { id: 'TRADITIONAL', label: 'Traditionnel' },
                                { id: 'FAST_FOOD', label: 'Fast Food' },
                                { id: 'FINE_DINING', label: 'Gastronomique' },
                                { id: 'CAFE', label: 'Café/Bar' },
                                { id: 'OTHER', label: 'Autre' },
                            ] as { id: CuisineType; label: string }[]).map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`${styles.radioItem} ${formData.cuisineType === type.id ? styles.radioItemSelected : ''}`}
                                    onClick={() => updateField('cuisineType', type.id)}
                                >
                                    <span>{type.label}</span>
                                    {formData.cuisineType === type.id && (
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
                        <label className={styles.label}>Spécialité culinaire *</label>
                        <select
                            className={`${styles.select} ${errors.sectorId ? styles.inputError : ''}`}
                            value={formData.sectorId}
                            onChange={(e) => updateField('sectorId', e.target.value)}
                        >
                            <option value="">Sélectionnez votre spécialité</option>
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

                    {/* Nombre de tables */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre de tables (facultatif)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.tableCount}
                            onChange={(e) => updateField('tableCount', e.target.value)}
                            placeholder="ex: 15"
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
                            placeholder="https://monrestaurant.com"
                        />
                    </div>

                    {/* Services proposés */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Services proposés</label>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasDelivery}
                                    onChange={(e) => updateField('hasDelivery', e.target.checked)}
                                />
                                Livraison
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.hasTakeaway}
                                    onChange={(e) => updateField('hasTakeaway', e.target.checked)}
                                />
                                À emporter
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description *</label>
                        <textarea
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Décrivez votre restaurant, votre cuisine, vos spécialités..."
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
                            'Créer mon restaurant'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
