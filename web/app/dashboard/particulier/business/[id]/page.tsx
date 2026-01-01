'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getBusinessById } from '@/lib/api/business';
import { getProducts, Product } from '@/lib/api/products';
import { Business } from '@/stores/businessStore';
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

    const handleProductClick = (productId: string) => {
        router.push(`/dashboard/particulier/product/${productId}?businessId=${businessId}`);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} style={{ color: i < fullStars ? '#f59e0b' : '#d1d5db' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

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
                    ← Retour
                </button>

                {/* Business Header */}
                <div className={styles.header}>
                    <div className={styles.coverImage}>
                        {business.coverImageUrl ? (
                            <img src={business.coverImageUrl} alt={business.name} />
                        ) : (
                            <div className={styles.coverPlaceholder}>
                                {business.type === 'RESTAURATEUR' ? '🍽️' : '🏪'}
                            </div>
                        )}
                    </div>

                    <div className={styles.businessInfo}>
                        {business.logoUrl && (
                            <img
                                src={business.logoUrl}
                                alt={business.name}
                                className={styles.logo}
                            />
                        )}

                        <div className={styles.infoContent}>
                            <h1 className={styles.businessName}>{business.name}</h1>

                            <div className={styles.rating}>
                                {renderStars(business.averageRating || 0)}
                                <span className={styles.ratingText}>
                                    {(business.averageRating || 0).toFixed(1)} ({business.reviewCount || 0} avis)
                                </span>
                            </div>

                            {business.description && (
                                <p className={styles.description}>{business.description}</p>
                            )}

                            {business.address && (
                                <div className={styles.address}>
                                    <span>📍</span>
                                    <span>{business.address}</span>
                                </div>
                            )}

                            {business.phoneNumber && (
                                <div className={styles.phone}>
                                    <span>📞</span>
                                    <a href={`tel:${business.phoneNumber}`}>{business.phoneNumber}</a>
                                </div>
                            )}

                            {business.isVerified && (
                                <span className={styles.verifiedBadge}>✓ Vérifié</span>
                            )}
                        </div>
                    </div>
                </div>

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
                                    <div
                                        key={product.id}
                                        className={styles.productCard}
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <div className={styles.productImage}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={product.name} />
                                            ) : (
                                                <div className={styles.imagePlaceholder}>📦</div>
                                            )}
                                        </div>
                                        <div className={styles.productInfo}>
                                            <h3 className={styles.productName}>{product.name}</h3>
                                            {product.category && (
                                                <span className={styles.productCategory}>
                                                    {product.category.name}
                                                </span>
                                            )}
                                            <span className={styles.productPrice}>
                                                {price.toLocaleString('fr-FR')} KMF
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
