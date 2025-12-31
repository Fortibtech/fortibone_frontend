'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './ProductMap.module.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#059669" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="6" fill="white"/>
        </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Custom icon for products (simple red circle with house icon)
const productIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35">
            <circle cx="17.5" cy="17.5" r="15" fill="#e11d48" stroke="white" stroke-width="3"/>
            <path d="M17.5 10 L12 14.5 L12 22 L23 22 L23 14.5 Z M14 20 L14 16 L21 16 L21 20 Z" fill="white"/>
        </svg>
    `),
    iconSize: [35, 35],
    iconAnchor: [17.5, 35],
    popupAnchor: [0, -35],
});

interface Product {
    id: string;
    name: string;
    price: number;
    currencyCode: string;
    productImageUrl?: string;
    latitude: number;
    longitude: number;
    averageRating?: number;
    reviewCount?: number;
}

interface ProductMapProps {
    products: Product[];
    userLocation?: { lat: number; lng: number };
    onProductClick?: (productId: string) => void;
}

// Component to recenter map when user location changes
function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function ProductMap({ products, userLocation, onProductClick }: ProductMapProps) {
    const [mounted, setMounted] = useState(false);

    // Ensure component only renders on client side (Leaflet doesn't work with SSR)
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Chargement de la carte...</p>
            </div>
        );
    }

    // Default center (Madagascar) or user location
    const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [-18.8792, 47.5079]; // Antananarivo

    const renderStars = (rating: number) => {
        const full = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        const stars = [];
        for (let i = 0; i < full; i++) stars.push('🌟');
        if (hasHalf) stars.push('⭐');
        while (stars.length < 5) stars.push('☆');
        return stars.join('');
    };

    return (
        <div className={styles.mapWrapper}>
            <MapContainer
                center={center}
                zoom={13}
                className={styles.map}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap center={center} />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                    >
                        <Popup>
                            <div className={styles.popup}>
                                <strong>Vous êtes ici</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Product Markers */}
                {products.map((product) => (
                    <Marker
                        key={product.id}
                        position={[product.latitude, product.longitude]}
                        icon={productIcon}
                        eventHandlers={{
                            click: () => onProductClick?.(product.id),
                        }}
                    >
                        <Popup>
                            <div className={styles.productPopup}>
                                {product.productImageUrl && (
                                    <img
                                        src={product.productImageUrl}
                                        alt={product.name}
                                        className={styles.productImage}
                                    />
                                )}
                                <h3>{product.name}</h3>
                                <p className={styles.price}>
                                    {product.price.toLocaleString('fr-FR')} {product.currencyCode}
                                </p>
                                {product.averageRating && (
                                    <div className={styles.rating}>
                                        {renderStars(product.averageRating)}
                                        {product.reviewCount && (
                                            <span className={styles.reviewCount}>
                                                ({product.reviewCount})
                                            </span>
                                        )}
                                    </div>
                                )}
                                <button
                                    className={styles.viewButton}
                                    onClick={() => onProductClick?.(product.id)}
                                >
                                    Voir détails
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
