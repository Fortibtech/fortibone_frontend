'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import {
    getTables,
    createRestaurantTable,
    updateRestaurantTable,
    deleteRestaurantTable,
    Table
} from '@/lib/api/tables';
import styles from './tables.module.css';

export default function TablesPage() {
    const { selectedBusiness } = useBusinessStore();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [tableName, setTableName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // Charger les tables
    const loadTables = useCallback(async () => {
        if (!selectedBusiness?.id) return;
        try {
            setLoading(true);
            const data = await getTables(selectedBusiness.id);
            setTables(data || []);
        } catch (error: any) {
            console.error('Erreur chargement tables:', error);
            toast.error('Erreur chargement des tables', {
                description: error.message,
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadTables();
    }, [loadTables]);

    const onRefresh = () => {
        setRefreshing(true);
        loadTables();
    };

    const openCreateModal = () => {
        setEditingTable(null);
        setTableName('');
        setCapacity('');
        setIsAvailable(true);
        setShowModal(true);
    };

    const openEditModal = (table: Table) => {
        setEditingTable(table);
        setTableName(table.name);
        setCapacity(String(table.capacity));
        setIsAvailable(table.isAvailable);
        setShowModal(true);
    };

    const saveTable = async () => {
        if (!tableName.trim()) {
            toast.info('Le nom de la table est obligatoire');
            return;
        }

        const capacityNum = parseInt(capacity, 10);
        if (isNaN(capacityNum) || capacityNum <= 0) {
            toast.info('Le nombre de places doit être un nombre positif');
            return;
        }

        if (!selectedBusiness) return;
        setSaving(true);

        try {
            if (editingTable) {
                // Mise à jour
                const payload: any = {};
                if (tableName !== editingTable.name) payload.name = tableName.trim();
                if (capacityNum !== editingTable.capacity) payload.capacity = capacityNum;
                if (isAvailable !== editingTable.isAvailable) payload.isAvailable = isAvailable;

                if (Object.keys(payload).length === 0) {
                    setShowModal(false);
                    return;
                }

                const updated = await updateRestaurantTable(selectedBusiness.id, editingTable.id, payload);
                setTables(tables.map(t => t.id === updated.id ? updated : t));
                toast.success('Table modifiée !');
            } else {
                // Création
                const newTable = await createRestaurantTable(selectedBusiness.id, {
                    name: tableName.trim(),
                    capacity: capacityNum,
                    isAvailable,
                });
                setTables([...tables, newTable]);
                toast.success(`Table "${newTable.name}" créée !`);
            }

            setShowModal(false);
        } catch (error: any) {
            console.error('Erreur sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setSaving(false);
        }
    };

    const removeTable = async (tableId: string) => {
        if (!selectedBusiness || !confirm('Supprimer cette table ?')) return;

        setDeletingId(tableId);
        const previousTables = [...tables];
        setTables(tables.filter(t => t.id !== tableId));

        try {
            await deleteRestaurantTable(selectedBusiness.id, tableId);
            toast.success('Table supprimée');
        } catch (error: any) {
            setTables(previousTables);
            toast.error('Impossible de supprimer la table', {
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (!selectedBusiness) {
        return (
            <ProtectedRoute requiredProfileType="PRO">
                <DashboardLayout businessType="RESTAURATEUR" title="Tables">
                    <div className={styles.emptyState}>
                        <p>Aucun restaurant sélectionné</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Tables">
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>🪑 Mes Tables</h1>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.refreshBtn}
                                onClick={onRefresh}
                                disabled={refreshing}
                            >
                                {refreshing ? '⏳' : '🔄'}
                            </button>
                            <button className={styles.addButton} onClick={openCreateModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Liste des tables */}
                    <div className={styles.tablesList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Chargement des tables...</p>
                            </div>
                        ) : tables.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🪑</span>
                                <p className={styles.emptyTitle}>Aucune table</p>
                                <p className={styles.emptySubtitle}>Ajoutez votre première table</p>
                                <button className={styles.emptyButton} onClick={openCreateModal}>
                                    + Ajouter une table
                                </button>
                            </div>
                        ) : (
                            <div className={styles.tablesGrid}>
                                {tables.map(table => (
                                    <div key={table.id} className={styles.tableCard}>
                                        <div className={styles.cardHeader}>
                                            <div>
                                                <span className={styles.tableNumber}>Table {table.name}</span>
                                                <span className={styles.seats}>{table.capacity} places</span>
                                            </div>
                                            <span className={`${styles.badge} ${table.isAvailable ? styles.available : styles.unavailable}`}>
                                                {table.isAvailable ? 'Disponible' : 'Indisponible'}
                                            </span>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => openEditModal(table)}
                                                className={styles.editBtn}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                onClick={() => removeTable(table.id)}
                                                className={styles.deleteBtn}
                                                disabled={deletingId === table.id}
                                            >
                                                {deletingId === table.id ? '...' : '🗑️ Supprimer'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{editingTable ? 'Modifier' : 'Nouvelle'} table</h2>
                                <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
                            </div>
                            <div className={styles.form}>
                                <label>Nom / Numéro</label>
                                <input
                                    type="text"
                                    value={tableName}
                                    onChange={(e) => setTableName(e.target.value)}
                                    placeholder="ex: 7 ou Terrasse 1"
                                />

                                <label>Nombre de places</label>
                                <input
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="4"
                                />

                                <div className={styles.switchRow}>
                                    <label>Disponible</label>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Annuler
                                </button>
                                <button onClick={saveTable} disabled={saving} className={styles.saveBtn}>
                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
