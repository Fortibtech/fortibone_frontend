'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword, resendOtp } from '@/lib/api/auth';
import { useUserStore } from '@/stores/userStore';
import { validatePassword } from '@/lib/validation';
import styles from '../login/login.module.css';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromStore = useUserStore(state => state.email);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(600);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Get email from URL or store
    useEffect(() => {
        const emailParam = searchParams.get('email');
        setEmail(emailParam || emailFromStore || '');
    }, [searchParams, emailFromStore]);

    // Timer countdown
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);

        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Format timer
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Handle resend
    const handleResend = async () => {
        if (timer > 0 || !email) return;

        setResendLoading(true);
        try {
            await resendOtp(email, 'PASSWORD_RESET');
            setTimer(600);
            setOtp(['', '', '', '', '', '']);
        } catch (err: any) {
            setError(err.message || 'Impossible de renvoyer le code');
        } finally {
            setResendLoading(false);
        }
    };

    // Validate form
    const passwordValidation = validatePassword(newPassword);
    const isOtpComplete = otp.every(d => d !== '');
    const passwordsMatch = newPassword === confirmPassword;
    const isFormValid = isOtpComplete && passwordValidation.valid && passwordsMatch && email;

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError('');

        try {
            const code = otp.join('');
            await resetPassword({
                email,
                otp: code,
                newPassword
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la réinitialisation');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Email non trouvé.</p>
                        <Link href="/auth/forgot-password" className={styles.link}>
                            Retourner à la demande de réinitialisation
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Back Link */}
                <Link href="/auth/forgot-password" style={{
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
                    Retour
                </Link>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                    <h1 className={styles.title}>Nouveau mot de passe</h1>
                    <p className={styles.subtitle}>
                        Entrez le code reçu par email et créez votre nouveau mot de passe.
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
                        Mot de passe modifié avec succès ! Redirection...
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

                {!success && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Timer */}
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: timer < 60 ? '#ef4444' : '#059669'
                            }}>
                                {formatTime(timer)}
                            </span>
                        </div>

                        {/* OTP Input */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Code de vérification</label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        style={{
                                            width: '48px',
                                            height: '56px',
                                            textAlign: 'center',
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            border: digit ? '2px solid #059669' : '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            background: digit ? '#ecfdf5' : '#f9fafb',
                                            outline: 'none'
                                        }}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                                Code non reçu ?{' '}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={timer > 0}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: timer > 0 ? '#9ca3af' : '#059669',
                                        fontWeight: '600',
                                        cursor: timer > 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {resendLoading ? 'Envoi...' : 'Renvoyer'}
                                </button>
                            </p>
                        </div>

                        {/* New Password */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nouveau mot de passe</label>
                            <div className={styles.inputWrapper}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <circle cx="12" cy="16" r="1" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="8 caractères minimum"
                                    required
                                    className={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePassword}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {newPassword && !passwordValidation.valid && (
                                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                                    {passwordValidation.errors.join(' • ')}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Confirmer le mot de passe</label>
                            <div className={styles.inputWrapper}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <circle cx="12" cy="16" r="1" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmez votre mot de passe"
                                    required
                                    className={styles.input}
                                />
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                                    Les mots de passe ne correspondent pas
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !isFormValid}
                            style={{
                                background: isFormValid
                                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                    : '#e5e7eb',
                                color: isFormValid ? 'white' : '#9ca3af',
                                cursor: isFormValid ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} />
                                    Réinitialisation...
                                </>
                            ) : (
                                'Réinitialiser le mot de passe'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <ResetPasswordContent />
        </Suspense>
    );
}
