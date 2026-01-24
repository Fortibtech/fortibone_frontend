'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getBusinessById } from '@/lib/api/business';
import { getProducts, Product } from '@/lib/api/products';
import { getTables, Table } from '@/lib/api/tables';
import axiosInstance from '@/lib/api/axiosInstance';
import { Business } from '@/stores/businessStore';
import WebBusinessHeader from '@/components/business/WebBusinessHeader';
import WebProductCard from '@/components/cards/WebProductCard';
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Retour
                </button>

                {/* Unified Header */}
                <WebBusinessHeader
                    name={restaurant.name}
                    type="RESTAURANT"
                    coverImageUrl={restaurant.coverImageUrl}
                    logoUrl={restaurant.logoUrl}
                    rating={restaurant.averageRating || 0}
                    reviewCount={restaurant.reviewCount || 0}
                    description={restaurant.description}
                    address={restaurant.address}
                    phoneNumber={restaurant.phoneNumber}
                    isVerified={restaurant.isVerified}
                />

                {/* TABS: Menu | Réserver une table */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'menu' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('menu')}
                    >
                        🍽️ Carte & Menus
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
                            Notre Carte
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
                                        <WebProductCard
                                            key={product.id}
                                            id={product.id}
                                            name={product.name}
                                            price={price}
                                            currencyCode="KMF"
                                            imageUrl={imageUrl || undefined}
                                            rating={0}
                                            reviewCount={0}
                                            onPress={() => handleProductClick(product.id)}
                                        />
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
                                <p>Aucune table disponible pour le moment</p>
                            </div>
                        ) : (
                            <div className={styles.tablesGrid}>
                                {tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className={`${styles.tableCard} ${!table.isAvailable ? styles.tableUnavailable : ''}`}
                                        onClick={() => table.isAvailable && openReservationModal(table)}
                                    >
                                        <div className={styles.tableHeader}>
                                            <span className={styles.tableIcon}>🪑</span>
                                            <span className={`${styles.statusDot} ${table.isAvailable ? styles.availableDot : styles.unavailableDot}`}></span>
                                        </div>

                                        <div className={styles.tableInfo}>
                                            <h3 className={styles.tableName}>Table {table.name}</h3>
                                            <p className={styles.tableCapacity}>{table.capacity} Personnes</p>
                                        </div>

                                        <button
                                            className={styles.statusBadge}
                                            disabled={!table.isAvailable}
                                        >
                                            {table.isAvailable ? 'Réserver' : 'Occupé'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Reservation Modal - Keeping existing modal logic but ensuring styling context */}
            {showReservationModal && selectedTable && (
                <div className={styles.modalOverlay} onClick={() => setShowReservationModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Réserver la Table {selectedTable.name}</h2>
                        <p className={styles.modalSubtitle}>{selectedTable.capacity} places</p>

                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Heure</label>
                            <input
                                type="time"
                                className={styles.input}
                                value={reservationTime}
                                onChange={(e) => setReservationTime(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Notes (optionnel)</label>
                            <textarea
                                className={styles.textarea}
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

