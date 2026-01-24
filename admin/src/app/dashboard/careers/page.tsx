'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, Briefcase, MapPin, Clock, Users } from 'lucide-react';
import styles from './careers.module.css';

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string;
    isActive: boolean;
    createdAt: string;
    _count?: { applications: number };
}

const CAREERS_API_URL = process.env.NEXT_PUBLIC_CAREERS_API_URL || 'http://localhost:3002/api';

export default function CareersManagementPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'CDI',
        description: '',
        requirements: '',
        isActive: true,
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${CAREERS_API_URL}/jobs`);
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingJob
                ? `${CAREERS_API_URL}/jobs/${editingJob.id}`
                : `${CAREERS_API_URL}/jobs`;

            const res = await fetch(url, {
                method: editingJob ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchJobs();
                closeModal();
            }
        } catch (error) {
            console.error('Failed to save job:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) return;

        try {
            await fetch(`${CAREERS_API_URL}/jobs/${id}`, { method: 'DELETE' });
            fetchJobs();
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const openCreateModal = () => {
        setEditingJob(null);
        setFormData({
            title: '',
            department: '',
            location: '',
            type: 'CDI',
            description: '',
            requirements: '',
            isActive: true,
        });
        setShowModal(true);
    };

    const openEditModal = (job: Job) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description,
            requirements: job.requirements,
            isActive: job.isActive,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingJob(null);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestion des Postes</h1>
                    <p className={styles.subtitle}>Gérez les offres d'emploi publiées sur le site Corporate</p>
                </div>
                <button className={styles.addButton} onClick={openCreateModal}>
                    <Plus size={20} />
                    Nouveau Poste
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <Briefcase size={24} className={styles.statIcon} />
                    <div>
                        <p className={styles.statValue}>{jobs.length}</p>
                        <p className={styles.statLabel}>Postes Total</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <Eye size={24} className={styles.statIcon} />
                    <div>
                        <p className={styles.statValue}>{jobs.filter(j => j.isActive).length}</p>
                        <p className={styles.statLabel}>Postes Actifs</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <Users size={24} className={styles.statIcon} />
                    <div>
                        <p className={styles.statValue}>-</p>
                        <p className={styles.statLabel}>Candidatures</p>
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div className={styles.loading}>Chargement...</div>
                ) : jobs.length === 0 ? (
                    <div className={styles.empty}>
                        <Briefcase size={48} />
                        <p>Aucun poste pour le moment</p>
                        <button onClick={openCreateModal}>Créer le premier poste</button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Poste</th>
                                <th>Département</th>
                                <th>Localisation</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id}>
                                    <td className={styles.jobTitle}>{job.title}</td>
                                    <td>{job.department}</td>
                                    <td>
                                        <span className={styles.location}>
                                            <MapPin size={14} />
                                            {job.location}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.typeBadge}>{job.type}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${job.isActive ? styles.active : styles.inactive}`}>
                                            {job.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button onClick={() => openEditModal(job)} title="Modifier">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(job.id)} title="Supprimer" className={styles.deleteBtn}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>{editingJob ? 'Modifier le poste' : 'Nouveau poste'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Titre du poste *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Département *</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Localisation *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Type de contrat *</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="Stage">Stage</option>
                                        <option value="Alternance">Alternance</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Prérequis *</label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    Publier immédiatement
                                </label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                                    Annuler
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingJob ? 'Enregistrer' : 'Créer le poste'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
