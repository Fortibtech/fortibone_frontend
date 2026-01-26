'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobs, createJob, updateJob, deleteJob, JobPosition } from '@/lib/api/careersApi';

export default function CareersManagementPage() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosition | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        department: 'commercial',
        location: '',
        type: 'CDI',
        description: '',
        requirements: '',
        isActive: true
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await updateJob(editingJob.id, formData);
            } else {
                await createJob(formData);
            }
            setIsModalOpen(false);
            setEditingJob(null);
            resetForm();
            fetchJobs();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
        try {
            await deleteJob(id);
            fetchJobs();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const openEdit = (job: JobPosition) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description,
            // Handle requirements: if it comes as array (legacy?) join it, if string keep it
            requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
            isActive: job.isActive
        });
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingJob(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            department: 'commercial',
            location: '',
            type: 'CDI',
            description: '',
            requirements: '',
            isActive: true
        });
    };

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Gestion des Offres</h1>
                    <button
                        onClick={openCreate}
                        style={{
                            background: '#00c9a7',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        + Nouvelle Offre
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {jobs.map(job => (
                            <div key={job.id} style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{job.title}</h3>
                                        <span style={{
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                            background: job.isActive ? '#dcfce7' : '#f1f5f9',
                                            color: job.isActive ? '#166534' : '#64748b',
                                            borderRadius: '20px',
                                            fontWeight: '600'
                                        }}>
                                            {job.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                        {job.department} • {job.type} • {job.location}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/dashboard/careers/applications/${job.id}`} style={{
                                        textDecoration: 'none',
                                        padding: '8px 16px',
                                        background: '#0f172a',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        👥 Candidats
                                    </Link>
                                    <button
                                        onClick={() => openEdit(job)}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #cbd5e1',
                                            background: 'white',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #fee2e2',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Aucune offre pour le moment.</div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
                            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                                {editingJob ? 'Modifier l\'offre' : 'Nouvelle offre'}
                            </h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Titre du poste</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Département</label>
                                        <select
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="commercial">Commercial</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="tech">Tech & Produit</option>
                                            <option value="operations">Opérations</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Contrat</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="CDI">CDI</option>
                                            <option value="CDD">CDD</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Stage">Stage</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Localisation</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="ex: Moroni ou Remote"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Pré-requis (1 par ligne)</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.requirements}
                                        onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                        placeholder="Expérience B2B&#10;Anglais courant..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Offre active (visible sur le site)
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
