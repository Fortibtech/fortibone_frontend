'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './achats.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    supplierName: string;
    currencyCode: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface Category {
    id: string;
    name: string;
}

// Icons
const icons = {
    search: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    cart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    filter: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
    close: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    minus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    package: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
};

export default function AchatsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showCart, setShowCart] = useState(false);
    const [categories] = useState<Category[]>([
        { id: 'all', name: 'Tout' },
        { id: 'ingredients', name: 'Ingrédients' },
        { id: 'beverage', name: 'Boissons' },
        { id: 'packaging', name: 'Emballages' },
        { id: 'equipment', name: 'Équipements' },
    ]);

    // Simulated data - would come from API
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProducts([
                { id: '1', name: 'Huile végétale 10L', price: 8500, imageUrl: '', supplierName: 'Grossiste Pro', currencyCode: 'KMF' },
                { id: '2', name: 'Farine T55 25kg', price: 9500, imageUrl: '', supplierName: 'Agro Plus', currencyCode: 'KMF' },
                { id: '3', name: 'Tomates fraîches (caisse)', price: 12000, imageUrl: '', supplierName: 'Maraîchers KM', currencyCode: 'KMF' },
                { id: '4', name: 'Poulet entier x10', price: 45000, imageUrl: '', supplierName: 'Volailles Express', currencyCode: 'KMF' },
                { id: '5', name: 'Sauce tomate 5kg', price: 6000, imageUrl: '', supplierName: 'Import Co', currencyCode: 'KMF' },
                { id: '6', name: 'Boîtes alimentaires x100', price: 4500, imageUrl: '', supplierName: 'Pack Pro', currencyCode: 'KMF' },
            ]);
            setLoading(false);
        };

        loadProducts();
    }, []);

    const addToCart = useCallback((product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart(prev => {
            return prev
                .map(item => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    }, []);

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
    const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const formatPrice = (price: number) => price.toLocaleString('fr-FR');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Approvisionnement</h1>
                    <p className={styles.subtitle}>Commandez vos matières premières auprès des fournisseurs</p>
                </div>
                <button className={styles.cartButton} onClick={() => setShowCart(true)}>
                    {icons.cart}
                    <span>Panier</span>
                    {getTotalItems() > 0 && (
                        <span className={styles.cartBadge}>{getTotalItems()}</span>
                    )}
                </button>
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
                    <button className={styles.filterButton}>
                        {icons.filter}
                        <span>Filtres</span>
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className={styles.categoriesSection}>
                <div className={styles.categoriesGrid}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.categoryChipActive : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products */}
            <div className={styles.productsSection}>
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
                    </span>
                    <select className={styles.sortSelect}>
                        <option value="relevance">Pertinence</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                    </select>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p className={styles.loadingText}>Chargement des produits...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>{icons.package}</div>
                        <h3 className={styles.emptyTitle}>Aucun produit trouvé</h3>
                        <p className={styles.emptyText}>Essayez avec d&apos;autres mots-clés</p>
                    </div>
                ) : (
                    <div className={styles.productsGrid}>
                        {filteredProducts.map(product => (
                            <div key={product.id} className={styles.productCard}>
                                <div className={styles.productImage}>
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f8f8f8' }}>
                                            {icons.package}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.productInfo}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <p className={styles.supplierName}>{product.supplierName}</p>
                                    <p className={styles.productPrice}>
                                        {formatPrice(product.price)} {product.currencyCode}
                                    </p>
                                    <button
                                        className={styles.addToCartBtn}
                                        onClick={() => addToCart(product)}
                                    >
                                        + Ajouter au panier
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            {showCart && (
                <>
                    <div className={styles.cartOverlay} onClick={() => setShowCart(false)} />
                    <div className={styles.cartModal}>
                        <div className={styles.cartHeader}>
                            <h2 className={styles.cartTitle}>Mon Panier ({getTotalItems()})</h2>
                            <button className={styles.closeButton} onClick={() => setShowCart(false)}>
                                {icons.close}
                            </button>
                        </div>

                        <div className={styles.cartContent}>
                            {cart.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>{icons.cart}</div>
                                    <h3 className={styles.emptyTitle}>Panier vide</h3>
                                    <p className={styles.emptyText}>Ajoutez des produits pour passer commande</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.cartItemImage}>
                                            {icons.package}
                                        </div>
                                        <div className={styles.cartItemInfo}>
                                            <h4 className={styles.cartItemName}>{item.name}</h4>
                                            <p className={styles.cartItemPrice}>
                                                {formatPrice(item.price)} {item.currencyCode}
                                            </p>
                                        </div>
                                        <div className={styles.cartItemActions}>
                                            <button
                                                className={styles.qtyButton}
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                {icons.minus}
                                            </button>
                                            <span className={styles.qtyText}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyButton}
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                {icons.plus}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={styles.cartFooter}>
                            <div className={styles.cartTotal}>
                                <span className={styles.cartTotalLabel}>Total</span>
                                <span className={styles.cartTotalValue}>
                                    {formatPrice(getTotalPrice())} KMF
                                </span>
                            </div>
                            <button
                                className={styles.checkoutButton}
                                disabled={cart.length === 0}
                            >
                                Passer la commande
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
