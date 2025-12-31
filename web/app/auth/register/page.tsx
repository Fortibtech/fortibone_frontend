'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/api/auth';
import { useUserStore } from '@/stores/userStore';
import CountrySelector from '@/components/CountrySelector';
import {
    Country,
    getPhoneCode,
    validatePhoneNumber,
    validatePassword,
    validateEmail,
    formatDateForAPI
} from '@/lib/validation';
import styles from './register.module.css';

interface FormData {
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE' | '';
    country: string;
    city: string;
    dateOfBirth: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const setEmail = useUserStore(state => state.setEmail);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        gender: '',
        country: '',
        city: '',
        dateOfBirth: '',
        email: '',
        password: '',
        phoneNumber: '',
    });

    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [userProfile, setUserProfile] = useState<'particulier' | 'professionnel' | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);

    // Check for userProfile on mount
    useEffect(() => {
        const checkProfile = () => {
            const saved = localStorage.getItem('userProfile');
            if (saved === 'particulier' || saved === 'professionnel') {
                setUserProfile(saved);
            } else {
                router.replace('/onboarding');
            }
            setIsLoadingProfile(false);
        };
        checkProfile();
    }, [router]);

    // Handle field updates
    const updateField = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'phoneNumber') {
            setPhoneError('');
        }
    }, []);

    // Handle country selection
    const handleCountrySelect = useCallback((country: Country) => {
        setSelectedCountry(country);
        updateField('country', country.name.common);
        const code = getPhoneCode(country);
        setFormData(prev => ({
            ...prev,
            country: country.name.common,
            phoneNumber: code + ' '
        }));
        setPhoneError('');
    }, [updateField]);

    // Handle phone number input
    const handlePhoneChange = (value: string) => {
        if (!selectedCountry) {
            updateField('phoneNumber', value);
            return;
        }

        const code = getPhoneCode(selectedCountry);
        // Keep the country code prefix
        if (!value.startsWith(code)) {
            value = code + ' ' + value.replace(code, '').trim();
        }
        updateField('phoneNumber', value);
    };

    // Validate form
    const passwordValidation = validatePassword(formData.password);

    const isFormValid = useCallback((): boolean => {
        // Check all required fields
        if (!formData.firstName || !formData.lastName || !formData.gender ||
            !formData.country || !formData.city || !formData.dateOfBirth ||
            !formData.email || !formData.password || !formData.phoneNumber) {
            return false;
        }

        // Validate email
        if (!validateEmail(formData.email)) {
            return false;
        }

        // Validate password
        if (!passwordValidation.valid) {
            return false;
        }

        // Validate phone
        const phoneValidation = validatePhoneNumber(formData.phoneNumber, selectedCountry);
        if (!phoneValidation.valid) {
            return false;
        }

        return true;
    }, [formData, selectedCountry, passwordValidation.valid]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate phone
        const phoneValidation = validatePhoneNumber(formData.phoneNumber, selectedCountry);
        if (!phoneValidation.valid) {
            setPhoneError(phoneValidation.error || 'Numéro invalide');
            return;
        }

        if (!isFormValid()) {
            setError('Veuillez remplir tous les champs correctement.');
            return;
        }

        setLoading(true);

        try {
            const profileType = userProfile === 'professionnel' ? 'PRO' : 'PARTICULIER';

            await registerUser({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                gender: formData.gender as 'MALE' | 'FEMALE',
                profileType,
                country: formData.country.trim(),
                city: formData.city.trim(),
                dateOfBirth: formData.dateOfBirth,
                email: formData.email.trim(),
                password: formData.password,
                phoneNumber: formData.phoneNumber.replace(/\s+/g, ''),
            });

            // Store email for OTP verification
            setEmail(formData.email.trim());

            // Redirect to OTP verification
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Préparation...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                    <h1 className={styles.title}>
                        Création de compte{' '}
                        <span className={styles.profileBadge}>
                            {userProfile === 'professionnel' ? 'Professionnel' : 'Particulier'}
                        </span>
                    </h1>
                    <p className={styles.subtitle}>
                        Remplissez vos informations pour créer votre compte
                    </p>
                </div>

                {/* Login Link */}
                <div className={styles.loginPrompt}>
                    Vous avez déjà un compte ?{' '}
                    <Link href="/auth/login" className={styles.loginLink}>
                        Connectez-vous
                    </Link>
                </div>

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
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Name Fields */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Prénom</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Votre prénom"
                                value={formData.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nom</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Votre nom"
                                value={formData.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Gender Selection */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Sexe</label>
                        <div className={styles.genderSelector}>
                            <button
                                type="button"
                                className={`${styles.genderOption} ${formData.gender === 'MALE' ? styles.selected : ''}`}
                                onClick={() => updateField('gender', 'MALE')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="14" r="5" />
                                    <line x1="19" y1="5" x2="13" y2="11" />
                                    <polyline points="16 5 19 5 19 8" />
                                </svg>
                                Masculin
                            </button>
                            <button
                                type="button"
                                className={`${styles.genderOption} ${formData.gender === 'FEMALE' ? styles.selected : ''}`}
                                onClick={() => updateField('gender', 'FEMALE')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="8" r="5" />
                                    <line x1="12" y1="13" x2="12" y2="21" />
                                    <line x1="9" y1="18" x2="15" y2="18" />
                                </svg>
                                Féminin
                            </button>
                        </div>
                    </div>

                    {/* Country Selection */}
                    <CountrySelector
                        label="Pays"
                        selectedCountry={selectedCountry}
                        onSelect={handleCountrySelect}
                        placeholder="Sélectionnez votre pays"
                    />

                    {/* City */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Ville</label>
                        <div className={styles.inputWithIcon}>
                            {selectedCountry && (
                                <img
                                    src={selectedCountry.flags.png}
                                    alt=""
                                    className={styles.inputFlag}
                                />
                            )}
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Votre ville (ex: Douala)"
                                value={formData.city}
                                onChange={(e) => updateField('city', e.target.value)}
                                style={{ paddingLeft: selectedCountry ? '48px' : undefined }}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Téléphone</label>
                        <div className={styles.phoneInputWrapper}>
                            {selectedCountry && (
                                <span className={styles.phoneCode}>
                                    {getPhoneCode(selectedCountry)}
                                </span>
                            )}
                            <input
                                type="tel"
                                className={`${styles.input} ${styles.phoneInput} ${phoneError ? styles.inputError : ''}`}
                                placeholder="6 12 34 56 78"
                                value={
                                    selectedCountry
                                        ? formData.phoneNumber.replace(getPhoneCode(selectedCountry), '').trim()
                                        : formData.phoneNumber
                                }
                                onChange={(e) => {
                                    const code = selectedCountry ? getPhoneCode(selectedCountry) : '';
                                    const cleanNumber = e.target.value.replace(/\s+/g, ' ').trim();
                                    updateField('phoneNumber', code + (cleanNumber ? ' ' + cleanNumber : ''));
                                }}
                                required
                            />
                        </div>
                        {phoneError && <p className={styles.fieldError}>{phoneError}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Date de naissance</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.dateOfBirth}
                            onChange={(e) => updateField('dateOfBirth', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Mot de passe</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                placeholder="8 caractères minimum"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        {/* Password strength indicator */}
                        {formData.password && (
                            <div className={styles.passwordInfo}>
                                <div className={`${styles.strengthBar} ${styles[passwordValidation.strength]}`}>
                                    <div className={styles.strengthFill} />
                                </div>
                                <p className={`${styles.passwordHint} ${passwordValidation.valid ? styles.valid : styles.invalid}`}>
                                    {passwordValidation.valid
                                        ? '✓ Mot de passe sécurisé'
                                        : passwordValidation.errors.join(' • ')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`${styles.submitBtn} ${isFormValid() ? styles.active : ''}`}
                        disabled={loading || !isFormValid()}
                    >
                        {loading ? (
                            <>
                                <span className={styles.btnSpinner} />
                                Création en cours...
                            </>
                        ) : (
                            'Créer mon compte'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.terms}>
                        En créant un compte, vous acceptez nos{' '}
                        <a href="/terms">Conditions d'utilisation</a>
                        {' '}et notre{' '}
                        <a href="/privacy">Politique de confidentialité</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
