'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getFavorites, deleteFavorite, type UserFavorite } from '@/lib/api';
import styles from './favorites.module.css';

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (!confirm('Retirer ce produit des favoris ?')) return;

        try {
            setDeletingId(productId);
            await deleteFavorite(productId);
            setFavorites(prev => prev.filter(f => f.id !== productId));
        } catch (err: any) {
            console.error('Erreur suppression:', err);
            alert(err.message || 'Erreur lors de la suppression');
        } finally {
            setDeletingId(null);
        }
    };

    const openDetails = (id: string) => {
        router.push(`/dashboard/particulier/product/${id}`);
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>←</button>
                    <h1 className={styles.title}>Mes favoris ({favorites.length})</h1>
                    <div style={{ width: 45 }} />
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
                        <p className={styles.emptyTitle}>Aucun favori pour le moment</p>
                        <p className={styles.emptySubtitle}>
                            Vos produits favoris apparaîtront ici
                        </p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {favorites.map((item) => (
                            <div key={item.id} className={styles.item}>
                                <div
                                    className={styles.itemContent}
                                    onClick={() => openDetails(item.id)}
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className={styles.itemImage}
                                        />
                                    ) : (
                                        <div className={styles.itemImagePlaceholder}>📦</div>
                                    )}
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        {item.businessName && (
                                            <span className={styles.itemBusiness}>{item.businessName}</span>
                                        )}
                                        {item.description && (
                                            <span className={styles.itemDesc}>{item.description}</span>
                                        )}
                                        {item.price && (
                                            <span className={styles.itemPrice}>
                                                {item.price.toLocaleString('fr-FR')} XAF
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? '...' : '🗑️'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
