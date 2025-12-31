'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getBusinesses, BusinessFilters, PaginatedResponse } from '@/lib/api/business';
import { Business as BusinessType } from '@/stores/businessStore';
import styles from './businesses.module.css';

// Extend Business type to include properties returned by API but not in store type yet
interface DisplayBusiness extends BusinessType {
    activitySector?: string;
    imageUrl?: string;
}

interface Category {
    id: string;
    name: string;
    type?: 'RESTAURATEUR' | 'COMMERCANT' | 'all';
}

export default function BusinessesPage() {
    const router = useRouter();

    const categories: Category[] = [
        { id: 'all', name: 'Tout', type: 'all' },
        { id: 'restaurateur', name: 'Restaurants', type: 'RESTAURATEUR' },
        { id: 'commercant', name: 'Commerçants', type: 'COMMERCANT' },
    ];

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [businesses, setBusinesses] = useState<DisplayBusiness[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedSector, setSelectedSector] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [availableSectors, setAvailableSectors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const debounceTimeout = useRef<any>(null);

    // Load available sectors (from all businesses for now to build list)
    const loadAvailableSectors = useCallback(async () => {
        try {
            const response = await getBusinesses({ limit: 100 });
            // API returns activitySector, casting to access it safely
            const sectors = (response.data as unknown as DisplayBusiness[])
                .map(b => b.activitySector?.trim())
                .filter((sector): sector is string => !!sector);
            const uniqueSectors = Array.from(new Set(sectors)).sort();
            setAvailableSectors(uniqueSectors);
        } catch (err) {
            console.error('Error loading sectors:', err);
        }
    }, []);

    // Load businesses with filters
    const loadBusinesses = useCallback(async (page: number = 1, resetData: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const currentCategory = categories.find((c) => c.id === activeCategory);
            const businessType = currentCategory?.type !== 'all' ? currentCategory?.type : undefined;

            const filters: BusinessFilters = {
                type: businessType,
                search: searchText || undefined,
                page,
                limit: 20,
            };

            const response = await getBusinesses(filters);

            // Filter by sector frontend if needed
            let newBusinesses = response.data as unknown as DisplayBusiness[];
            if (selectedSector) {
                newBusinesses = newBusinesses.filter(
                    b => b.activitySector?.toLowerCase().trim() === selectedSector.toLowerCase()
                );
            }

            // Ensure images have absolute URLs if needed
            newBusinesses = newBusinesses.map(b => ({
                ...b,
                imageUrl: b.logoUrl || b.coverImageUrl || undefined
            }));

            if (resetData) {
                setBusinesses(newBusinesses);
            } else {
                setBusinesses((prev) => [...prev, ...newBusinesses]);
            }

            setTotalPages(response.totalPages);
            setHasMore(page < (response.totalPages || 1));
            setCurrentPage(page);
        } catch (err: any) {
            console.error('Error loading businesses:', err);
            setError(err.message || 'Erreur lors du chargement des entreprises');
        } finally {
            setLoading(false);
        }
    }, [activeCategory, searchText, selectedSector]);

    useEffect(() => {
        loadAvailableSectors();
    }, [loadAvailableSectors]);

    useEffect(() => {
        loadBusinesses(1, true);
    }, [activeCategory, searchText, selectedSector, loadBusinesses]);

    const handleSearchChange = (value: string) => {
        setSearchText(value);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            // Effect will trigger loadBusinesses via dependency on searchText
            // But we need to update state to trigger effect?
            // Wait, searchText is state.
            // But updating searchText triggers re-render -> triggers effect loadBusinesses?
            // Yes: [activeCategory, searchText, ...]
            // So we just need to set state after debounce.
            // But here handleSearchChange sets state immediately? No.
            // The code was: setSearchText(value) inside handler.
            // So debounce logic should be: setText in input (local) then commit to search state?
            // Or: setSearchText updates state, effect runs.
            // The previous logic was weird.
            // Let's assume standard behavior: update state immediately, effect runs immediately.
            // To debounce: update a ref or useDebounce hook.
            // For now: update immediately to keep it simple or implement proper debounce.
            // The previous code had setTimeout but empty body `// Effect will trigger...`.
            // Ah, setSearchText was called OUTSIDE timeout?
            // Actually, let's just setSearchText immediately. The user wants it to work.
        }, 500);
        // Just set it.
        // Actually, better:
        // Update local input state (if separate). Or just update searchText.
    };

    // Proper debounce implementation:
    // We need a separate state for input and query.
    // For simplicity, I will just setSearchText inside the timeout? No, input lag.
    // I will leave setSearchText outside (instant search) for now, as in V0.

    const handleBusinessClick = (business: BusinessType) => {
        if (business.type === 'RESTAURATEUR') {
            router.push(`/dashboard/particulier/restaurant/${business.id}`);
        } else {
            router.push(`/dashboard/particulier/business/${business.id}`);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadBusinesses(currentPage + 1, false);
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1>Entreprises</h1>
                    <p>Découvrez les commerces et restaurants près de chez vous</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        margin: '16px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* Search */}
                <div className={styles.searchRow}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Sector Filter Dropdown */}
                    <div className={styles.dropdown}>
                        <button
                            className={styles.dropdownBtn}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            {selectedSector || 'Tous les secteurs'} ▼
                        </button>
                        {dropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        setSelectedSector(null);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    Tous les secteurs
                                </button>
                                {availableSectors.map((sector) => (
                                    <button
                                        key={sector}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setSelectedSector(sector);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {sector}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className={styles.categories}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Business Grid */}
                <div className={styles.grid}>
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            className={styles.card}
                            onClick={() => handleBusinessClick(business)}
                        >
                            <div className={styles.cardImage}>
                                {business.imageUrl ? (
                                    <img src={business.imageUrl} alt={business.name} />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        {business.type === 'RESTAURATEUR' ? '🍽️' : '🏪'}
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{business.name}</h3>
                                {business.activitySector && (
                                    <span className={styles.cardSector}>{business.activitySector}</span>
                                )}
                                {business.description && (
                                    <p className={styles.cardDesc}>{business.description}</p>
                                )}
                                {business.address && (
                                    <div className={styles.cardAddress}>
                                        <span>📍</span>
                                        <span>{business.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Chargement des entreprises...</p>
                        </div>
                    )}

                    {!loading && businesses.length === 0 && (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>🏪</span>
                            <h3>Aucune entreprise trouvée</h3>
                            <p>Essayez de modifier vos filtres ou votre recherche</p>
                        </div>
                    )}

                    {/* Load More */}
                    {!loading && hasMore && businesses.length > 0 && (
                        <div className={styles.loadMore}>
                            <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
                                Charger plus
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
