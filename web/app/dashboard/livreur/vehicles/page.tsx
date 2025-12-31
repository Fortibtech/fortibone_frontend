'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getBusinessVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    Vehicle,
    VehicleType
} from '@/lib/api/delivery';
import styles from './vehicles.module.css';

type TabType = 'VEHICLES' | 'MAP';

export default function LivreurVehiclesPage() {
    const { selectedBusiness } = useBusinessStore();

    // États
    const [activeTab, setActiveTab] = useState<TabType>('VEHICLES');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Modal Ajout
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [creating, setCreating] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        type: 'MOTO' as VehicleType,
        licensePlate: '',
        brand: '',
        model: '',
        capacity: '',
    });

    // Modal Modification
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
    const [editForm, setEditForm] = useState<Partial<Vehicle>>({});

    // Charger les véhicules
    const loadVehicles = useCallback(async () => {
        if (!selectedBusiness?.id) return;
        try {
            setLoading(true);
            setError(false);
            const data = await getBusinessVehicles(selectedBusiness.id);
            setVehicles(data || []);
        } catch (err) {
            console.error('Erreur chargement véhicules:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // Reset form
    const resetAddForm = () => {
        setAddForm({
            name: '',
            type: 'MOTO',
            licensePlate: '',
            brand: '',
            model: '',
            capacity: '',
        });
    };

    // Créer véhicule
    const handleCreateVehicle = async () => {
        if (!selectedBusiness?.id) return;

        if (!addForm.brand.trim() || !addForm.model.trim() || !addForm.licensePlate.trim()) {
            alert('Marque, modèle et plaque sont requis.');
            return;
        }

        setCreating(true);

        try {
            const newVehicle = await createVehicle(selectedBusiness.id, addForm);
            setVehicles([newVehicle, ...vehicles]);
            alert('✅ Véhicule ajouté !');
            setAddModalVisible(false);
            resetAddForm();
        } catch (err) {
            console.error('Erreur création:', err);
            alert('Impossible d\'ajouter le véhicule');
        } finally {
            setCreating(false);
        }
    };

    // Ouvrir modal édition
    const openEditModal = (vehicle: Vehicle) => {
        setCurrentVehicle(vehicle);
        setEditForm({
            name: vehicle.name,
            type: vehicle.type,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            capacity: vehicle.capacity,
            isActive: vehicle.isActive,
        });
        setEditModalVisible(true);
    };

    // Mettre à jour véhicule
    const handleUpdateVehicle = async () => {
        if (!currentVehicle) return;

        const updates: Partial<Vehicle> = {};
        if (editForm.name !== currentVehicle.name) updates.name = editForm.name;
        if (editForm.type !== currentVehicle.type) updates.type = editForm.type;
        if (editForm.licensePlate !== currentVehicle.licensePlate) updates.licensePlate = editForm.licensePlate;
        if (editForm.brand !== currentVehicle.brand) updates.brand = editForm.brand;
        if (editForm.model !== currentVehicle.model) updates.model = editForm.model;
        if (editForm.capacity !== currentVehicle.capacity) updates.capacity = editForm.capacity;
        if (editForm.isActive !== currentVehicle.isActive) updates.isActive = editForm.isActive;

        if (Object.keys(updates).length === 0) {
            setEditModalVisible(false);
            return;
        }

        setEditing(true);

        try {
            const updated = await updateVehicle(currentVehicle.id, updates);
            setVehicles(vehicles.map(v => v.id === currentVehicle.id ? updated : v));
            alert('✅ Véhicule mis à jour !');
            setEditModalVisible(false);
        } catch (err) {
            console.error('Erreur mise à jour:', err);
            alert('Impossible de modifier le véhicule');
        } finally {
            setEditing(false);
        }
    };

    // Supprimer véhicule
    const handleDelete = async (vehicle: Vehicle) => {
        if (!confirm(`Supprimer ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) ?`)) return;

        const previousVehicles = [...vehicles];
        setVehicles(vehicles.filter(v => v.id !== vehicle.id));

        try {
            await deleteVehicle(vehicle.id);
            alert('✅ Véhicule supprimé');
        } catch (err) {
            setVehicles(previousVehicles);
            alert('Impossible de supprimer le véhicule');
        }
    };

    // Helpers
    const getVehicleIcon = (type: VehicleType) => {
        const icons: Record<VehicleType, string> = {
            MOTO: '🏍️',
            VELO: '🚲',
            SCOOTER: '🛵',
            VOITURE: '🚗',
            CAMIONNETTE: '🚐',
            CAMION: '🚚',
            DRONE: '🚁',
            AUTRE: '🚙',
        };
        return icons[type] || '🚙';
    };

    const getVehicleLabel = (type: VehicleType) => {
        const labels: Record<VehicleType, string> = {
            MOTO: 'Moto',
            VELO: 'Vélo',
            SCOOTER: 'Scooter',
            VOITURE: 'Voiture',
            CAMIONNETTE: 'Camionnette',
            CAMION: 'Camion',
            DRONE: 'Drone',
            AUTRE: 'Autre',
        };
        return labels[type] || type;
    };

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="LIVREUR" title="Véhicules">
                <div className={styles.container}>
                    {/* Onglets - Comme mobile */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'VEHICLES' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('VEHICLES')}
                        >
                            Véhicules
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'MAP' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('MAP')}
                        >
                            Carte
                        </button>
                    </div>

                    {activeTab === 'VEHICLES' ? (
                        <div className={styles.vehiclesContent}>
                            {/* Bouton Ajouter */}
                            <button
                                className={styles.addButton}
                                onClick={() => setAddModalVisible(true)}
                            >
                                ➕ Ajouter un véhicule
                            </button>

                            {/* Liste des véhicules */}
                            {loading ? (
                                <div className={styles.loading}>
                                    <div className={styles.spinner} />
                                    <p>Chargement des véhicules...</p>
                                </div>
                            ) : error ? (
                                <div className={styles.emptyState}>
                                    <span>⚠️</span>
                                    <p>Erreur de connexion</p>
                                </div>
                            ) : vehicles.length > 0 ? (
                                <div className={styles.vehiclesList}>
                                    {vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className={styles.vehicleCard}>
                                            <div className={styles.cardHeader}>
                                                <div className={styles.iconContainer}>
                                                    <span>{getVehicleIcon(vehicle.type)}</span>
                                                </div>
                                                <div className={styles.infoContainer}>
                                                    <span className={styles.vehicleName}>
                                                        {vehicle.brand} {vehicle.model}
                                                    </span>
                                                    <span className={styles.vehiclePlate}>
                                                        {vehicle.licensePlate}
                                                    </span>
                                                    {vehicle.name && (
                                                        <span className={styles.vehicleCustomName}>
                                                            "{vehicle.name}"
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`${styles.statusChip} ${vehicle.isActive ? styles.active : styles.inactive}`}>
                                                    {vehicle.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>

                                            <div className={styles.metaRow}>
                                                <span className={styles.metaItem}>
                                                    🏷️ {getVehicleLabel(vehicle.type)}
                                                </span>
                                                {vehicle.capacity && (
                                                    <span className={styles.metaItem}>
                                                        📦 {vehicle.capacity}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.actionsRow}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => openEditModal(vehicle)}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(vehicle)}
                                                >
                                                    🗑️ Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>🚗</span>
                                    <h3>Aucun véhicule enregistré</h3>
                                    <p>Ajoute ton premier véhicule pour recevoir des courses adaptées.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Onglet Carte */
                        <div className={styles.mapContent}>
                            <div className={styles.mapPlaceholder}>
                                <span>🗺️</span>
                                <h3>Géolocalisation</h3>
                                <p>Cette fonctionnalité sera disponible prochainement pour suivre vos véhicules en temps réel.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Ajout */}
                {addModalVisible && (
                    <div className={styles.modalOverlay} onClick={() => !creating && setAddModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Ajouter un véhicule</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => !creating && setAddModalVisible(false)}
                                    disabled={creating}
                                >✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <label>Nom personnalisé (optionnel)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Ma super moto"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    disabled={creating}
                                />

                                <label>Type de véhicule *</label>
                                <select
                                    value={addForm.type}
                                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value as VehicleType })}
                                    disabled={creating}
                                >
                                    <option value="MOTO">Moto</option>
                                    <option value="SCOOTER">Scooter</option>
                                    <option value="VELO">Vélo</option>
                                    <option value="VOITURE">Voiture</option>
                                    <option value="CAMIONNETTE">Camionnette</option>
                                    <option value="CAMION">Camion</option>
                                    <option value="DRONE">Drone</option>
                                    <option value="AUTRE">Autre</option>
                                </select>

                                <label>Marque *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Honda"
                                    value={addForm.brand}
                                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                                    disabled={creating}
                                />

                                <label>Modèle *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: CBR 500"
                                    value={addForm.model}
                                    onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                                    disabled={creating}
                                />

                                <label>Plaque d'immatriculation *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: AB-123-CD"
                                    value={addForm.licensePlate}
                                    onChange={(e) => setAddForm({ ...addForm, licensePlate: e.target.value.toUpperCase() })}
                                    disabled={creating}
                                />

                                <label>Capacité (optionnel)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 30L, 2 colis"
                                    value={addForm.capacity}
                                    onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })}
                                    disabled={creating}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => !creating && setAddModalVisible(false)}
                                    disabled={creating}
                                >
                                    Annuler
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleCreateVehicle}
                                    disabled={creating}
                                >
                                    {creating ? 'Ajout...' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Modification */}
                {editModalVisible && (
                    <div className={styles.modalOverlay} onClick={() => !editing && setEditModalVisible(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Modifier le véhicule</h2>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => !editing && setEditModalVisible(false)}
                                    disabled={editing}
                                >✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <label>Nom personnalisé</label>
                                <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    disabled={editing}
                                />

                                <label>Type de véhicule</label>
                                <select
                                    value={editForm.type || 'MOTO'}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as VehicleType })}
                                    disabled={editing}
                                >
                                    <option value="MOTO">Moto</option>
                                    <option value="SCOOTER">Scooter</option>
                                    <option value="VELO">Vélo</option>
                                    <option value="VOITURE">Voiture</option>
                                    <option value="CAMIONNETTE">Camionnette</option>
                                    <option value="CAMION">Camion</option>
                                    <option value="DRONE">Drone</option>
                                    <option value="AUTRE">Autre</option>
                                </select>

                                <label>Marque</label>
                                <input
                                    type="text"
                                    value={editForm.brand || ''}
                                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                                    disabled={editing}
                                />

                                <label>Modèle</label>
                                <input
                                    type="text"
                                    value={editForm.model || ''}
                                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                                    disabled={editing}
                                />

                                <label>Plaque d'immatriculation</label>
                                <input
                                    type="text"
                                    value={editForm.licensePlate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, licensePlate: e.target.value.toUpperCase() })}
                                    disabled={editing}
                                />

                                <label>Capacité</label>
                                <input
                                    type="text"
                                    value={editForm.capacity || ''}
                                    onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                                    disabled={editing}
                                />

                                <div className={styles.switchRow}>
                                    <span>Statut</span>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isActive ?? true}
                                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                            disabled={editing}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                    <span>{editForm.isActive ? 'Actif' : 'Inactif'}</span>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => !editing && setEditModalVisible(false)}
                                    disabled={editing}
                                >
                                    Annuler
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={handleUpdateVehicle}
                                    disabled={editing}
                                >
                                    {editing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
