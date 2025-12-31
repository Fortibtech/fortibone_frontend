'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail, resendOtp } from '@/lib/api/auth';
import { useUserStore } from '@/stores/userStore';
import styles from './verify.module.css';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromStore = useUserStore(state => state.email);
    const setToken = useUserStore(state => state.setToken);
    const setUserProfile = useUserStore(state => state.setUserProfile);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(600); // 10 minutes
    const [resendLoading, setResendLoading] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Get email from URL or store
    const email = searchParams.get('email') || emailFromStore || '';

    // Timer countdown
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            router.replace('/auth/register');
        }
    }, [email, router]);

    // Handle input change
    const handleChange = (index: number, value: string) => {
        // Only allow single digits
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split('').forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
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

    // Check if OTP is complete
    const isComplete = otp.every(digit => digit !== '');

    // Handle verification
    const handleVerify = async () => {
        if (!isComplete) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const code = otp.join('');
            const data = await verifyEmail(email, code);

            // Store token
            if (data.access_token) {
                setToken(data.access_token);
            }

            // Store user profile
            if (data.userProfile) {
                setUserProfile(data.userProfile);
            }

            setSuccess('Votre compte est vérifié !');

            // Redirect based on profile type
            // Check localStorage first (set during onboarding), then API response
            const savedProfile = localStorage.getItem('userProfile');
            const apiProfileType = data.userProfile?.profileType || data.profileType;

            setTimeout(() => {
                localStorage.removeItem('userProfile'); // Clean up
                // PRO users (from localStorage 'professionnel' or API 'PRO') go to create-business
                const isPro = savedProfile === 'professionnel' || apiProfileType === 'PRO';
                if (isPro) {
                    router.replace('/create-business');
                } else {
                    router.replace('/dashboard/particulier');
                }
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Code OTP invalide ou expiré');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Handle resend
    const handleResend = async () => {
        if (timer > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await resendOtp(email, 'EMAIL_VERIFICATION');
            setSuccess('Un nouveau code a été envoyé');
            setTimer(600);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Impossible de renvoyer le code');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Back Button */}
                <button
                    className={styles.backButton}
                    onClick={() => router.back()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Retour
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Vérification du code</h1>
                    <p className={styles.description}>
                        Veuillez saisir le code de vérification à 6 chiffres envoyé à{' '}
                        <strong>{email}</strong>
                    </p>
                </div>

                {/* Timer */}
                <div className={styles.timer}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className={timer < 60 ? styles.timerWarning : ''}>
                        {formatTime(timer)}
                    </span>
                </div>

                {/* OTP Input */}
                <div className={styles.otpContainer} onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                {/* Error / Success Messages */}
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

                {success && (
                    <div className={styles.success}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        {success}
                    </div>
                )}

                {/* Resend Link */}
                <p className={styles.resendText}>
                    Vous n'avez pas reçu le code ?{' '}
                    <button
                        type="button"
                        className={`${styles.resendButton} ${timer > 0 ? styles.disabled : ''}`}
                        onClick={handleResend}
                        disabled={timer > 0 || resendLoading}
                    >
                        {resendLoading ? 'Envoi...' : 'Renvoyer'}
                    </button>
                </p>

                {/* Verify Button */}
                <button
                    className={`${styles.verifyButton} ${isComplete ? styles.active : ''}`}
                    onClick={handleVerify}
                    disabled={!isComplete || loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner} />
                            Vérification...
                        </>
                    ) : (
                        'Valider'
                    )}
                </button>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Chargement...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
