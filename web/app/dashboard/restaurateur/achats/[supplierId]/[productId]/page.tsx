'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { getProductByIdDirect, Product, ProductVariant } from '@/lib/api/products';
import { getBusinessById } from '@/lib/api/business';
import { useProCartStore } from '@/stores/achatCartStore';
import styles from './product-detail.module.css';

// Icons
const icons = {
    back: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    minus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    plus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    cart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supplierId = params?.supplierId as string;
    const productId = params?.productId as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { addItem, removeItem, items, getTotalItems } = useProCartStore();
    const totalCartItems = getTotalItems();

    const loadData = useCallback(async () => {
        if (!productId || !supplierId) return;
        setLoading(true);
        try {
            const [productData, supplierData] = await Promise.all([
                getProductByIdDirect(productId),
                getBusinessById(supplierId),
            ]);
            setProduct(productData);
            setSupplier(supplierData);
            const minOrder = productData.variants?.[0]?.alertThreshold || 1;
            setQuantity(minOrder);
        } catch (error) {
            console.error('Erreur chargement produit:', error);
        } finally {
            setLoading(false);
        }
    }, [productId, supplierId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const variant = product?.variants?.[0];
    const price = parseFloat(variant?.price || '0');
    const stock = variant?.quantityInStock || 0;
    const minOrder = variant?.alertThreshold || 1;

    const images = [
        variant?.imageUrl,
        product?.imageUrl,
        'https://via.placeholder.com/400x400.png?text=No+Image',
    ].filter(Boolean) as string[];

    const isInCart = product && variant && supplier
        ? items.some(
            (item) =>
                item.productId === product.id &&
                item.variant.id === variant.id &&
                item.supplierBusinessId === supplierId
        )
        : false;

    const handleCartAction = () => {
        if (!product || !variant || !supplier) return;

        if (isInCart) {
            removeItem(product.id, variant.id, supplierId);
        } else {
            addItem(
                product.id,
                product.name,
                variant,
                quantity,
                images[0],
                supplierId,
                supplier.name
            );
        }
    };

    const updateQuantity = (delta: number) => {
        setQuantity((prev) => Math.max(minOrder, prev + delta));
    };

    if (loading || !product) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="RESTAURATEUR" title="Détails produit">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p>Chargement du produit...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title={product.name}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button onClick={() => router.back()} className={styles.backButton}>
                            {icons.back}
                        </button>
                        <h1 className={styles.headerTitle}>Détails</h1>
                        <Link href="/dashboard/restaurateur/achats/cart" className={styles.cartLink}>
                            {icons.cart}
                            {totalCartItems > 0 && <span className={styles.cartBadge}>{totalCartItems}</span>}
                        </Link>
                    </div>

                    {/* Image Carousel */}
                    <div className={styles.carousel}>
                        <div className={styles.imageContainer}>
                            <img
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className={styles.mainImage}
                            />
                        </div>
                        {images.length > 1 && (
                            <div className={styles.dots}>
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.dot} ${currentImageIndex === index ? styles.dotActive : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Card */}
                    <div className={styles.infoCard}>
                        <div className={styles.categories}>
                            <span className={styles.category}>{product.category?.name || 'Non catégorisé'}</span>
                            {(product.category as { name: string; parent?: { name: string } })?.parent && (
                                <span className={styles.subcategory}> › {(product.category as { name: string; parent?: { name: string } }).parent?.name}</span>
                            )}
                        </div>
                        <h2 className={styles.productName}>{product.name}</h2>
                        <div className={styles.statusRow}>
                            <span className={styles.condition}>
                                {variant?.lotPrice ? 'Vendu par lot' : "À l'unité"}
                            </span>
                            <span className={styles.stock}>
                                Stock: {stock} {variant?.itemsPerLot ? `(${variant.itemsPerLot}/lot)` : ''}
                            </span>
                        </div>
                        <div className={styles.priceSection}>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>{price.toLocaleString('fr-FR')}</span>
                                <span className={styles.unit}> KMF {variant?.lotPrice ? '/lot' : '/pièce'}</span>
                            </div>
                            <p className={styles.minimum}>Minimum : {minOrder} pièce(s)</p>
                        </div>
                        <div className={styles.tags}>
                            <span className={styles.tag}>{product.category?.name || 'Sans catégorie'}</span>
                            <span className={styles.tag}>{variant?.sku || 'N/A'}</span>
                            <span className={`${styles.tag} ${stock > 0 ? styles.tagSuccess : styles.tagDanger}`}>
                                {stock > 0 ? 'En stock' : 'Rupture'}
                            </span>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className={styles.descriptionCard}>
                        <h3 className={styles.sectionTitle}>Description</h3>
                        <div className={styles.descList}>
                            <div className={styles.descItem}>
                                <span className={styles.label}>Fournisseur : </span>
                                <span className={styles.value}>{supplier?.name || 'Inconnu'}</span>
                            </div>
                            <div className={styles.descItem}>
                                <span className={styles.label}>SKU : </span>
                                <span className={styles.value}>{variant?.sku || 'N/A'}</span>
                            </div>
                            <div className={styles.descItem}>
                                <span className={styles.label}>Stock disponible : </span>
                                <span className={styles.value}>{stock}</span>
                            </div>
                            {variant?.attributeValues?.map((av, idx) => (
                                <div key={idx} className={styles.descItem}>
                                    <span className={styles.label}>{av.attribute?.name || 'Attribut'} : </span>
                                    <span className={styles.value}>{av.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className={styles.bottomBar}>
                        <div className={styles.quantityControl}>
                            <button
                                className={`${styles.qtyBtn} ${quantity <= minOrder ? styles.qtyBtnDisabled : ''}`}
                                onClick={() => updateQuantity(-1)}
                                disabled={quantity <= minOrder}
                            >
                                {icons.minus}
                            </button>
                            <span className={styles.qtyText}>{quantity}</span>
                            <button className={styles.qtyBtn} onClick={() => updateQuantity(1)}>
                                {icons.plus}
                            </button>
                        </div>
                        <button
                            className={`${styles.cartButton} ${isInCart ? styles.removeBtn : styles.addBtn}`}
                            onClick={handleCartAction}
                            disabled={stock === 0}
                        >
                            {isInCart ? 'Retirer du panier' : 'Ajouter au panier'}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
