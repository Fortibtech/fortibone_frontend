'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    uploadMenuImage,
    Menu,
    CreateMenuInput,
    UpdateMenuInput
} from '@/lib/api/menus';
import { getProducts } from '@/lib/api/products';
import styles from './menus.module.css';

type TabType = 'MENUS' | 'PLATS';

export default function RestaurateurMenusPage() {
    const { selectedBusiness } = useBusinessStore();

    // État onglet actif
    const [activeTab, setActiveTab] = useState<TabType>('MENUS');

    // États pour Menus & Formules
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // États pour Plats individuels
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // États Modal création/édition
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Charger les menus
    const fetchMenus = useCallback(async () => {
        if (!selectedBusiness) return;
        try {
            const data = await getMenus(selectedBusiness.id);
            setMenus(data || []);
        } catch (error) {
            console.error('Erreur chargement menus:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    // Charger les plats
    const fetchProducts = useCallback(async () => {
        if (!selectedBusiness) return;
        setProductsLoading(true);
        try {
            const data = await getProducts(selectedBusiness.id, {
                limit: 100,
                search: searchTerm || undefined
            });
            setProducts(data.data || []);
        } catch (error) {
            console.error('Erreur chargement plats:', error);
        } finally {
            setProductsLoading(false);
        }
    }, [selectedBusiness, searchTerm]);

    useEffect(() => {
        if (selectedBusiness) {
            if (activeTab === 'MENUS') {
                fetchMenus();
            } else {
                fetchProducts();
            }
        }
    }, [selectedBusiness, activeTab, fetchMenus, fetchProducts]);

    // Refresh
    const onRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'MENUS') {
            await fetchMenus();
        } else {
            await fetchProducts();
        }
        setRefreshing(false);
    };

    // Reset form
    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setIsActive(true);
        setImageFile(null);
        setImagePreview(null);
        setCurrentMenuId(null);
        setIsEditMode(false);
    };

    // Ouvrir modal création
    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    // Ouvrir modal édition
    const openEditModal = (menu: Menu) => {
        setIsEditMode(true);
        setCurrentMenuId(menu.id);
        setName(menu.name);
        setDescription(menu.description || '');
        setPrice(menu.price.toString());
        setIsActive(menu.isActive);
        setImagePreview(menu.imageUrl || null);
        setModalVisible(true);
    };

    // Gestion image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Sauvegarder menu
    const handleSave = async () => {
        if (!name.trim() || !price.trim()) {
            alert('Nom et prix obligatoires');
            return;
        }

        const priceNum = parseInt(price.replace(/[^0-9]/g, ''), 10);
        if (isNaN(priceNum) || priceNum <= 0) {
            alert('Prix invalide');
            return;
        }

        if (!selectedBusiness) return;
        setSaving(true);

        try {
            if (isEditMode && currentMenuId) {
                // Mise à jour
                await updateMenu(selectedBusiness.id, currentMenuId, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    price: priceNum,
                    isActive,
                });

                // Upload image si nouvelle
                if (imageFile) {
                    await uploadMenuImage(selectedBusiness.id, currentMenuId, imageFile);
                }

                alert('✅ Menu modifié !');
            } else {
                // Création
                const created = await createMenu(selectedBusiness.id, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    price: priceNum,
                    isActive,
                    items: [],
                });

                // Upload image
                if (imageFile) {
                    await uploadMenuImage(selectedBusiness.id, created.id, imageFile);
                }

                alert('✅ Menu créé !');
            }

            await fetchMenus();
            setModalVisible(false);
            resetForm();
        } catch (error: any) {
            console.error('Erreur sauvegarde:', error);
            alert(error.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    // Supprimer menu
    const handleDelete = async (menu: Menu) => {
        if (!selectedBusiness || !confirm(`Supprimer "${menu.name}" ?`)) return;

        try {
            await deleteMenu(selectedBusiness.id, menu.id);
            await fetchMenus();
            alert(`✅ "${menu.name}" supprimé`);
        } catch (error: any) {
            console.error('Erreur suppression:', error);
            alert(error.message || 'Impossible de supprimer');
        }
    };

    // Formater prix
    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return num.toLocaleString('fr-FR');
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Menu">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1>🍽️ Gestion du menu</h1>
                        {activeTab === 'MENUS' && (
                            <button className={styles.addButton} onClick={openCreateModal}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Onglets - Comme mobile */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'MENUS' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('MENUS')}
                        >
                            Menus & Formules
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'PLATS' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('PLATS')}
                        >
                            Plats individuels
                        </button>
                    </div>

                    {/* Contenu */}
                    {activeTab === 'MENUS' ? (
                        // ========== ONGLET MENUS & FORMULES ==========
                        <div className={styles.menusContent}>
                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner} />
                                    <p>Chargement des menus...</p>
                                </div>
                            ) : menus.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>🍽️</span>
                                    <h2>Aucun menu</h2>
                                    <p>Créez votre première formule</p>
                                    <button className={styles.emptyButton} onClick={openCreateModal}>
                                        + Créer un menu
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.menusList}>
                                    {menus.map((menu) => (
                                        <div key={menu.id} className={styles.menuCard}>
                                            <div className={styles.menuImage}>
                                                {menu.imageUrl ? (
                                                    <img src={menu.imageUrl} alt={menu.name} />
                                                ) : (
                                                    <div className={styles.menuImagePlaceholder}>
                                                        <span>🍽️</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.menuContent}>
                                                <h3>{menu.name}</h3>
                                                {menu.description ? (
                                                    <p className={styles.menuDescription}>{menu.description}</p>
                                                ) : (
                                                    <p className={styles.noDescription}>Aucune description</p>
                                                )}
                                                <span className={styles.menuPrice}>
                                                    {formatPrice(menu.price)} KMF
                                                </span>
                                                <div className={styles.menuFooter}>
                                                    <span className={`${styles.statusBadge} ${menu.isActive ? styles.active : styles.inactive}`}>
                                                        {menu.isActive ? 'Visible' : 'Masqué'}
                                                    </span>
                                                    <div className={styles.menuActions}>
                                                        <button
                                                            className={styles.editBtn}
                                                            onClick={() => openEditModal(menu)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDelete(menu)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // ========== ONGLET PLATS INDIVIDUELS ==========
                        <div className={styles.platsContent}>
                            {/* Recherche */}
                            <div className={styles.searchBar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Rechercher un plat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Bouton ajouter */}
                            <div className={styles.platsHeader}>
                                <span>{products.length} plat(s)</span>
                                <a href="/dashboard/restaurateur/menus/add" className={styles.addPlat}>
                                    + Ajouter un plat
                                </a>
                            </div>

                            {/* Liste des plats */}
                            <div className={styles.platsGrid}>
                                {productsLoading ? (
                                    <div className={styles.loading}>
                                        <div className={styles.spinner} />
                                    </div>
                                ) : products.length > 0 ? (
                                    products.map((product) => (
                                        <div key={product.id} className={styles.platCard}>
                                            <div className={styles.platImage}>
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} />
                                                ) : (
                                                    <div className={styles.platImagePlaceholder}>🍴</div>
                                                )}
                                            </div>
                                            <div className={styles.platInfo}>
                                                <h4>{product.name}</h4>
                                                <span className={styles.platCategory}>
                                                    {product.category?.name || 'Sans catégorie'}
                                                </span>
                                                <span className={styles.platPrice}>
                                                    {product.variants?.[0]?.price
                                                        ? `${parseFloat(product.variants[0].price).toLocaleString()} KMF`
                                                        : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <p>Aucun plat trouvé</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal création/édition - Comme mobile */}
                {modalVisible && (
                    <div className={styles.modalOverlay} onClick={() => setModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{isEditMode ? 'Modifier le menu' : 'Nouveau menu'}</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setModalVisible(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Image picker */}
                                <div
                                    className={styles.imagePicker}
                                    onClick={() => document.getElementById('menuImageInput')?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Aperçu" />
                                    ) : (
                                        <div className={styles.imagePickerPlaceholder}>
                                            <span>📷</span>
                                            <span>Ajouter une photo</span>
                                        </div>
                                    )}
                                    <input
                                        id="menuImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {/* Nom */}
                                <label className={styles.label}>Nom *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Menu Duo..."
                                />

                                {/* Description */}
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Inclus pizza + boisson..."
                                    rows={3}
                                />

                                {/* Prix */}
                                <label className={styles.label}>Prix (KMF) *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="2500"
                                />

                                {/* Toggle visibilité */}
                                <div className={styles.switchRow}>
                                    <span>Visible aux clients</span>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                {/* Boutons */}
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                    disabled={!name || !price || saving}
                                >
                                    {saving ? 'Enregistrement...' : 'Sauvegarder'}
                                </button>

                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setModalVisible(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
