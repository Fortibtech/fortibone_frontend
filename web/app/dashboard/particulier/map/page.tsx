'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import dynamic from 'next/dynamic';
import { searchProducts } from '@/lib/api/products';
import styles from './map.module.css';

// Import dynamique pour éviter l'erreur SSR avec Leaflet
const ProductMap = dynamic(() => import('@/components/map/ProductMap'), {
    ssr: false,
    loading: () => (
        <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Chargement de la carte...</p>
        </div>
    ),
});

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

export default function MapPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
    const [locationError, setLocationError] = useState('');

    // Request user's geolocation
    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationError('Localisation non disponible');
                }
            );
        } else {
            setLocationError('Géolocalisation non supportée');
        }
    }, []);

    // Fetch products with location (REAL API)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                const [commercantRes, restaurantRes] = await Promise.all([
                    searchProducts({
                        businessType: 'COMMERCANT',
                        limit: 100, // Get more for map
                    }),
                    searchProducts({
                        businessType: 'RESTAURATEUR',
                        limit: 100,
                    }),
                ]);

                const merged = [...commercantRes.data, ...restaurantRes.data];

                const mappedProducts: Product[] = merged
                    .filter(p => p.latitude && p.longitude) // Only with coords
                    .map(p => ({
                        id: p.id,
                        productId: p.id,
                        name: p.name,
                        price: parseFloat(p.variants?.[0]?.price || '0'),
                        currencyCode: 'XAF',
                        productImageUrl: p.imageUrl || p.variants?.[0]?.imageUrl,
                        latitude: Number(p.latitude),
                        longitude: Number(p.longitude),
                        averageRating: p.averageRating,
                        reviewCount: p.reviewCount,
                        businessId: p.businessId,
                    }));

                setProducts(mappedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleProductClick = useCallback((productId: string) => {
        const product = products.find(p => p.id === productId || p.productId === productId);
        if (product) {
            router.push(`/dashboard/particulier/product/${productId}?businessId=${product.businessId}`);
        }
    }, [products, router]);

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Carte des produits</h1>
                    <div style={{ width: 45 }} />
                </div>

                {/* Location Status */}
                {locationError && (
                    <div className={styles.locationWarning}>
                        📍 {locationError} - La carte sera centrée par défaut
                    </div>
                )}

                {/* Map Container */}
                <div className={styles.mapContainer}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner} />
                            <p>Chargement des produits...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🗺️</span>
                            <p className={styles.emptyTitle}>Aucun produit à proximité</p>
                            <p className={styles.emptyText}>
                                Les produits disponibles dans votre zone apparaîtront ici
                            </p>
                        </div>
                    ) : (
                        <ProductMap
                            products={products as any}
                            userLocation={userLocation}
                            onProductClick={handleProductClick}
                        />
                    )}
                </div>

                {/* Info Card */}
                <div className={styles.infoCard}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoIcon}>🏪</span>
                        <span className={styles.infoText}>
                            {products.length} produit{products.length > 1 ? 's' : ''} sur la carte
                        </span>
                    </div>
                    {userLocation && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>📍</span>
                            <span className={styles.infoText}>Votre position activée</span>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
