'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './create-business.module.css';

type BusinessType = 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR';

const businessTypes = [
    {
        id: 'COMMERCANT' as BusinessType,
        title: 'Je suis COMMERÇANT',
        description: 'Boutique, magasin, commerce de détail',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        id: 'FOURNISSEUR' as BusinessType,
        title: 'Je suis FOURNISSEUR',
        description: 'Grossiste, producteur, distributeur',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
    },
    {
        id: 'RESTAURATEUR' as BusinessType,
        title: 'Je suis RESTAURATEUR',
        description: 'Restaurant, café, service de restauration',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
        ),
    },
    {
        id: 'LIVREUR' as BusinessType,
        title: 'Je suis LIVREUR',
        description: 'Service de livraison, coursier',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h3" />
            </svg>
        ),
    },
];

export default function CreateBusinessPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
    const [loading, setLoading] = useState(false);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.replace('/auth/login');
        }
    }, [router]);

    const handleContinue = async () => {
        if (!selectedType) return;

        setLoading(true);
        localStorage.setItem('proSubType', selectedType);

        // Navigate to specific business creation form
        router.push(`/create-business/${selectedType.toLowerCase()}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <Link href="/dashboard/particulier" className={styles.backLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Retour
                    </Link>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.logoText}>KomoraLink</span>
                    </div>
                </div>

                {/* Title */}
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Qui êtes-vous ?</h1>
                    <p className={styles.subtitle}>
                        Choisissez le type d'activité qui correspond à votre entreprise
                    </p>
                </div>

                {/* Business Type Selection */}
                <div className={styles.optionsGrid}>
                    {businessTypes.map((type) => (
                        <button
                            key={type.id}
                            className={`${styles.optionCard} ${selectedType === type.id ? styles.selected : ''}`}
                            onClick={() => setSelectedType(type.id)}
                        >
                            <div className={styles.optionIcon}>{type.icon}</div>
                            <div className={styles.optionContent}>
                                <h3 className={styles.optionTitle}>{type.title}</h3>
                                <p className={styles.optionDescription}>{type.description}</p>
                            </div>
                            {selectedType === type.id && (
                                <div className={styles.checkmark}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Continue Button */}
                <button
                    className={`${styles.continueButton} ${selectedType ? styles.active : ''}`}
                    onClick={handleContinue}
                    disabled={!selectedType || loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner} />
                            Chargement...
                        </>
                    ) : selectedType ? (
                        'Continuer'
                    ) : (
                        'Veuillez choisir une option'
                    )}
                </button>
            </div>
        </div>
    );
}
