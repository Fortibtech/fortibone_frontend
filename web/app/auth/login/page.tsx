'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api/auth';
import { getMyBusinesses } from '@/lib/api/business';
import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';
import styles from './login.module.css';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect');

    const { setToken, refreshProfile, setEmail } = useUserStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginUser(formData.email, formData.password);

            if (result.success && result.token) {
                setToken(result.token);
                const profile = await refreshProfile();

                // Determine redirect path
                let targetPath = redirectTo;
                if (!targetPath || targetPath === '/') {
                    // Get user profile from store and redirect based on type
                    const userProfileType = useUserStore.getState().userProfile?.profileType;
                    if (userProfileType === 'PRO') {
                        // ALIGNEMENT MOBILE: Redirection directe vers l'espace professionnel
                        // Le fallback business sera géré dans le dashboard lui-même
                        try {
                            const businesses = await getMyBusinesses();
                            console.log('=== LOGIN PRO ===');
                            console.log('Businesses récupérés:', businesses?.length);

                            if (businesses && businesses.length > 0) {
                                // Stocker les businesses dans le store
                                useBusinessStore.getState().setBusinesses(businesses);

                                // Récupérer le dernier business sélectionné ou fallback
                                const currentSelected = useBusinessStore.getState().selectedBusiness;
                                if (!currentSelected) {
                                    // Fallback mobile: premier COMMERCANT ou all[0]
                                    const fallback = businesses.find(b => b.type === 'COMMERCANT') || businesses[0];
                                    useBusinessStore.getState().setSelectedBusiness(fallback);
                                    console.log('Fallback business:', fallback.name, fallback.type);
                                    targetPath = `/dashboard/${fallback.type.toLowerCase()}`;
                                } else {
                                    // Business déjà sélectionné (persisté)
                                    console.log('Business persisté:', currentSelected.name);
                                    targetPath = `/dashboard/${currentSelected.type.toLowerCase()}`;
                                }
                            } else {
                                // Aucun business: création
                                console.log('Aucun business -> /create-business');
                                targetPath = '/create-business';
                            }
                            console.log('=================');
                        } catch (err) {
                            console.error('Erreur récupération businesses:', err);
                            // Fallback: dashboard commercant par défaut
                            targetPath = '/dashboard/commercant';
                        }
                    } else {
                        targetPath = '/dashboard/particulier';
                    }
                }

                router.replace(targetPath);
            }
        } catch (err: any) {
            if (err.message === 'EMAIL_NOT_VERIFIED') {
                setEmail(formData.email);
                router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
            } else {
                setError(err.message || 'Erreur lors de la connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                    <h1 className={styles.title}>Connexion</h1>
                    <p className={styles.subtitle}>
                        Bienvenue ! Connectez-vous à votre compte.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className={styles.error}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <div className={styles.inputWrapper}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="votre@email.com"
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label htmlFor="password" className={styles.label}>Mot de passe</label>
                            <Link href="/auth/forgot-password" className={styles.forgotLink}>
                                Oublié ?
                            </Link>
                        </div>
                        <div className={styles.inputWrapper}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner} />
                                Connexion...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Pas encore de compte ?{' '}
                        <Link href="/auth/register" className={styles.link}>
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className={styles.spinner} />
                    </div>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
