'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../about/about.module.css';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';
import { getJobs, applyToJob, JobPosition, login, register, logout } from '@/lib/api/careersApi';

// Removed hardcoded jobPositions and interface as they are now imported/fetched

export default function CareersPage() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authData, setAuthData] = useState({ email: '', password: '' });
    const [pendingJob, setPendingJob] = useState<JobPosition | null>(null); // Job user wanted to apply to

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cvLink: '',
        message: ''
    });

    // New state for unified design
    const [filter, setFilter] = useState<'all' | 'commercial' | 'marketing' | 'tech'>('all');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        fetchJobs();
        const token = localStorage.getItem('candidate_token');
        if (token) {
            setIsLoggedIn(true);
            setFormData(prev => ({ ...prev, email: 'user@example.com' })); // We could decode token to get email if needed
        }
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await getJobs();
            // Data normalization: Ensure requirements is an array
            const normalizedJobs = data.map(job => ({
                ...job,
                department: normalizeDepartment(job.department),
                requirements: Array.isArray(job.requirements)
                    ? job.requirements
                    : (job.requirements || '').split('\n').filter(r => r.trim().length > 0)
            }));
            const activeJobs = normalizedJobs.filter(j => j.isActive);
            // @ts-ignore
            setJobs(activeJobs);
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeDepartment = (dept: string): 'commercial' | 'marketing' | 'tech' => {
        const d = dept.toLowerCase();
        if (d.includes('comm') || d.includes('vente') || d.includes('bus')) return 'commercial';
        if (d.includes('mark') || d.includes('socia') || d.includes('cont')) return 'marketing';
        if (d.includes('tech') || d.includes('dev') || d.includes('web')) return 'tech';
        return 'commercial'; // Default fallback
    };

    const filteredJobs = filter === 'all'
        ? jobs
        : jobs.filter(job => job.department === filter);

    const handleApply = (job: JobPosition) => {
        if (!isLoggedIn) {
            setPendingJob(job);
            setShowAuthModal(true);
        } else {
            setSelectedJob(job);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (authMode === 'login') {
                await login(authData.email, authData.password);
                setIsLoggedIn(true);
                setShowAuthModal(false);
                window.dispatchEvent(new Event('auth-change'));
                if (pendingJob) {
                    setSelectedJob(pendingJob);
                    setPendingJob(null);
                }
            } else {
                await register(authData.email, authData.password);
                alert('Compte créé avec succès ! Veuillez vous connecter.');
                setAuthMode('login');
                // Do not close modal, and do not set isLoggedIn, let them login
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Erreur: Vérifiez vos identifiants ou réessayez.';
            alert(message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedJob) {
                const submissionData = new FormData();
                submissionData.append('name', formData.name);
                // Ensure we use the logged-in user's email if available, or stored one.
                const userEmail = localStorage.getItem('candidate_email') || formData.email;
                submissionData.append('email', userEmail);
                submissionData.append('phone', formData.phone);
                submissionData.append('message', formData.message);
                if (formData.cvLink) submissionData.append('cvLink', formData.cvLink);
                // @ts-ignore
                if (formData.file) submissionData.append('cv', formData.file);

                await applyToJob(selectedJob.id, submissionData);
                setIsSubmitted(true);
                // @ts-ignore
                setFormData({ name: '', email: userEmail, phone: '', cvLink: '', message: '', file: null });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi.';
            alert(msg);
        }
    };

    // Listen for auth changes (logout from header)
    useEffect(() => {
        const handleAuthChange = () => {
            const token = localStorage.getItem('candidate_token');
            setIsLoggedIn(!!token);
        };
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PublicHeader variant="solid" />

            <div style={{ paddingTop: '80px', flex: 1 }}>
                {/* Hero Section */}
                <div className={styles.hero} style={{ minHeight: '40vh', paddingBottom: '60px' }}>
                    <h1 className={styles.heroTitle}>
                        Rejoignez <span className={styles.accent}>l'aventure</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        Construisons ensemble le futur du commerce aux Comores.
                        Nous cherchons des talents passionnés par l'impact et l'innovation.
                    </p>
                </div>

                <div className={styles.aboutContent} style={{ marginTop: '-40px' }}>
                    {/* Filters */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px',
                        marginBottom: '40px',
                        flexWrap: 'wrap',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxWidth: '800px',
                        margin: '0 auto 40px'
                    }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: 'none',
                                background: filter === 'all' ? '#0f172a' : '#f1f5f9',
                                color: filter === 'all' ? 'white' : '#64748b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setFilter('commercial')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: 'none',
                                background: filter === 'commercial' ? '#00c9a7' : '#f1f5f9',
                                color: filter === 'commercial' ? 'white' : '#64748b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Commercial
                        </button>
                        <button
                            onClick={() => setFilter('marketing')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: 'none',
                                background: filter === 'marketing' ? '#8b5cf6' : '#f1f5f9',
                                color: filter === 'marketing' ? 'white' : '#64748b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Marketing
                        </button>
                        <button
                            onClick={() => setFilter('tech')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: 'none',
                                background: filter === 'tech' ? '#3b82f6' : '#f1f5f9',
                                color: filter === 'tech' ? 'white' : '#64748b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Tech & Produit
                        </button>
                    </div>

                    {/* Jobs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                        {filteredJobs.map((job) => (
                            <div key={job.id} style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                border: '1px solid #e2e8f0',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    background: job.department === 'commercial' ? '#00c9a7' : job.department === 'marketing' ? '#8b5cf6' : '#3b82f6'
                                }} />

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        color: '#64748b',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                        {job.location.toLowerCase().includes('remote') && (
                                            <>
                                                <span>•</span>
                                                <span style={{ color: '#00c9a7' }}>Remote possible</span>
                                            </>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>{job.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                                        <span>📍</span> {job.location}
                                    </div>
                                </div>

                                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                                    {job.description}
                                </p>

                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#0f172a' }}>Pré-requis :</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {Array.isArray(job.requirements) && job.requirements.slice(0, 3).map((req, idx) => (
                                            <li key={idx}>{req}</li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleApply(job)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#0f172a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
                                >
                                    Postuler maintenant <span>→</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredJobs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                            <p style={{ fontSize: '18px', marginBottom: '10px' }}>Aucun poste disponible dans cette catégorie pour le moment.</p>
                            <button
                                onClick={() => setFilter('all')}
                                style={{ color: '#00c9a7', background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Voir toutes les offres
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {selectedJob && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={() => setSelectedJob(null)}>
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '40px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedJob(null)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: '#f1f5f9',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                color: '#64748b'
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ marginBottom: '30px' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                borderRadius: '50px',
                                fontSize: '13px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                textTransform: 'uppercase'
                            }}>
                                {selectedJob.department}
                            </span>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                                {selectedJob.title}
                            </h2>
                            <p style={{ color: '#64748b' }}>{selectedJob.location} • {selectedJob.type}</p>
                        </div>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Nom complet</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Votre nom"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    />
                                </div>

                                {/* Email removed as it's taken from logged in user */}

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Téléphone</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="06..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>CV (PDF ou Word)</label>
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files ? e.target.files[0] : null;
                                            // @ts-ignore
                                            setFormData({ ...formData, file: file });
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Lien LinkedIn ou Portfolio (Optionnel)</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.cvLink}
                                        onChange={(e) => setFormData({ ...formData, cvLink: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Pourquoi ce poste ?</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Dites-nous en quelques mots pourquoi vous êtes la bonne personne..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', resize: 'vertical' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '10px',
                                        padding: '16px',
                                        background: '#00c9a7',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(0, 201, 167, 0.2)'
                                    }}
                                >
                                    Envoyer ma candidature
                                </button>
                                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                                    En postulant, vous acceptez que nous conservions vos données pour la durée du recrutement.
                                </p>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Candidature envoyée !</h3>
                                <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>
                                    Merci de votre intérêt pour KomoraLink. Notre équipe va étudier votre profil et reviendra vers vous sous 48h.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedJob(null);
                                        setIsSubmitted(false);
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#f1f5f9',
                                        color: '#0f172a',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            {showAuthModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowAuthModal(false)}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>{authMode === 'login' ? 'Connexion' : 'Inscription'}</h2>
                        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={authData.email}
                                onChange={e => setAuthData({ ...authData, email: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                required
                                value={authData.password}
                                onChange={e => setAuthData({ ...authData, password: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            <button type="submit" style={{ padding: '12px', background: '#00c9a7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
                            </button>
                        </form>
                        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                            {authMode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                            <button
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                style={{ background: 'none', border: 'none', color: '#00c9a7', fontWeight: '600', cursor: 'pointer', marginLeft: '5px' }}
                            >
                                {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
                            </button>
                        </p>
                    </div>
                </div>
            )}

            <PublicFooter />
        </div>
    );
}
