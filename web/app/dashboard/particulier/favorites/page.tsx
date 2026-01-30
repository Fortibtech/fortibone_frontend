'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { getFavorites, deleteFavorite, type UserFavorite } from '@/lib/api';
import WebProductCard from '@/components/cards/WebProductCard';
import { Skeleton, EmptyState, EmptyIllustrations, Button } from '@/components/ui';
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

    // Delete handler with toast like mobile Toast.show()
    const handleDelete = async (productId: string) => {
        try {
            await deleteFavorite(productId);
            setFavorites(prev => prev.filter(f => f.id !== productId));
            toast.success('Produit retiré des favoris');
        } catch (err: any) {
            console.error('Erreur suppression:', err);
            toast.error('Erreur lors de la suppression', {
                description: err.message || 'Veuillez réessayer',
            });
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span className="hidden md:inline">Retour</span>
                    </button>
                    <div>
                        <h1 className={styles.title}>Mes favoris</h1>
                        {!loading && <p className={styles.subtitle}>{favorites.length} article{favorites.length !== 1 ? 's' : ''}</p>}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className={styles.loadingContainer}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Skeleton width="100%" style={{ aspectRatio: '1/1', borderRadius: 12 }} />
                                <Skeleton width="80%" height={16} />
                                <Skeleton width="40%" height={16} />
                            </div>
                        ))}
                    </div>
                ) : favorites.length === 0 && !error ? (
                    <div className={styles.empty}>
                        <EmptyState
                            title="Votre liste est vide"
                            description="Ajoutez des articles en favoris pour les retrouver ici."
                            icon={EmptyIllustrations.Wishlist || <span style={{ fontSize: 48 }}>❤️</span>}
                            action={
                                <Button
                                    variant="primary"
                                    onClick={() => router.push('/dashboard/particulier')}
                                >
                                    Explorer la boutique
                                </Button>
                            }
                        />
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
