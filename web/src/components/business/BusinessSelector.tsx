'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessStore, Business, BusinessType } from '@/stores/businessStore';
import { getMyBusinesses } from '@/lib/api/business';

// Mapping des types de business vers leurs dashboards (identique mobile)
const BUSINESS_ROUTES: Record<BusinessType, string> = {
    COMMERCANT: '/dashboard/commercant',
    RESTAURATEUR: '/dashboard/restaurateur',
    FOURNISSEUR: '/dashboard/fournisseur',
    LIVREUR: '/dashboard/livreur',
};

// Config visuelle par type (identique mobile)
const BUSINESS_CONFIG: Record<BusinessType, { icon: string; color: string; label: string }> = {
    COMMERCANT: { icon: '🏪', color: '#7C3AED', label: 'Commerçant' },
    RESTAURATEUR: { icon: '🍽️', color: '#F59E0B', label: 'Restaurateur' },
    FOURNISSEUR: { icon: '📦', color: '#10B981', label: 'Fournisseur' },
    LIVREUR: { icon: '🚚', color: '#3B82F6', label: 'Livreur' },
};

interface BusinessSelectorProps {
    onBusinessSelect?: (business: Business) => void;
    onAddBusiness?: () => void;
    onManageBusiness?: () => void;
    compact?: boolean; // Pour la version mobile nav
}

export default function BusinessSelector({
    onBusinessSelect,
    onAddBusiness,
    onManageBusiness,
    compact = false,
}: BusinessSelectorProps) {
    const router = useRouter();
    const { selectedBusiness, businesses, setSelectedBusiness, setBusinesses, bumpVersion } = useBusinessStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Charger les businesses au montage
    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                setLoading(true);
                const data = await getMyBusinesses();
                setBusinesses(data || []);
            } catch (error) {
                console.error('Erreur chargement businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        if (businesses.length === 0) {
            loadBusinesses();
        }
    }, []);

    const handleSelect = async (business: Business) => {
        setSelectedBusiness(business);
        bumpVersion();
        setIsOpen(false);

        if (onBusinessSelect) {
            onBusinessSelect(business);
        } else {
            // Comportement par défaut : redirect vers le dashboard du type
            const targetPath = BUSINESS_ROUTES[business.type];
            router.replace(targetPath);
        }
    };

    const handleAddBusiness = () => {
        setIsOpen(false);
        if (onAddBusiness) {
            onAddBusiness();
        } else {
            router.push('/create-business');
        }
    };

    const handleManageBusiness = () => {
        setIsOpen(false);
        if (onManageBusiness) {
            onManageBusiness();
        } else {
            // Navigate to businesses management page
            router.push('/dashboard/businesses');
        }
    };

    const config = selectedBusiness ? BUSINESS_CONFIG[selectedBusiness.type] : null;

    return (
        <div className="business-selector">
            {/* Trigger Button */}
            <button
                className={`trigger ${compact ? 'compact' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <div className="trigger-left">
                    <span className="trigger-icon">🏪</span>
                    <div className="trigger-info">
                        <span className="trigger-label">Commerce actuel</span>
                        <span className="trigger-value">
                            {selectedBusiness?.name || 'Sélectionner'}
                        </span>
                    </div>
                </div>
                <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="modal-header">
                            <h3>Mes Commerces</h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Business List */}
                        <div className="business-list">
                            {loading ? (
                                <div className="loading">
                                    <div className="spinner"></div>
                                    <span>Chargement...</span>
                                </div>
                            ) : businesses.length === 0 ? (
                                <div className="empty">
                                    <span>Aucun commerce</span>
                                </div>
                            ) : (
                                businesses.map((business) => {
                                    const bConfig = BUSINESS_CONFIG[business.type];
                                    const isSelected = selectedBusiness?.id === business.id;

                                    return (
                                        <button
                                            key={business.id}
                                            className={`business-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelect(business)}
                                        >
                                            <div className="business-icon" style={{ backgroundColor: `${bConfig.color}15` }}>
                                                <span>{bConfig.icon}</span>
                                            </div>
                                            <div className="business-info">
                                                <span className="business-name">{business.name}</span>
                                                <span className="business-type" style={{ color: bConfig.color }}>
                                                    {bConfig.label}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <svg className="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C851" strokeWidth="2">
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="modal-footer">
                            <button className="add-btn" onClick={handleAddBusiness}>
                                Ajouter
                            </button>
                            <button className="manage-btn" onClick={handleManageBusiness}>
                                Gérer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .business-selector {
                    position: relative;
                }

                .trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 10px 12px;
                    background: #F5F5F5;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .trigger:hover {
                    background: #ECECEC;
                }

                .trigger.compact {
                    padding: 8px 10px;
                }

                .trigger-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                }

                .trigger-icon {
                    font-size: 18px;
                }

                .trigger-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    min-width: 0;
                }

                .trigger-label {
                    font-size: 10px;
                    color: #999;
                }

                .trigger-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #000;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                }

                .chevron {
                    color: #666;
                    flex-shrink: 0;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 400px;
                    max-height: 70vh;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #F0F0F0;
                }

                .modal-header h3 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #000;
                }

                .business-list {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 300px;
                }

                .loading, .empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    gap: 12px;
                    color: #999;
                }

                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #E0E0E0;
                    border-top-color: #00C851;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .business-item {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 16px 20px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    gap: 12px;
                    transition: background 0.2s;
                }

                .business-item:hover {
                    background: #F8F8F8;
                }

                .business-item.selected {
                    background: #F0FFF4;
                }

                .business-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .business-info {
                    flex: 1;
                    text-align: left;
                }

                .business-name {
                    display: block;
                    font-size: 16px;
                    font-weight: 500;
                    color: #000;
                }

                .business-type {
                    display: block;
                    font-size: 12px;
                    margin-top: 2px;
                }

                .check-icon {
                    flex-shrink: 0;
                }

                .modal-footer {
                    display: flex;
                    gap: 10px;
                    padding: 15px;
                    border-top: 1px solid #F0F0F0;
                }

                .add-btn, .manage-btn {
                    flex: 1;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: transform 0.1s;
                }

                .add-btn:active, .manage-btn:active {
                    transform: scale(0.98);
                }

                .add-btn {
                    background: #00C851;
                    color: white;
                }

                .manage-btn {
                    background: #E8F5E9;
                    color: #00C851;
                }
            `}</style>
        </div>
    );
}
