'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';
import { useUserStore } from '@/stores/userStore';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const setEmail = useUserStore(state => state.setEmail);

    const [email, setEmailInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await forgotPassword(email);

            if (result.success) {
                setEmail(email);
                setSuccess(true);
                // Redirect to reset password page after 2 seconds
                setTimeout(() => {
                    router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setError(result.error?.message || 'Erreur lors de l\'envoi.');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Back Link */}
                <Link href="/auth/login" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#6b7280',
                    fontSize: '14px',
                    textDecoration: 'none',
                    marginBottom: '24px'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Retour à la connexion
                </Link>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                    <h1 className={styles.title}>Mot de passe oublié ?</h1>
                    <p className={styles.subtitle}>
                        Entrez votre adresse email et nous vous enverrons un code pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        borderRadius: '12px',
                        fontSize: '14px',
                        marginBottom: '24px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Un code de vérification a été envoyé à votre adresse email.
                    </div>
                )}

                {/* Error Message */}
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
                {!success && (
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
                                    value={email}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="votre@email.com"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !email}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} />
                                    Envoi...
                                </>
                            ) : (
                                'Envoyer le code'
                            )}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <p>
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link href="/auth/login" className={styles.link}>
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
