'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWallet, type Wallet } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useCartStore } from '@/stores/cartStore';
import { searchProducts } from '@/lib/api/products';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WebProductCard from '@/components/cards/WebProductCard';
import styles from './home.module.css';

interface Product {
    id: string;
    productId: string;
    name: string;
    price: number;
    currencyCode: string;
    productImageUrl?: string;
    latitude: number | null;
    longitude: number | null;
    averageRating?: number;
    reviewCount?: number;
    businessId: string;
}

export default function ParticulierDashboard() {
    const router = useRouter();
    const cartItems = useCartStore((state: any) => state.items);
    const itemsCount = cartItems.length;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // User location for distance calculation
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null); // Wallet state
    const debounceTimeout = useRef<any>(null);

    // Initial load: Wallet + Products
    useEffect(() => {
        getWallet().then(setWallet).catch(e => console.error(e));
        // Geolocation
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error('Geolocation error:', error)
            );
        }
    }, []);

    // Fetch products (COMMERCANT + RESTAURATEUR) - REAL API
    const fetchProducts = useCallback(async (search: string = '') => {
        try {
            setLoading(true);
            setError(null);

            const [commercantRes, restaurantRes] = await Promise.all([
                searchProducts({
                    businessType: 'COMMERCANT',
                    search: search || undefined,
                    limit: 50,
                }),
                searchProducts({
                    businessType: 'RESTAURATEUR',
                    search: search || undefined,
                    limit: 50,
                }),
            ]);

            const merged = [...commercantRes.data, ...restaurantRes.data];

            // Debug: Log API response structure
            console.log('Products API response sample:', merged[0]);

            // Transform to match interface
            const transformedProducts: Product[] = merged.map((p: any) => {
                const firstVariant = p.variants?.[0];
                // CRITICAL: Use p.productId for the actual Product ID, p.id is BusinessProduct ID
                const actualProductId = p.productId || p.id;
                // Price: use direct price field if available, otherwise from variant
                const price = p.price ? parseFloat(p.price) : (p.convertedPrice || (firstVariant ? parseFloat(firstVariant.price) : 0));
                return {
                    id: p.id,
                    productId: actualProductId,
                    name: p.name,
                    price: price,
                    currencyCode: 'KMF',
                    productImageUrl: p.productImageUrl || p.imageUrl || firstVariant?.imageUrl || undefined,
                    // Try to get location from business if available
                    latitude: p.business?.latitude || p.latitude || null,
                    longitude: p.business?.longitude || p.longitude || null,
                    averageRating: p.averageRating || 0,
                    reviewCount: p.reviewCount || p.totalReviews || 0,
                    businessId: p.businessId,
                };
            });

            setProducts(transformedProducts);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            setError(error.message || 'Erreur lors du chargement des produits');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch suggestions for autocomplete - REAL API
    const fetchSuggestions = useCallback(async (query: string) => {
        try {
            const [commercantRes, restaurantRes] = await Promise.all([
                searchProducts({
                    businessType: 'COMMERCANT',
                    search: query,
                    limit: 3,
                }),
                searchProducts({
                    businessType: 'RESTAURATEUR',
                    search: query,
                    limit: 3,
                }),
            ]);

            const merged = [...commercantRes.data, ...restaurantRes.data].slice(0, 5);

            const transformedSuggestions: Product[] = merged.map((p: any) => {
                const firstVariant = p.variants?.[0];
                // CRITICAL: Use p.productId for the actual Product ID
                const actualProductId = p.productId || p.id;
                const price = p.price ? parseFloat(p.price) : (p.convertedPrice || (firstVariant ? parseFloat(firstVariant.price) : 0));
                return {
                    id: p.id,
                    productId: actualProductId,
                    name: p.name,
                    price: price,
                    currencyCode: 'KMF',
                    productImageUrl: p.productImageUrl || p.imageUrl || firstVariant?.imageUrl || undefined,
                    latitude: null,
                    longitude: null,
                    averageRating: p.averageRating || 0,
                    reviewCount: p.reviewCount || p.totalReviews || 0,
                    businessId: p.businessId,
                };
            });

            setSuggestions(transformedSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Debounced search
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            if (searchQuery.length > 1) {
                fetchSuggestions(searchQuery);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchQuery, fetchSuggestions]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(searchQuery);
        setSuggestions([]);
        setShowSuggestions(false);
    };



    // Haversine distance calculation
    const calculateDistance = (
        userLat: number | null,
        userLng: number | null,
        prodLat: number | null,
        prodLng: number | null
    ): string => {
        if (!userLat || !userLng || !prodLat || !prodLng) {
            return 'Distance inconnue';
        }

        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Earth radius in km

        const dLat = toRad(prodLat - userLat);
        const dLon = toRad(prodLng - userLng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(userLat)) *
            Math.cos(toRad(prodLat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < 1) {
            return `${Math.round(distance * 1000)} m de vous`;
        }
        return `à ${distance.toFixed(1)} km de vous`;
    };

    // Render stars
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) stars.push('🌟');
        if (hasHalfStar) stars.push('⭐');
        while (stars.length < 5) stars.push('☆');

        return stars.join('');
    };

    const handleSuggestionSelect = (product: Product) => {
        setSearchQuery(product.name);
        setShowSuggestions(false);
        router.push(`/dashboard/particulier/product/${product.productId}?businessId=${product.businessId}`);
    };

    const handleProductClick = (product: Product) => {
        router.push(`/dashboard/particulier/product/${product.productId}?businessId=${product.businessId}`);
    };

    return (
        <ProtectedRoute requiredProfileType="PARTICULIER">
            <DashboardLayout
                businessType="PARTICULIER"
                // Hybrid Header Strategy: Reverting to Custom Header to keep Search/Map functionality
                showStandardHeaderOnDesktop={false}
                customHeaderRender={({ onMenuClick }: { onMenuClick: () => void }) => (
                    <div className={styles.header}>
                        <div className={styles.headerTop}>
                            <button className={styles.menuBtn} onClick={onMenuClick}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>
                            <div className={styles.logo}>KomoraLink</div>
                            <button className={styles.cartBtn} onClick={() => router.push('/dashboard/particulier/cart')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {itemsCount > 0 && <span className={styles.cartBadge}>{itemsCount}</span>}
                            </button>
                        </div>

                        {/* SEARCH BAR */}
                        <div className={styles.searchWrapper}>
                            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Recherche"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={styles.mapBtn}
                                    onClick={() => router.push('/dashboard/particulier/map')}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                                        <line x1="8" y1="2" x2="8" y2="18" />
                                        <line x1="16" y1="6" x2="16" y2="22" />
                                    </svg>
                                </button>
                            </form>

                            {/* AUTOCOMPLETE SUGGESTIONS */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className={styles.suggestions}>
                                    {suggestions.map((prod) => (
                                        <button
                                            key={prod.id}
                                            className={styles.suggestionItem}
                                            onClick={() => handleSuggestionSelect(prod)}
                                        >
                                            {prod.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            >
                {/* Content area with promo banner + products */}
                <div className={styles.content}>


                    {/* === WALLET SUMMARY (Mobile Aligned) === */}
                    <div className={styles.balanceCard}>
                        <div className={styles.balanceInfo}>
                            <span className={styles.balanceLabel}>Solde disponible</span>
                            <span className={styles.balanceAmount}>
                                {wallet ? parseFloat(wallet.balance).toLocaleString('fr-FR') : '---'} <small style={{ fontSize: '0.6em' }}>KMF</small>
                            </span>
                        </div>
                        <div className={styles.balanceActions}>
                            <Link href="/dashboard/particulier/finance/wallet/deposit" className={styles.actionButton}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="19" x2="12" y2="5" />
                                    <polyline points="5 12 12 5 19 12" />
                                </svg>
                                <span>Dépôt</span>
                            </Link>
                            <Link href="/dashboard/particulier/finance/wallet/transfer" className={styles.actionButton}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                <span>Envoyer</span>
                            </Link>
                            <Link href="/dashboard/particulier/finance/wallet" className={styles.actionButton}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                                <span>Wallet</span>
                            </Link>
                        </div>
                    </div>

                    {/* === QUICK CATEGORIES === */}
                    <div className={styles.quickActionsGrid}>
                        <button className={styles.quickActionItem} onClick={() => router.push('/dashboard/particulier/businesses?type=RESTAURATEUR')}>
                            <div className={styles.quickActionIcon} style={{ color: '#F59E0B' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z" />
                                    <path d="M16 21V11" />
                                    <path d="M8 21V11" />
                                    <path d="M12 7V3" />
                                    <path d="M8 3v4" />
                                    <path d="M16 3v4" />
                                </svg>
                            </div>
                            <span className={styles.quickActionLabel}>Restos</span>
                        </button>
                        <button className={styles.quickActionItem} onClick={() => router.push('/dashboard/particulier/businesses?type=COMMERCANT')}>
                            <div className={styles.quickActionIcon} style={{ color: '#10B981' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </div>
                            <span className={styles.quickActionLabel}>Boutiques</span>
                        </button>
                        <button className={styles.quickActionItem} onClick={() => router.push('/dashboard/particulier/orders')}>
                            <div className={styles.quickActionIcon} style={{ color: '#3B82F6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </div>
                            <span className={styles.quickActionLabel}>Commandes</span>
                        </button>
                        <button className={styles.quickActionItem} onClick={() => router.push('/dashboard/particulier/finance')}>
                            <div className={styles.quickActionIcon} style={{ color: '#8B5CF6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                            </div>
                            <span className={styles.quickActionLabel}>Finance</span>
                        </button>
                    </div>

                    {/* PROMO BANNER - Aligned with mobile */}
                    <div className={styles.promoBanner}>
                        <div className={styles.bannerBackground} />
                        <svg
                            className={styles.bannerSvg}
                            viewBox="10 0 100 80"
                            preserveAspectRatio="none"
                        >
                            <polygon points="0,0 100,0 65,90 0,90" fill="#FFF9CD" />
                        </svg>
                        <div className={styles.bannerContentWrapper}>
                            <div className={styles.bannerContent}>
                                <h2 className={styles.bannerTitle}>Ne ratez pas ça !</h2>
                                <p className={styles.bannerSubtitle}>Jusqu&apos;à 50 % de réduction</p>
                            </div>
                            <div className={styles.bannerImageContainer}>
                                <img
                                    src="/images/promo-banner.png"
                                    alt="Promotion"
                                    className={styles.bannerImage}
                                />
                            </div>
                        </div>
                    </div>





                    {/* PRODUCT GRID - Responsive (Fluid) */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            ❌ {error}
                        </div>
                    )}
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Chargement des produits...</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {products.map((product) => {
                                const distanceText = calculateDistance(
                                    userLocation?.lat || null,
                                    userLocation?.lng || null,
                                    product.latitude,
                                    product.longitude
                                );

                                return (
                                    <WebProductCard
                                        key={product.id}
                                        id={product.productId}
                                        name={product.name}
                                        price={product.price}
                                        currencyCode={product.currencyCode}
                                        imageUrl={product.productImageUrl}
                                        rating={product.averageRating}
                                        reviewCount={product.reviewCount}
                                        distance={distanceText}
                                        onPress={() => handleProductClick(product)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>🛒</span>
                            <p>Aucun produit disponible pour le moment</p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute >
    );
}
