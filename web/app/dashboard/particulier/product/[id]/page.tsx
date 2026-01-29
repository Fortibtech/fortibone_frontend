'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getProductByIdDirect, getProductReviews, type ProductReview } from '@/lib/api/products';
import { useCartStore } from '@/stores/cartStore';
import { useBusinessStore } from '@/stores/businessStore';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import styles from './product.module.css';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const productId = params.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const businessIdQuery = searchParams.get('businessId');

    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string>('');
    const { selectedBusiness } = useBusinessStore();
    const addToCart = useCartStore((state: any) => state.addItem);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    // Error state
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            console.log('Product Detail - Fetching product:', productId);

            try {
                setLoading(true);
                setError(null);

                // Fetch Product using direct endpoint (matches mobile API)
                const data = await getProductByIdDirect(productId);
                console.log('Product fetched:', data);
                setProduct(data);

                // Set initial variant and image
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                    setActiveImage(data.variants[0].imageUrl || data.imageUrl || '/placeholder.png');
                } else {
                    setActiveImage(data.imageUrl || '/placeholder.png');
                }

                // 2. Fetch Reviews
                try {
                    const reviewsData = await getProductReviews(productId);
                    setReviews(reviewsData.data || []);
                } catch (e) {
                    console.warn('Could not fetch reviews', e);
                }
            } catch (err: any) {
                console.error('Error fetching product:', err);
                setError(err.response?.data?.message || err.message || 'Erreur lors du chargement du produit');
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, [productId, businessIdQuery, selectedBusiness?.id]);

    const handleAddToCart = () => {
        if (!selectedVariant && (!product.variants || product.variants.length > 0)) {
            setModalConfig({
                title: 'Sélection requise',
                message: 'Veuillez sélectionner une variante avant d\'ajouter au panier.',
                type: 'warning',
            });
            setModalOpen(true);
            return;
        }

        const variantToUse = selectedVariant || (product.variants?.[0]);

        if (!variantToUse) return;

        addToCart({
            productId: product.id,
            variantId: variantToUse.id,
            name: product.name,
            price: parseFloat(variantToUse.price),
            imageUrl: product.imageUrl || variantToUse.imageUrl,
            businessId: product.businessId,
            variantName: variantToUse.sku || undefined,
            stock: variantToUse.quantityInStock,
            currency: 'KMF',
        }, quantity);

        // Success feedback with modal
        setModalConfig({
            title: 'Ajouté au panier !',
            message: `${product.name} (×${quantity}) a été ajouté à votre panier.`,
            type: 'success',
        });
        setModalOpen(true);
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

    if (!product) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.error}>
                    <span style={{ fontSize: '64px', marginBottom: '16px' }}>😕</span>
                    <h2>Produit non trouvé</h2>
                    {error && <p style={{ color: '#ef4444', marginTop: '8px' }}>{error}</p>}
                    <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
                        ID: {productId} | BusinessID: {businessIdQuery || 'Non fourni'}
                    </p>
                    <button
                        onClick={() => router.back()}
                        style={{
                            marginTop: '16px',
                            padding: '12px 24px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        ← Retour
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const images = [
        product.imageUrl,
        ...(product.variants?.map((v: any) => v.imageUrl) || [])
    ].filter(Boolean);
    const uniqueImages = Array.from(new Set(images));

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← Retour
                </button>

                <div className={styles.productGrid}>
                    {/* Image Section - Carousel Style */}
                    <div className={styles.imageSection}>
                        <div className={styles.mainImageContainer}>
                            <img
                                src={activeImage}
                                alt={product.name}
                                className={styles.mainImage}
                            />
                        </div>
                        {uniqueImages.length > 1 && (
                            <div className={styles.thumbnails}>
                                {uniqueImages.map((img: any, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        className={`${styles.thumbnail} ${activeImage === img ? styles.activeThumb : ''}`}
                                        onClick={() => setActiveImage(img)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className={styles.detailsSection}>
                        <div className={styles.headerRow}>
                            <h1 className={styles.title}>{product.name}</h1>
                            {product.category && (
                                <span className={styles.categoryBadge}>{product.category.name}</span>
                            )}
                        </div>

                        {/* Sold By - Updated with Pill Badge */}
                        <div className={styles.soldBy}>
                            Vendu par
                            <Link href={`/dashboard/particulier/business/${product.businessId}`} className={styles.businessBadge}>
                                {product.business?.name || 'Voir le vendeur'}
                            </Link>
                        </div>

                        {/* Rating */}
                        <div className={styles.ratingRow}>
                            <span className={styles.stars}>
                                {'★'.repeat(Math.round(product.averageRating || 0))}
                                {'☆'.repeat(5 - Math.round(product.averageRating || 0))}
                            </span>
                            <span className={styles.ratingCount}>
                                {product.averageRating?.toFixed(1)} ({reviews.length} avis)
                            </span>
                        </div>

                        <div className={styles.price}>
                            {selectedVariant ? parseFloat(selectedVariant.price).toLocaleString() : '0'} KMF
                        </div>

                        <div className={styles.description}>
                            <h3>Description</h3>
                            <p>{product.description || 'Aucune description disponible'}</p>
                        </div>

                        {/* Variants Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className={styles.variantsSection}>
                                <label>Options:</label>
                                <div className={styles.variantChips}>
                                    {product.variants.map((v: any) => (
                                        <button
                                            key={v.id}
                                            className={`${styles.variantChip} ${selectedVariant?.id === v.id ? styles.activeVariant : ''}`}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                if (v.imageUrl) setActiveImage(v.imageUrl);
                                            }}
                                        >
                                            {v.sku || v.attributeValues?.[0]?.value || 'Standard'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions: Grid Layout for Qty + Add Button */}
                        <div className={styles.quantitySection}>
                            {/* Stock Indicator */}
                            {selectedVariant && (
                                <div className={styles.stock}>
                                    {selectedVariant.quantityInStock > 0 ? (
                                        <span className={styles.inStock}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            En stock ({selectedVariant.quantityInStock})
                                        </span>
                                    ) : (
                                        <span className={styles.outOfStock}>Rupture de stock</span>
                                    )}
                                </div>
                            )}

                            {/* Grouped Action Bar */}
                            <div className={styles.addToCartGroup}>
                                <div className={styles.quantityControls}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className={styles.addToCartBtn}
                                    disabled={!selectedVariant || selectedVariant.quantityInStock === 0}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    Ajouter au panier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className={styles.reviewsSection}>
                    <h2>Avis clients ({reviews.length})</h2>
                    {reviews.length === 0 ? (
                        <p className={styles.noReviews}>Aucun avis pour le moment.</p>
                    ) : (
                        <div className={styles.reviewsList}>
                            {reviews.map((review) => (
                                <div key={review.id} className={styles.reviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.reviewerInfo}>
                                            <div className={styles.avatar}>
                                                {review.author?.firstName?.charAt(0) || '?'}
                                            </div>
                                            <span className={styles.reviewerName}>
                                                {review.author?.firstName} {review.author?.lastName}
                                            </span>
                                        </div>
                                        <span className={styles.reviewDate}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={styles.reviewRating}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <p className={styles.reviewComment}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="OK"
            />
        </DashboardLayout>
    );
}
