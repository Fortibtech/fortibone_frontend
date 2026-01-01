'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getBusinessById } from '@/lib/api/business';
import { getProducts, Product } from '@/lib/api/products';
import { getTables, Table } from '@/lib/api/tables';
import axiosInstance from '@/lib/api/axiosInstance';
import { Business } from '@/stores/businessStore';
import styles from './restaurant-detail.module.css';

interface RestaurantDetailPageProps {
    params: { id: string };
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
    const restaurantId = params.id;
    const router = useRouter();

    const [restaurant, setRestaurant] = useState<Business | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [tablesLoading, setTablesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tabs: menu or table
    const [activeTab, setActiveTab] = useState<'menu' | 'table'>('menu');

    // Reservation modal
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [notes, setNotes] = useState('');
    const [reserving, setReserving] = useState(false);

    // Fetch restaurant details
    const fetchRestaurant = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBusinessById(restaurantId);
            setRestaurant(data);
        } catch (err: any) {
            console.error('Error fetching restaurant:', err);
            setError(err.message || 'Impossible de charger ce restaurant');
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    // Fetch restaurant menu items (products)
    const fetchProducts = useCallback(async () => {
        if (!restaurantId) return;
        try {
            setProductsLoading(true);
            const response = await getProducts(restaurantId, { limit: 50 });
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        } finally {
            setProductsLoading(false);
        }
    }, [restaurantId]);

    // Fetch restaurant tables
    const fetchTables = useCallback(async () => {
        if (!restaurantId) return;
        try {
            setTablesLoading(true);
            const data = await getTables(restaurantId);
            setTables(data || []);
        } catch (err) {
            console.error('Error fetching tables:', err);
        } finally {
            setTablesLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchRestaurant();
        fetchProducts();
    }, [fetchRestaurant, fetchProducts]);

    // Load tables when switching to table tab
    useEffect(() => {
        if (activeTab === 'table' && tables.length === 0) {
            fetchTables();
        }
    }, [activeTab, tables.length, fetchTables]);

    const handleProductClick = (productId: string) => {
        router.push(`/dashboard/particulier/product/${productId}?businessId=${restaurantId}`);
    };

    const openReservationModal = (table: Table) => {
        setSelectedTable(table);
        // Default date/time: today + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        setReservationDate(now.toISOString().split('T')[0]);
        setReservationTime(`${String(now.getHours()).padStart(2, '0')}:00`);
        setNotes('');
        setShowReservationModal(true);
    };

    const confirmReservation = async () => {
        if (!selectedTable || !reservationDate || !reservationTime) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const dateTime = new Date(`${reservationDate}T${reservationTime}`);
        if (dateTime <= new Date()) {
            alert('Veuillez choisir une date et heure dans le futur');
            return;
        }

        setReserving(true);
        try {
            // Create reservation order
            await axiosInstance.post('/orders', {
                type: 'RESERVATION',
                businessId: restaurantId,
                tableId: selectedTable.id,
                reservationDate: dateTime.toISOString(),
                notes: notes.trim() || undefined,
                lines: [],
            });

            alert(`✅ Réservation confirmée !\n\nTable ${selectedTable.name} (${selectedTable.capacity} places)\nLe ${dateTime.toLocaleDateString('fr-FR')} à ${dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
            setShowReservationModal(false);
        } catch (err: any) {
            const messages = err?.response?.data?.message;
            const errorText = Array.isArray(messages) ? messages.join('\n') : err?.response?.data?.error || 'Erreur lors de la réservation';
            alert('❌ ' + errorText);
        } finally {
            setReserving(false);
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} style={{ color: i < fullStars ? '#f59e0b' : '#d1d5db' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Chargement du restaurant...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !restaurant) {
        return (
            <DashboardLayout businessType="PARTICULIER">
                <div className={styles.error}>
                    <span className={styles.errorIcon}>🍽️</span>
                    <h2>Restaurant introuvable</h2>
                    <p>{error || 'Ce restaurant n\'existe pas ou a été supprimé.'}</p>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← Retour
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Back button */}
                <button onClick={() => router.back()} className={styles.backButton}>
                    ← Retour
                </button>

                {/* Restaurant Header */}
                <div className={styles.header}>
                    <div className={styles.coverImage}>
                        {restaurant.coverImageUrl ? (
                            <img src={restaurant.coverImageUrl} alt={restaurant.name} />
                        ) : (
                            <div className={styles.coverPlaceholder}>
                                🍽️
                            </div>
                        )}
                    </div>

                    <div className={styles.restaurantInfo}>
                        {restaurant.logoUrl && (
                            <img
                                src={restaurant.logoUrl}
                                alt={restaurant.name}
                                className={styles.logo}
                            />
                        )}

                        <div className={styles.infoContent}>
                            <div className={styles.typeTag}>Restaurant</div>
                            <h1 className={styles.restaurantName}>{restaurant.name}</h1>

                            <div className={styles.rating}>
                                {renderStars(restaurant.averageRating || 0)}
                                <span className={styles.ratingText}>
                                    {(restaurant.averageRating || 0).toFixed(1)} ({restaurant.reviewCount || 0} avis)
                                </span>
                            </div>

                            {restaurant.description && (
                                <p className={styles.description}>{restaurant.description}</p>
                            )}

                            <div className={styles.metaRow}>
                                {restaurant.address && (
                                    <div className={styles.address}>
                                        <span>📍</span>
                                        <span>{restaurant.address}</span>
                                    </div>
                                )}

                                {restaurant.phoneNumber && (
                                    <div className={styles.phone}>
                                        <span>📞</span>
                                        <a href={`tel:${restaurant.phoneNumber}`}>{restaurant.phoneNumber}</a>
                                    </div>
                                )}
                            </div>

                            {restaurant.isVerified && (
                                <span className={styles.verifiedBadge}>✓ Restaurant vérifié</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABS: Menu | Réserver une table */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'menu' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('menu')}
                    >
                        🍽️ Menus
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'table' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('table')}
                    >
                        🪑 Réserver une table
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'menu' ? (
                    /* Menu Section */
                    <section className={styles.menuSection}>
                        <h2 className={styles.sectionTitle}>
                            Notre Menu
                            {products.length > 0 && (
                                <span className={styles.menuCount}>({products.length} plats)</span>
                            )}
                        </h2>

                        {productsLoading ? (
                            <div className={styles.menuLoading}>
                                <div className={styles.spinner} />
                                <p>Chargement du menu...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className={styles.emptyMenu}>
                                <span className={styles.emptyIcon}>🍴</span>
                                <p>Menu en cours de préparation</p>
                            </div>
                        ) : (
                            <div className={styles.menuGrid}>
                                {products.map((product) => {
                                    const firstVariant = product.variants?.[0];
                                    const price = firstVariant ? parseFloat(firstVariant.price) : 0;
                                    const imageUrl = product.imageUrl || firstVariant?.imageUrl;

                                    return (
                                        <div
                                            key={product.id}
                                            className={styles.menuCard}
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            <div className={styles.menuImage}>
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={product.name} />
                                                ) : (
                                                    <div className={styles.imagePlaceholder}>🍽️</div>
                                                )}
                                            </div>
                                            <div className={styles.menuInfo}>
                                                <h3 className={styles.menuName}>{product.name}</h3>
                                                {product.description && (
                                                    <p className={styles.menuDesc}>{product.description}</p>
                                                )}
                                                <span className={styles.menuPrice}>
                                                    {price.toLocaleString('fr-FR')} KMF
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ) : (
                    /* Table Reservation Section */
                    <section className={styles.tableSection}>
                        <h2 className={styles.sectionTitle}>Tables disponibles</h2>

                        {tablesLoading ? (
                            <div className={styles.menuLoading}>
                                <div className={styles.spinner} />
                                <p>Chargement des tables...</p>
                            </div>
                        ) : tables.length === 0 ? (
                            <div className={styles.emptyMenu}>
                                <span className={styles.emptyIcon}>🪑</span>
                                <p>Aucune table disponible</p>
                            </div>
                        ) : (
                            <div className={styles.tablesGrid}>
                                {tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className={`${styles.tableCard} ${!table.isAvailable ? styles.tableUnavailable : ''}`}
                                    >
                                        <div className={styles.tableInfo}>
                                            <h3 className={styles.tableName}>Table {table.name}</h3>
                                            <p className={styles.tableCapacity}>{table.capacity} places</p>
                                            <span className={`${styles.tableStatus} ${table.isAvailable ? styles.available : styles.unavailable}`}>
                                                {table.isAvailable ? '✓ Disponible' : '✗ Indisponible'}
                                            </span>
                                        </div>
                                        {table.isAvailable && (
                                            <button
                                                className={styles.reserveBtn}
                                                onClick={() => openReservationModal(table)}
                                            >
                                                Réserver
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Reservation Modal */}
            {showReservationModal && selectedTable && (
                <div className={styles.modalOverlay} onClick={() => setShowReservationModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Réserver {selectedTable.name}</h2>
                        <p className={styles.modalSubtitle}>{selectedTable.capacity} places</p>

                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <input
                                type="date"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Heure</label>
                            <input
                                type="time"
                                value={reservationTime}
                                onChange={(e) => setReservationTime(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Notes (optionnel)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: anniversaire, allergies..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowReservationModal(false)}
                                disabled={reserving}
                            >
                                Annuler
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={confirmReservation}
                                disabled={reserving}
                            >
                                {reserving ? 'Réservation...' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

