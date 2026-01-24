'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getProducts, deleteProduct } from '@/lib/api/products';
import {
    getBusinessInventory,
    getExpiringSoonProducts,
    recordExpiredLosses,
    mapInventoryToDisplay,
    InventoryDisplayItem,
    Batch
} from '@/lib/api/inventory';
import Link from 'next/link';
import styles from './products.module.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TabType = 'catalogue' | 'inventaire';

export default function ProductsPage() {
    const { selectedBusiness } = useBusinessStore();

    // État Catalogue
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>('catalogue');

    // État Inventaire (aligné mobile)
    const [inventory, setInventory] = useState<InventoryDisplayItem[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryPage, setInventoryPage] = useState(1);
    const [inventoryTotalPages, setInventoryTotalPages] = useState(1);
    const [inventorySearch, setInventorySearch] = useState('');

    // État Expirations (aligné mobile)
    const [expiringCount, setExpiringCount] = useState(0);
    const [expiringBatches, setExpiringBatches] = useState<Batch[]>([]);
    const [expiringModalOpen, setExpiringModalOpen] = useState(false);
    const [loadingExpiring, setLoadingExpiring] = useState(false);
    const [submittingLosses, setSubmittingLosses] = useState(false);

    // Charger Catalogue
    useEffect(() => {
        if (selectedBusiness && activeTab === 'catalogue') {
            loadProducts();
        }
    }, [selectedBusiness, page, searchTerm, activeTab]);

    // Charger Inventaire
    useEffect(() => {
        if (selectedBusiness && activeTab === 'inventaire') {
            loadInventory();
            loadExpiringCount();
        }
    }, [selectedBusiness, inventoryPage, activeTab]);

    const loadProducts = async () => {
        if (!selectedBusiness) return;
        setLoading(true);
        try {
            const data = await getProducts(selectedBusiness.id, {
                page,
                limit: 12,
                search: searchTerm || undefined
            });
            setProducts(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInventory = async () => {
        if (!selectedBusiness || inventoryLoading) return;
        setInventoryLoading(true);
        try {
            const res = await getBusinessInventory(selectedBusiness.id, inventoryPage, 10);
            const mapped = mapInventoryToDisplay(res.data);
            setInventory(inventoryPage === 1 ? mapped : [...inventory, ...mapped]);
            setInventoryTotalPages(res.totalPages);
        } catch (error) {
            console.error('Error loading inventory:', error);
        } finally {
            setInventoryLoading(false);
        }
    };

    const loadExpiringCount = async () => {
        if (!selectedBusiness) return;
        try {
            const data = await getExpiringSoonProducts(selectedBusiness.id, 30);
            setExpiringCount(data.length);
        } catch (error) {
            console.error('Error loading expiring count:', error);
            setExpiringCount(0);
        }
    };

    const loadExpiringProducts = async () => {
        if (!selectedBusiness) return;
        setLoadingExpiring(true);
        try {
            const data = await getExpiringSoonProducts(selectedBusiness.id, 30);
            setExpiringBatches(data);
        } catch (error) {
            console.error('Error loading expiring products:', error);
        } finally {
            setLoadingExpiring(false);
        }
    };

    const openExpiringModal = async () => {
        await loadExpiringProducts();
        setExpiringModalOpen(true);
    };

    const handleRecordLosses = async () => {
        if (!selectedBusiness) return;
        setSubmittingLosses(true);
        try {
            const response = await recordExpiredLosses(selectedBusiness.id);
            toast.success(`${response.lossesRecorded} perte(s) enregistrée(s)`, {
                description: 'Les stocks ont été mis à jour',
            });
            // Recharger les données
            setInventory([]);
            setInventoryPage(1);
            loadInventory();
            loadExpiringCount();
            loadExpiringProducts();
            setExpiringModalOpen(false);
        } catch (error) {
            console.error('Error recording losses:', error);
            toast.error('Impossible d\'enregistrer les pertes', {
                description: 'Veuillez réessayer',
            });
        } finally {
            setSubmittingLosses(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!selectedBusiness) return;
        // Simple confirm for now - could be replaced with modal
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
        try {
            await deleteProduct(selectedBusiness.id, productId);
            setProducts(products.filter(p => p.id !== productId));
            toast.success('Produit supprimé');
        } catch (error: any) {
            console.error('Error deleting product:', error);
            toast.error('Erreur lors de la suppression', {
                description: error.response?.data?.message || error.message,
            });
        }
    };

    // Export PDF (version web simplifiée)
    const exportToPDF = () => {
        const filteredInventory = inventory.filter(p =>
            p.name.toLowerCase().includes(inventorySearch.toLowerCase())
        );

        const htmlContent = `
            <!DOCTYPE html>
            <html><head><meta charset="utf-8">
            <style>
                body { font-family: Arial; margin: 40px; color: #111827; }
                h1 { text-align: center; color: #10B981; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
                th { background-color: #F9FAFB; color: #6B7280; }
                tr:nth-child(even) { background-color: #F9FAFB; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; }
            </style>
            </head><body>
            <h1>Inventaire - ${new Date().toLocaleDateString('fr-FR')}</h1>
            <table><thead><tr>
                <th>#</th><th>Produit</th><th>SKU</th><th>Qté</th><th>Prix</th>
            </tr></thead><tbody>
                ${filteredInventory.map((p, i) => `<tr>
                    <td>${i + 1}</td><td>${p.name}</td><td>${p.sku}</td><td>${p.quantityInStock}</td>
                    <td>${p.price} KMF</td>
                </tr>`).join('')}
            </tbody></table>
            <div class="footer">Généré le ${new Date().toLocaleString('fr-FR')}</div>
            </body></html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const getMainPrice = (product: any) => {
        if (!product.variants?.length) return '0';
        return parseFloat(product.variants[0].price).toLocaleString('fr-FR');
    };

    const getStock = (product: any) => {
        if (!product.variants?.length) return 0;
        return product.variants.reduce((sum: number, v: any) => sum + (v.quantityInStock || 0), 0);
    };

    // Filtrer inventaire
    const filteredInventory = inventory.filter(p =>
        p.name.toLowerCase().includes(inventorySearch.toLowerCase())
    );

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Produits">
                <div className={styles.container}>
                    {/* Onglets - Comme mobile */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'catalogue' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('catalogue')}
                        >
                            Catalogue
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'inventaire' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('inventaire')}
                        >
                            Inventaire
                        </button>
                    </div>

                    {activeTab === 'catalogue' ? (
                        <>
                            {/* Header Catalogue */}
                            <div className={styles.header}>
                                <div className={styles.headerLeft}>
                                    <h1>Catalogue produits</h1>
                                    <span className={styles.count}>{products.length} produit(s)</span>
                                </div>
                                <Link href="/dashboard/commercant/products/add" className={styles.addBtn}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Ajouter produit
                                </Link>
                            </div>

                            {/* Search */}
                            <div className={styles.searchBar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Products Grid */}
                            <div className={styles.productsGrid}>
                                {loading ? (
                                    <div className={styles.loading}>
                                        <div className={styles.spinner} />
                                        <p>Chargement des produits...</p>
                                    </div>
                                ) : products.length > 0 ? (
                                    products.map(product => (
                                        <div key={product.id} className={styles.productCard}>
                                            <div className={styles.productImage}>
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} />
                                                ) : (
                                                    <div className={styles.noImage}>
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span
                                                    className={styles.stockBadge}
                                                    style={{
                                                        backgroundColor: getStock(product) > 0 ? '#dcfce7' : '#fee2e2',
                                                        color: getStock(product) > 0 ? '#16a34a' : '#dc2626'
                                                    }}
                                                >
                                                    {getStock(product) > 0 ? `${getStock(product)} en stock` : 'Rupture'}
                                                </span>
                                            </div>
                                            <div className={styles.productInfo}>
                                                <h3>{product.name}</h3>
                                                <p className={styles.category}>{product.category?.name || 'Non catégorisé'}</p>
                                                <div className={styles.productFooter}>
                                                    <span className={styles.price}>{getMainPrice(product)} KMF</span>
                                                    <div className={styles.actions}>
                                                        <Link
                                                            href={`/dashboard/commercant/products/${product.id}`}
                                                            className={styles.editBtn}
                                                        >
                                                            ✏️
                                                        </Link>
                                                        <button
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                        <p>Aucun produit dans votre catalogue</p>
                                        <Link href="/dashboard/commercant/products/add" className={styles.addBtn}>
                                            Ajouter mon premier produit
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className={styles.pageBtn}
                                    >
                                        ← Précédent
                                    </button>
                                    <span className={styles.pageInfo}>Page {page} / {totalPages}</span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className={styles.pageBtn}
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ========== ONGLET INVENTAIRE (ALIGNÉ MOBILE) ========== */
                        <div className={styles.inventoryContainer}>
                            {/* Header avec alerte expirations */}
                            <div className={styles.inventoryHeader}>
                                <div className={styles.inventoryHeaderLeft}>
                                    <h1>📦 Inventaire</h1>
                                    <p className={styles.subtitle}>Gérez vos stocks, lots et alertes d'expiration</p>
                                </div>
                                <div className={styles.inventoryHeaderRight}>
                                    {/* Bouton alerte expirations - comme mobile */}
                                    <button
                                        className={styles.alertButton}
                                        onClick={openExpiringModal}
                                        style={{
                                            color: expiringCount > 0 ? '#DC2626' : '#10B981',
                                            borderColor: expiringCount > 0 ? '#DC2626' : '#10B981'
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        {expiringCount > 0 && <span className={styles.alertBadge}>{expiringCount}</span>}
                                    </button>
                                    {/* Bouton export PDF */}
                                    <button className={styles.exportButton} onClick={exportToPDF}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14,2 14,8 20,8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10,9 9,9 8,9" />
                                        </svg>
                                        PDF
                                    </button>
                                </div>
                            </div>

                            {/* Barre de recherche inventaire */}
                            <div className={styles.searchBar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Rechercher dans l'inventaire..."
                                    value={inventorySearch}
                                    onChange={(e) => setInventorySearch(e.target.value)}
                                />
                            </div>

                            {/* Tableau inventaire - Comme mobile */}
                            <div className={styles.inventoryTableContainer}>
                                <div className={styles.inventoryTable}>
                                    <div className={styles.tableHeader}>
                                        <span className={styles.colId}>#</span>
                                        <span className={styles.colProduct}>Produit</span>
                                        <span className={styles.colSku}>SKU</span>
                                        <span className={styles.colQty}>Qté</span>
                                        <span className={styles.colLots}>Lots</span>
                                        <span className={styles.colSold}>Vendu</span>
                                        <span className={styles.colActions}>Détails</span>
                                    </div>
                                    <div className={styles.tableBody}>
                                        {inventoryLoading && inventory.length === 0 ? (
                                            <div className={styles.tableLoading}>
                                                <div className={styles.spinner} />
                                                <p>Chargement...</p>
                                            </div>
                                        ) : filteredInventory.length > 0 ? (
                                            filteredInventory.map((item) => (
                                                <div key={item.id} className={styles.tableRow}>
                                                    <span className={styles.colId}>{item.id.slice(-3)}</span>
                                                    <span className={styles.colProduct}>{item.name}</span>
                                                    <span className={styles.colSku}>{item.sku}</span>
                                                    <span className={`${styles.colQty} ${item.quantityInStock < 10 ? styles.lowQty : ''}`}>
                                                        {item.quantityInStock}
                                                    </span>
                                                    <span className={styles.colLots}>{item.lots}</span>
                                                    <span className={styles.colSold}>{item.sold}</span>
                                                    <span className={styles.colActions}>
                                                        <Link
                                                            href={`/dashboard/commercant/products/inventory/${item.id}`}
                                                            className={styles.detailsBtn}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                        </Link>
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.tableEmpty}>
                                                <p>Aucun produit dans l'inventaire</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Load more */}
                                {inventoryPage < inventoryTotalPages && (
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={() => setInventoryPage(p => p + 1)}
                                        disabled={inventoryLoading}
                                    >
                                        {inventoryLoading ? 'Chargement...' : 'Charger plus'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Produits Expirants - Comme mobile */}
                {expiringModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setExpiringModalOpen(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Produits expirant bientôt ({expiringBatches.length})</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setExpiringModalOpen(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {loadingExpiring ? (
                                    <div className={styles.modalLoading}>
                                        <div className={styles.spinner} />
                                    </div>
                                ) : expiringBatches.length === 0 ? (
                                    <p className={styles.emptyMessage}>
                                        ✅ Aucun produit à expirer bientôt.
                                    </p>
                                ) : (
                                    <>
                                        <div className={styles.expiringList}>
                                            {expiringBatches.map((batch) => (
                                                <div key={batch.id} className={styles.expiringItem}>
                                                    <span className={styles.expiringName}>
                                                        {batch.variant?.product?.name || 'Produit inconnu'}
                                                    </span>
                                                    <span className={styles.expiringInfo}>
                                                        Quantité : {batch.quantity} | Expire le{' '}
                                                        {format(new Date(batch.expirationDate), 'dd/MM/yyyy', { locale: fr })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            className={styles.recordLossesBtn}
                                            onClick={handleRecordLosses}
                                            disabled={submittingLosses}
                                        >
                                            {submittingLosses ? 'Enregistrement...' : 'Enregistrer les pertes'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                className={styles.closeModalBtn}
                                onClick={() => setExpiringModalOpen(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
