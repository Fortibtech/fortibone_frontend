'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore, Business, BusinessType } from '@/stores/businessStore';
import { getMyBusinesses } from '@/lib/api/business';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './businesses.module.css';

const BUSINESS_CONFIG: Record<BusinessType, { icon: string; color: string; label: string }> = {
    COMMERCANT: { icon: '🏪', color: '#7C3AED', label: 'Commerçant' },
    RESTAURATEUR: { icon: '🍽️', color: '#F59E0B', label: 'Restaurateur' },
    FOURNISSEUR: { icon: '📦', color: '#10B981', label: 'Fournisseur' },
    LIVREUR: { icon: '🚚', color: '#3B82F6', label: 'Livreur' },
};

const BUSINESS_ROUTES: Record<BusinessType, string> = {
    COMMERCANT: '/dashboard/commercant',
    RESTAURATEUR: '/dashboard/restaurateur',
    FOURNISSEUR: '/dashboard/fournisseur',
    LIVREUR: '/dashboard/livreur',
};

export default function ManageBusinessesPage() {
    const router = useRouter();
    const { businesses, setBusinesses, setSelectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                setLoading(true);
                const data = await getMyBusinesses();
                setBusinesses(data || []);
            } catch (error) {
                console.error('Error loading businesses:', error);
            } finally {
                setLoading(false);
            }
        };
        loadBusinesses();
    }, [setBusinesses]);

    const handleSelectBusiness = (business: Business) => {
        setSelectedBusiness(business);
        const targetPath = BUSINESS_ROUTES[business.type];
        router.push(targetPath);
    };

    const handleEditBusiness = (business: Business) => {
        router.push(`/dashboard/businesses/${business.id}/edit`);
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Mes Commerces">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>Mes Commerces</h1>
                        <p className={styles.subtitle}>
                            Gérez vos différentes activités commerciales
                        </p>
                    </div>

                    {/* Add Business Button */}
                    <Link href="/create-business" className={styles.addButton}>
                        <span className={styles.addIcon}>+</span>
                        <span>Ajouter un commerce</span>
                    </Link>

                    {/* Business List */}
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Chargement de vos commerces...</p>
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🏪</span>
                            <h3>Aucun commerce</h3>
                            <p>Vous n&apos;avez pas encore créé de commerce.</p>
                            <Link href="/create-business" className={styles.createButton}>
                                Créer mon premier commerce
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.businessList}>
                            {businesses.map((business) => {
                                const config = BUSINESS_CONFIG[business.type];
                                return (
                                    <div key={business.id} className={styles.businessCard}>
                                        <div
                                            className={styles.businessIcon}
                                            style={{ backgroundColor: `${config.color}15` }}
                                        >
                                            <span>{config.icon}</span>
                                        </div>
                                        <div className={styles.businessInfo}>
                                            <h3 className={styles.businessName}>{business.name}</h3>
                                            <span
                                                className={styles.businessType}
                                                style={{ color: config.color }}
                                            >
                                                {config.label}
                                            </span>
                                            {business.address && (
                                                <p className={styles.businessAddress}>
                                                    📍 {business.address}
                                                </p>
                                            )}
                                        </div>
                                        <div className={styles.businessActions}>
                                            <button
                                                className={styles.selectBtn}
                                                onClick={() => handleSelectBusiness(business)}
                                            >
                                                Ouvrir
                                            </button>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleEditBusiness(business)}
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
