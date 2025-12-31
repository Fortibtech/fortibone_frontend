'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessStore, Business } from '@/stores/businessStore';
import { getMyBusinesses } from '@/lib/api/business';
import { useUserStore } from '@/stores/userStore';

// Mapping des types de business vers leurs dashboards
const BUSINESS_ROUTES: Record<string, string> = {
    COMMERCANT: '/dashboard/commercant',
    RESTAURATEUR: '/dashboard/restaurateur',
    FOURNISSEUR: '/dashboard/fournisseur',
    LIVREUR: '/dashboard/livreur',
};

// Icônes et couleurs par type de business
const BUSINESS_CONFIG: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
    COMMERCANT: {
        icon: '🏪',
        color: '#7C3AED',
        bgColor: 'rgba(124, 58, 237, 0.1)',
        label: 'Commerçant'
    },
    RESTAURATEUR: {
        icon: '🍽️',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        label: 'Restaurateur'
    },
    FOURNISSEUR: {
        icon: '📦',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        label: 'Fournisseur'
    },
    LIVREUR: {
        icon: '🚚',
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        label: 'Livreur'
    },
};

export default function SelectBusinessPage() {
    const router = useRouter();
    const { userProfile } = useUserStore();
    const { setSelectedBusiness, setBusinesses } = useBusinessStore();
    const [businessList, setBusinessList] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<string | null>(null);

    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                const businesses = await getMyBusinesses();
                setBusinessList(businesses || []);
                setBusinesses(businesses || []);

                // Si un seul business, rediriger automatiquement
                if (businesses && businesses.length === 1) {
                    handleSelectBusiness(businesses[0]);
                }
            } catch (error) {
                console.error('Erreur chargement businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBusinesses();
    }, []);

    const handleSelectBusiness = async (business: Business) => {
        setSelecting(business.id);
        try {
            setSelectedBusiness(business);
            const targetPath = BUSINESS_ROUTES[business.type] || '/dashboard/commercant';
            router.replace(targetPath);
        } catch (error) {
            console.error('Erreur sélection business:', error);
            setSelecting(null);
        }
    };

    if (loading) {
        return (
            <div className="select-business-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement de vos entreprises...</p>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    return (
        <div className="select-business-page">
            <div className="container">
                <div className="header">
                    <h1>Bienvenue, {userProfile?.firstName || 'Professionnel'} !</h1>
                    <p>Sélectionnez l'entreprise avec laquelle vous souhaitez travailler</p>
                </div>

                <div className="business-grid">
                    {businessList.map((business) => {
                        const config = BUSINESS_CONFIG[business.type] || BUSINESS_CONFIG.COMMERCANT;
                        const isSelecting = selecting === business.id;

                        return (
                            <button
                                key={business.id}
                                className={`business-card ${isSelecting ? 'selecting' : ''}`}
                                onClick={() => handleSelectBusiness(business)}
                                disabled={selecting !== null}
                                style={{
                                    '--accent-color': config.color,
                                    '--accent-bg': config.bgColor,
                                } as React.CSSProperties}
                            >
                                <div className="card-icon">
                                    <span className="icon">{config.icon}</span>
                                </div>
                                <div className="card-content">
                                    <h3>{business.name}</h3>
                                    <span className="badge">{config.label}</span>
                                </div>
                                {isSelecting && (
                                    <div className="selecting-indicator">
                                        <div className="mini-spinner"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {businessList.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">🏢</span>
                        <h2>Aucune entreprise</h2>
                        <p>Vous n'avez pas encore d'entreprise associée à votre compte.</p>
                        <button
                            className="create-btn"
                            onClick={() => router.push('/create-business')}
                        >
                            Créer une entreprise
                        </button>
                    </div>
                )}
            </div>
            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
    .select-business-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .container {
        width: 100%;
        max-width: 800px;
    }

    .loading-container {
        text-align: center;
        color: white;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .header {
        text-align: center;
        margin-bottom: 40px;
        color: white;
    }

    .header h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }

    .business-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .business-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        border: 3px solid transparent;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
    }

    .business-card:hover:not(:disabled) {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        border-color: var(--accent-color);
    }

    .business-card:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .business-card.selecting {
        border-color: var(--accent-color);
    }

    .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        background: var(--accent-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .icon {
        font-size: 28px;
    }

    .card-content {
        flex: 1;
        text-align: left;
    }

    .card-content h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #1a1a2e;
        margin-bottom: 6px;
    }

    .badge {
        display: inline-block;
        padding: 4px 12px;
        background: var(--accent-bg);
        color: var(--accent-color);
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .selecting-indicator {
        position: absolute;
        top: 12px;
        right: 12px;
    }

    .mini-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(124, 58, 237, 0.2);
        border-top-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .empty-state {
        text-align: center;
        background: white;
        border-radius: 20px;
        padding: 60px 40px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .empty-icon {
        font-size: 64px;
        display: block;
        margin-bottom: 20px;
    }

    .empty-state h2 {
        font-size: 1.5rem;
        color: #1a1a2e;
        margin-bottom: 8px;
    }

    .empty-state p {
        color: #666;
        margin-bottom: 24px;
    }

    .create-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .create-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 640px) {
        .header h1 {
            font-size: 1.5rem;
        }
        
        .business-grid {
            grid-template-columns: 1fr;
        }
    }
`;
