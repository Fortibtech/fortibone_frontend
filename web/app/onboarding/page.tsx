'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './onboarding.module.css';

type ProfileType = 'particulier' | 'professionnel' | null;

export default function OnboardingPage() {
    const router = useRouter();
    const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if user already has a token (already logged in)
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Redirect to dashboard based on stored profile
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile === 'professionnel') {
                router.replace('/dashboard/commercant');
            } else {
                router.replace('/dashboard/particulier');
            }
        }
    }, [router]);

    const handleProfileSelect = (profile: ProfileType) => {
        setSelectedProfile(profile);
    };

    const handleContinue = async () => {
        if (!selectedProfile) return;

        setIsLoading(true);
        try {
            localStorage.setItem('userProfile', selectedProfile);
            router.push('/auth/register');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du profil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Logo Section */}
                <div className={styles.logoSection}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.logoIcon}>K</div>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                    <p className={styles.tagline}>
                        La plateforme qui connecte particuliers et professionnels
                    </p>
                </div>

                {/* Profile Selection */}
                <div className={styles.selectionSection}>
                    <h1 className={styles.title}>Quel est votre profil ?</h1>
                    <p className={styles.subtitle}>
                        Veuillez sélectionner votre profil pour commencer
                    </p>

                    <div className={styles.optionsGrid}>
                        {/* Particulier Option */}
                        <button
                            className={`${styles.optionCard} ${selectedProfile === 'particulier' ? styles.selected : ''}`}
                            onClick={() => handleProfileSelect('particulier')}
                        >
                            <div className={styles.optionIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className={styles.optionContent}>
                                <h3 className={styles.optionTitle}>Particulier</h3>
                                <p className={styles.optionDescription}>
                                    Acheteur ou consommateur final
                                </p>
                            </div>
                            <div className={styles.checkmark}>
                                {selectedProfile === 'particulier' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Professionnel Option */}
                        <button
                            className={`${styles.optionCard} ${selectedProfile === 'professionnel' ? styles.selected : ''}`}
                            onClick={() => handleProfileSelect('professionnel')}
                        >
                            <div className={styles.optionIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <div className={styles.optionContent}>
                                <h3 className={styles.optionTitle}>Professionnel</h3>
                                <p className={styles.optionDescription}>
                                    Commerçant, fournisseur ou restaurateur
                                </p>
                            </div>
                            <div className={styles.checkmark}>
                                {selectedProfile === 'professionnel' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Continue Button */}
                <div className={styles.actionSection}>
                    <button
                        className={`${styles.continueButton} ${selectedProfile ? styles.active : ''}`}
                        onClick={handleContinue}
                        disabled={!selectedProfile || isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner} />
                        ) : (
                            'Continuer'
                        )}
                    </button>

                    <p className={styles.loginLink}>
                        Vous avez déjà un compte ?{' '}
                        <a href="/auth/login">Connectez-vous</a>
                    </p>
                </div>
            </div>

            {/* Decorative Background */}
            <div className={styles.backgroundDecor}>
                <div className={styles.circle1} />
                <div className={styles.circle2} />
                <div className={styles.circle3} />
            </div>
        </div>
    );
}
