'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getBusinessById } from '@/lib/api/business';
import { getProducts, Product } from '@/lib/api/products';
import { Business } from '@/stores/businessStore';
import WebBusinessHeader from '@/components/business/WebBusinessHeader';
import WebProductCard from '@/components/cards/WebProductCard';
import styles from './business-detail.module.css';

interface BusinessDetailPageProps {
    params: { id: string };
}

export default function BusinessDetailPage({ params }: BusinessDetailPageProps) {
    const businessId = params.id;
    const router = useRouter();

    const [business, setBusiness] = useState<Business | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch business details
    const fetchBusiness = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBusinessById(businessId);
            setBusiness(data);
        } catch (err: any) {
            console.error('Error fetching business:', err);
            setError(err.message || 'Impossible de charger cette entreprise');
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    // Fetch business products
    const fetchProducts = useCallback(async () => {
        if (!businessId) return;
        try {
            setProductsLoading(true);
            const response = await getProducts(businessId, { limit: 50 });
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setProductsLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchBusiness();
        fetchProducts();
    }, [fetchBusiness, fetchProducts]);

    if (loading) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Chargement...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !business) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.error}>
                    <span className={styles.errorIcon}>❌</span>
                    <h2>Entreprise introuvable</h2>
                    <p>{error || 'Cette entreprise n\'existe pas ou a été supprimée.'}</p>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← Retour
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Back button */}
                <button onClick={() => router.back()} className={styles.backButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Retour
                </button>

                {/* Unified Header */}
                <WebBusinessHeader
                    name={business.name}
                    type="BUSINESS"
                    coverImageUrl={business.coverImageUrl}
                    logoUrl={business.logoUrl}
                    rating={business.averageRating || 0}
                    reviewCount={business.reviewCount || 0}
                    description={business.description}
                    address={business.address}
                    phoneNumber={business.phoneNumber}
                    isVerified={business.isVerified}
                />

                {/* Products Section */}
                <section className={styles.productsSection}>
                    <h2 className={styles.sectionTitle}>
                        Produits disponibles
                        {products.length > 0 && (
                            <span className={styles.productCount}>({products.length})</span>
                        )}
                    </h2>

                    {productsLoading ? (
                        <div className={styles.productsLoading}>
                            <div className={styles.spinner} />
                            <p>Chargement des produits...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.emptyProducts}>
                            <span className={styles.emptyIcon}>📦</span>
                            <p>Aucun produit disponible pour le moment</p>
                        </div>
                    ) : (
                        <div className={styles.productsGrid}>
                            {products.map((product) => {
                                const firstVariant = product.variants?.[0];
                                const price = firstVariant ? parseFloat(firstVariant.price) : 0;
                                const imageUrl = product.imageUrl || firstVariant?.imageUrl;

                                return (
                                    <WebProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        price={price}
                                        currencyCode="KMF"
                                        imageUrl={imageUrl || undefined}
                                        rating={0}
                                        reviewCount={0}
                                        onPress={() => router.push(`/dashboard/particulier/product/${product.id}?businessId=${businessId}`)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
