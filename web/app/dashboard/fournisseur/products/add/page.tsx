'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { createProduct, createVariant } from '@/lib/api/products';
import { getAllCategories, ProductCategory } from '@/lib/api/categories';
import { useRouter } from 'next/navigation';
import styles from './add.module.css';

export default function AddProductPage() {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<ProductCategory[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        purchasePrice: '',
        stock: '',
        sku: '',
        categoryId: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            // Fetch validation categories
            // Note: For products, we use 'sectors' as categories currently
            // Ideally we should use a dedicated 'product categories' endpoint if available
            try {
                const fetchedCategories = await getAllCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) {
            setError('Aucun commerce sélectionné');
            return;
        }

        if (!formData.name || !formData.price || !formData.categoryId) {
            setError('Veuillez remplir les champs obligatoires (Nom, Prix, Catégorie)');
            return;
        }

        if (formData.name.trim().length < 3) {
            setError('Le nom du produit doit contenir au moins 3 caractères');
            return;
        }

        if (!formData.description || formData.description.trim().length < 10) {
            setError('La description est obligatoire et doit contenir au moins 10 caractères');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Creating product with:', {
                businessId: selectedBusiness.id,
                payload: {
                    name: formData.name,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    salesUnit: 'UNIT'
                }
            });

            // Create the product first
            const product = await createProduct(selectedBusiness.id, {
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                salesUnit: 'UNIT'
            });

            console.log('Product created:', product);

            // Try to create a variant with pricing (may fail if category requires attributes)
            try {
                await createVariant(selectedBusiness.id, product.id, {
                    sku: formData.sku || `SKU-${Date.now()}`,
                    price: parseFloat(formData.price),
                    purchasePrice: parseFloat(formData.purchasePrice) || 0,
                    quantityInStock: parseInt(formData.stock) || 0,
                    attributes: []
                });
                console.log('Variant created successfully');
            } catch (variantErr: any) {
                console.warn('Variant creation failed (may require category attributes):', variantErr.response?.data?.message);
                // We still redirect since product was created - user can add variant later
            }

            router.push('/dashboard/fournisseur/products');
        } catch (err: any) {
            console.error('Submission error:', err);
            console.error('Error response:', err.response?.data);
            const msg = err.response?.data?.message || err.message || 'Erreur lors de la création';
            setError(`Erreur: ${msg} (Status: ${err.response?.status})`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Ajouter un produit">
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
                                placeholder="Ex: Carton de tomates"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Catégorie *</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
                                required
                                className={styles.select}
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Décrivez votre produit en détail (minimum 10 caractères)..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Prix de vente (KMF) *</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Prix d'achat (KMF)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                                    placeholder="0"
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
                                    placeholder="Ex: TOMATE-CRT-01"
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
