'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getFavorites, deleteFavorite, type UserFavorite } from '@/lib/api';
import WebProductCard from '@/components/cards/WebProductCard';
import styles from './favorites.module.css';

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getFavorites({ limit: 50 });
            setFavorites(response.data || []);
        } catch (err: any) {
            console.error('Erreur chargement favoris:', err);
            setError(err.message || 'Erreur lors du chargement des favoris');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleDelete = async (productId: string) => {
        try {
            await deleteFavorite(productId);
            setFavorites(prev => prev.filter(f => f.id !== productId));
        } catch (err: any) {
            console.error('Erreur suppression:', err);
            alert(err.message || 'Erreur lors de la suppression');
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Retour
                    </button>
                    <div>
                        <h1 className={styles.title}>Mes favoris</h1>
                        <p className={styles.subtitle}>{favorites.length} articles sauvegardés</p>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button onClick={fetchFavorites} className={styles.retryBtn}>
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Chargement des favoris...</p>
                    </div>
                ) : favorites.length === 0 && !error ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>❤️</span>
                        <p className={styles.emptyTitle}>Votre liste de souhaits est vide</p>
                        <p className={styles.emptySubtitle}>
                            Explorez nos produits et cliquez sur le cœur pour les ajouter ici.
                        </p>
                        <button onClick={() => router.push('/dashboard/particulier')} className={styles.exploreBtn}>
                            Explorer la boutique
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {favorites.map((item) => (
                            <WebProductCard
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                price={item.price || 0}
                                currencyCode="KMF"
                                imageUrl={item.imageUrl}
                                rating={0}
                                reviewCount={0}
                                onPress={() => router.push(`/dashboard/particulier/product/${item.id}`)}
                                onRemove={() => handleDelete(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
