'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getProductById } from '@/lib/api/products';
import { useCartStore } from '@/stores/cartStore';
import { useBusinessStore } from '@/stores/businessStore';
import styles from './product.module.css';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const productId = params.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const businessIdQuery = searchParams.get('businessId');

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const { business } = useBusinessStore();
    const addToCart = useCartStore((state: any) => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            // Priority: URL query param > Store business
            const targetBusinessId = businessIdQuery || business?.id;

            if (!targetBusinessId) {
                console.error("No business ID found for product fetch");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getProductById(targetBusinessId, productId);
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, businessIdQuery, business?.id]);

    const handleAddToCart = () => {
        if (!selectedVariant || !product) return;

        addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
            name: product.name,
            price: parseFloat(selectedVariant.price),
            imageUrl: product.imageUrl || selectedVariant.imageUrl,
            businessId: product.businessId,
            variantName: selectedVariant.sku || undefined,
            stock: selectedVariant.quantityInStock,
            currency: 'XAF',
        }, quantity);

        // Success feedback
        const successMsg = `✅ ${product.name} ajouté au panier (×${quantity})`;
        alert(successMsg);

        // Optionally navigate to cart
        // router.push('/dashboard/particulier/cart');
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
                    <h2>Produit non trouvé</h2>
                    <button onClick={() => router.back()}>Retour</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← Retour
                </button>

                <div className={styles.productGrid}>
                    {/* Image */}
                    <div className={styles.imageSection}>
                        <img
                            src={product.imageUrl || selectedVariant?.imageUrl || '/placeholder.png'}
                            alt={product.name}
                            className={styles.mainImage}
                        />
                    </div>

                    {/* Details */}
                    <div className={styles.detailsSection}>
                        <h1 className={styles.title}>{product.name}</h1>

                        <div className={styles.price}>
                            {selectedVariant && parseFloat(selectedVariant.price).toLocaleString()} XAF
                        </div>

                        {product.category && (
                            <div className={styles.category}>{product.category.name}</div>
                        )}

                        <div className={styles.description}>
                            {product.description || 'Aucune description disponible'}
                        </div>

                        {/* Quantity */}
                        <div className={styles.quantitySection}>
                            <label>Quantité:</label>
                            <div className={styles.quantityControls}>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        {/* Stock */}
                        {selectedVariant && (
                            <div className={styles.stock}>
                                {selectedVariant.quantityInStock > 0 ? (
                                    <span className={styles.inStock}>✓ En stock ({selectedVariant.quantityInStock} disponibles)</span>
                                ) : (
                                    <span className={styles.outOfStock}>✗ Rupture de stock</span>
                                )}
                            </div>
                        )}

                        {/* Add to cart */}
                        <button
                            onClick={handleAddToCart}
                            className={styles.addToCartBtn}
                            disabled={!selectedVariant || selectedVariant.quantityInStock === 0}
                        >
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
