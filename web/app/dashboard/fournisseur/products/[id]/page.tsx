'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getProductByIdDirect, updateProduct, updateVariant, deleteProduct } from '@/lib/api/products';
import { getAllCategories, ProductCategory } from '@/lib/api/categories';
import { useRouter } from 'next/navigation';
import styles from './edit.module.css';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { selectedBusiness } = useBusinessStore();
    const productId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [productVariantId, setProductVariantId] = useState<string | null>(null);
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
        const loadData = async () => {
            try {
                setLoading(true);
                const [product, fetchedCategories] = await Promise.all([
                    getProductByIdDirect(productId),
                    getAllCategories() // Fetch categories for dropdown
                ]);

                setCategories(fetchedCategories);

                console.log('Product loaded:', product);
                console.log('Categories loaded:', fetchedCategories.length);
                console.log('Product Category ID:', product.categoryId);

                const matchingCategory = fetchedCategories.find(s => s.id === product.categoryId);
                console.log('Found matching category:', matchingCategory ? 'YES' : 'NO', matchingCategory);

                if (!matchingCategory && product.categoryId) {
                    console.warn(`Category ID ${product.categoryId} not found in categories list. Available IDs:`, fetchedCategories.map(s => s.id).slice(0, 5) + '...');
                }

                let variant = null;
                if (product.variants && product.variants.length > 0) {
                    variant = product.variants[0];
                    setProductVariantId(variant.id);
                }

                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: variant ? variant.price.toString() : '',
                    purchasePrice: variant ? variant.purchasePrice.toString() : '',
                    stock: variant ? variant.quantityInStock.toString() : '',
                    sku: variant ? variant.sku : '',
                    categoryId: product.categoryId || '',
                });
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError('Impossible de charger le produit');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadData();
        }
    }, [productId]);

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
            setError('Veuillez remplir les champs obligatoires (Nom et Prix)');
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

        setSaving(true);
        setError('');

        try {
            // Update product details
            await updateProduct(selectedBusiness.id, productId, {
                name: formData.name,
                description: formData.description || 'Sans description',
                categoryId: formData.categoryId || undefined,
            });

            // Update variant details if a variant exists
            if (productVariantId) {
                await updateVariant(selectedBusiness.id, productId, productVariantId, {
                    sku: formData.sku,
                    price: parseFloat(formData.price),
                    purchasePrice: parseFloat(formData.purchasePrice) || 0,
                    quantityInStock: parseInt(formData.stock) || 0,
                });
            }

            alert('✅ Produit mis à jour avec succès');
            router.push('/dashboard/fournisseur/products');
        } catch (err: any) {
            console.error('Update error:', err);
            console.error('Error response:', err.response?.data);
            const msg = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
            setError(`Erreur: ${msg} (Status: ${err.response?.status})`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBusiness || !confirm('Êtes-vous sûr de vouloir supprimer définitivement ce produit ?')) return;

        setSaving(true);
        try {
            await deleteProduct(selectedBusiness.id, productId);
            router.push('/dashboard/fournisseur/products');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="FOURNISSEUR" title="Chargement...">
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement du produit...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Modifier le produit">
                <div className={styles.container}>
                    <div className={styles.header}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            ← Retour
                        </button>
                        <div className={styles.headerContent}>
                            <h1>Modifier le produit</h1>
                            <button
                                className={styles.deleteHeaderBtn}
                                onClick={handleDelete}
                                type="button"
                            >
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label>Nom du produit *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Catégorie</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
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
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Stock actuel</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleChange('stock', e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>SKU / Référence</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => handleChange('sku', e.target.value)}
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
                                disabled={saving}
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
