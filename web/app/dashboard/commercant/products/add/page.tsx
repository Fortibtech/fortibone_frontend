'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { createProduct, createVariant } from '@/lib/api/products';
import { useRouter } from 'next/navigation';
import styles from './add.module.css';

export default function AddProductPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        stock: '',
        sku: '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) {
            setError('Aucun commerce sélectionné');
            return;
        }

        if (!formData.name || !formData.price) {
            setError('Veuillez remplir les champs obligatoires');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create the product first
            const product = await createProduct(selectedBusiness.id, {
                name: formData.name,
                description: formData.description || 'Sans description',
                categoryId: '', // Will use default category
                salesUnit: 'UNIT'
            });

            // Then create a variant with pricing
            await createVariant(selectedBusiness.id, product.id, {
                sku: formData.sku || `SKU-${Date.now()}`,
                price: parseFloat(formData.price),
                purchasePrice: parseFloat(formData.purchasePrice) || 0,
                quantityInStock: parseInt(formData.stock) || 0,
                attributes: []
            });

            router.push('/dashboard/commercant/products');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Ajouter un produit">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ← Retour
                        </button>
                        <h1>Nouveau produit</h1>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label>Nom du produit *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Ex: T-shirt noir"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Décrivez votre produit..."
                                rows={4}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Prix de vente (€) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Prix d'achat (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Stock initial</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleChange('stock', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>SKU / Référence</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => handleChange('sku', e.target.value)}
                                    placeholder="Ex: TSHIRT-BLK-M"
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
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
                                disabled={loading}
                            >
                                {loading ? 'Création...' : 'Créer le produit'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
