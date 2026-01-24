'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { getBusinesses, type PaginatedResponse } from '@/lib/api/business';
import { useProCartStore } from '@/stores/achatCartStore';
import styles from './achats.module.css';

interface Supplier {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    type: string;
    reviewCount?: number;
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
    box: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    orders: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
};

export default function AchatsPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { getTotalItems } = useProCartStore();
    const totalCartItems = getTotalItems();

    const loadSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBusinesses({
                type: 'FOURNISSEUR',
                limit: 50,
            });
            setSuppliers(response.data || []);
        } catch (error) {
            console.error('Erreur chargement fournisseurs:', error);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    const filteredSuppliers = suppliers.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Approvisionnement">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div>
                                <h1 className={styles.title}>Approvisionnement</h1>
                                <p className={styles.subtitle}>
                                    Commandez vos matières premières auprès des fournisseurs
                                </p>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <Link href="/dashboard/restaurateur/achats/orders" className={styles.ordersButton}>
                                {icons.orders}
                                <span>Mes commandes</span>
                            </Link>
                            <Link href="/dashboard/restaurateur/achats/cart" className={styles.cartButton}>
                                {icons.cart}
                                <span>Panier</span>
                                {totalCartItems > 0 && (
                                    <span className={styles.cartBadge}>{totalCartItems}</span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Search */}
                    <div className={styles.searchSection}>
                        <div className={styles.searchBar}>
                            {icons.search}
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Rechercher un fournisseur..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Suppliers Grid */}
                    <div className={styles.suppliersSection}>
                        <div className={styles.resultsInfo}>
                            <span className={styles.resultsCount}>
                                {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''} disponible{filteredSuppliers.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p className={styles.loadingText}>Chargement des fournisseurs...</p>
                            </div>
                        ) : filteredSuppliers.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>{icons.box}</div>
                                <h3 className={styles.emptyTitle}>
                                    {searchQuery ? `Aucun fournisseur trouvé pour "${searchQuery}"` : 'Aucun fournisseur disponible'}
                                </h3>
                                <p className={styles.emptyText}>Revenez plus tard</p>
                            </div>
                        ) : (
                            <div className={styles.suppliersGrid}>
                                {filteredSuppliers.map((supplier) => (
                                    <Link
                                        key={supplier.id}
                                        href={`/dashboard/restaurateur/achats/${supplier.id}`}
                                        className={styles.supplierCard}
                                    >
                                        <div className={styles.logoContainer}>
                                            {supplier.logoUrl ? (
                                                <img
                                                    src={supplier.logoUrl}
                                                    alt={supplier.name}
                                                    className={styles.logo}
                                                />
                                            ) : (
                                                <span className={styles.logoPlaceholder}>📦</span>
                                            )}
                                        </div>
                                        <h3 className={styles.supplierName}>{supplier.name}</h3>
                                        <p className={styles.supplierDesc}>
                                            {supplier.description || 'Fournisseur'}
                                        </p>
                                        <span className={styles.supplierReviews}>
                                            {supplier.reviewCount || 0} avis
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
