'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { getBusinessById } from '@/lib/api/business';
import { getProducts, type Product } from '@/lib/api/products';
import { useProCartStore } from '@/stores/achatCartStore';
import styles from '../achats.module.css';


interface Supplier {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
}

// Icons
const icons = {
    cart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    search: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    back: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    box: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
};

export default function SupplierProductsPage() {
    const params = useParams();
    const supplierId = params?.supplierId as string;

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const { addItem, getTotalItems, items } = useProCartStore();
    const totalCartItems = getTotalItems();

    const loadData = useCallback(async () => {
        if (!supplierId) return;
        setLoading(true);
        try {
            const [supplierData, productsData] = await Promise.all([
                getBusinessById(supplierId),
                getProducts(supplierId, { limit: 50 }),
            ]);
            setSupplier(supplierData);
            setProducts(productsData.data || []);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const variant = product.variants?.[0];
        if (!variant || !supplier) return;

        addItem(
            product.id,
            product.name,
            variant,
            1,
            product.imageUrl || variant.imageUrl || undefined,
            supplierId,
            supplier.name
        );
    };

    const isInCart = (productId: string) => {
        return items.some((item) => item.productId === productId && item.supplierBusinessId === supplierId);
    };

    const getPrice = (product: Product) => {
        const price = parseFloat(product.variants?.[0]?.price || '0');
        return price.toLocaleString('fr-FR');
    };

    const getStock = (product: Product) => {
        return product.variants?.[0]?.quantityInStock || 0;
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title={supplier?.name || 'Produits'}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <Link href="/dashboard/commercant/achats" className={styles.backButton}>
                                {icons.back}
                            </Link>
                            <div>
                                <h1 className={styles.title}>{supplier?.name || 'Chargement...'}</h1>
                                <p className={styles.subtitle}>{products.length} produit(s) disponible(s)</p>
                            </div>
                        </div>
                        <Link href="/dashboard/commercant/achats/cart" className={styles.cartButton}>
                            {icons.cart}
                            <span>Panier</span>
                            {totalCartItems > 0 && (
                                <span className={styles.cartBadge}>{totalCartItems}</span>
                            )}
                        </Link>
                    </div>

                    {/* Search */}
                    <div className={styles.searchSection}>
                        <div className={styles.searchBar}>
                            {icons.search}
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Rechercher un produit..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className={styles.productsSection}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p className={styles.loadingText}>Chargement des produits...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>{icons.box}</div>
                                <h3 className={styles.emptyTitle}>Aucun produit trouvé</h3>
                                <p className={styles.emptyText}>Ce fournisseur n&apos;a pas encore de produits</p>
                            </div>
                        ) : (
                            <div className={styles.productsGrid}>
                                {filteredProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/dashboard/commercant/achats/${supplierId}/${product.id}`}
                                        className={styles.productCard}
                                    >
                                        <div className={styles.productImage}>
                                            {product.imageUrl || product.variants?.[0]?.imageUrl ? (
                                                <img
                                                    src={product.imageUrl || product.variants?.[0]?.imageUrl || ''}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className={styles.productPlaceholder}>
                                                    {icons.box}
                                                </div>
                                            )}
                                            <span
                                                className={styles.stockBadge}
                                                style={{
                                                    backgroundColor: getStock(product) > 0 ? '#dcfce7' : '#fee2e2',
                                                    color: getStock(product) > 0 ? '#16a34a' : '#dc2626',
                                                }}
                                            >
                                                {getStock(product) > 0 ? `${getStock(product)} en stock` : 'Rupture'}
                                            </span>
                                        </div>
                                        <div className={styles.productInfo}>
                                            <h3 className={styles.productName}>{product.name}</h3>
                                            <p className={styles.supplierName}>{product.category?.name || 'Non catégorisé'}</p>
                                            <p className={styles.productPrice}>{getPrice(product)} KMF</p>
                                            <button
                                                className={`${styles.addToCartBtn} ${isInCart(product.id) ? styles.inCart : ''}`}
                                                onClick={(e) => handleAddToCart(product, e)}
                                                disabled={getStock(product) === 0}
                                            >
                                                {isInCart(product.id) ? '✓ Dans le panier' : '+ Ajouter au panier'}
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
