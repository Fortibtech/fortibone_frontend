'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBusiness, type CreateBusinessData } from '@/lib/api/business';
import { getCurrencies, type Currency } from '@/lib/api/currency';
import styles from '../commercant/form.module.css';

type VehicleType = 'MOTO' | 'VELO' | 'VOITURE' | 'CAMION' | 'SCOOTER';

export default function CreateLivreurPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Données du formulaire
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phoneNumber: '',
        currencyId: '',
        vehicleType: 'MOTO' as VehicleType,
        vehiclePlate: '',
        hasInsurance: false,
        deliveryRadius: '',
        latitude: 0,
        longitude: 0,
    });

    // Charger les données
    useEffect(() => {
        const loadData = async () => {
            setLoadingData(true);
            try {
                const currencyData = await getCurrencies();
                setCurrencies(currencyData);

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
                type: 'LIVREUR',
                address: formData.address.trim(),
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                currencyId: formData.currencyId,
            };

            await createBusiness(payload);

            // Succès - rediriger vers le dashboard
            alert('Service de livraison créé avec succès !');
            router.push('/dashboard/livreur');
        } catch (error: any) {
            console.error('Erreur création:', error);
            alert(error.message || 'Erreur lors de la création du service');
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
                    <h1 className={styles.title}>Devenir livreur</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nom */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Votre nom / Nom du service *</label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="ex: Express Delivery Mamadou"
                        />
                        {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>

                    {/* Type de véhicule */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Type de véhicule *</label>
                        <div className={styles.radioGroup}>
                            {([
                                { id: 'MOTO', label: '🏍️ Moto' },
                                { id: 'SCOOTER', label: '🛵 Scooter' },
                                { id: 'VELO', label: '🚲 Vélo' },
                                { id: 'VOITURE', label: '🚗 Voiture' },
                                { id: 'CAMION', label: '🚛 Camion' },
                            ] as { id: VehicleType; label: string }[]).map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`${styles.radioItem} ${formData.vehicleType === type.id ? styles.radioItemSelected : ''}`}
                                    onClick={() => updateField('vehicleType', type.id)}
                                >
                                    <span>{type.label}</span>
                                    {formData.vehicleType === type.id && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Immatriculation */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Immatriculation du véhicule (facultatif)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.vehiclePlate}
                            onChange={(e) => updateField('vehiclePlate', e.target.value)}
                            placeholder="ex: AB-123-CD"
                        />
                    </div>

                    {/* Adresse / Zone */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Zone d'activité principale *</label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Quartier, ville"
                        />
                        {errors.address && <span className={styles.error}>{errors.address}</span>}
                    </div>

                    {/* Rayon de livraison */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Rayon de livraison (km)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.deliveryRadius}
                            onChange={(e) => updateField('deliveryRadius', e.target.value)}
                            placeholder="ex: 10"
                        />
                    </div>

                    {/* Telephone */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Numéro de téléphone</label>
                        <input
                            type="tel"
                            className={styles.input}
                            value={formData.phoneNumber}
                            onChange={(e) => updateField('phoneNumber', e.target.value)}
                            placeholder="ex: +237 6XX XX XX XX"
                        />
                    </div>

                    {/* Assurance */}
                    <div className={styles.formGroup}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.hasInsurance}
                                onChange={(e) => updateField('hasInsurance', e.target.checked)}
                            />
                            <span>J'ai une assurance pour mes livraisons</span>
                        </label>
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description / Présentation *</label>
                        <textarea
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Présentez-vous, votre expérience, vos disponibilités..."
                            rows={4}
                        />
                        <span className={styles.counter}>{formData.description.length}/20 min</span>
                        {errors.description && <span className={styles.error}>{errors.description}</span>}
                    </div>

                    {/* Devise */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Devise préférée *</label>
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
                            'Créer mon profil livreur'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
