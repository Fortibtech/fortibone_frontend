'use client';

import styles from './ComingSoonModal.module.css';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform?: 'ios' | 'android' | null;
}

export default function ComingSoonModal({ isOpen, onClose, platform }: ComingSoonModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>🚀</span>
                </div>

                <h3 className={styles.title}>Bientôt disponible !</h3>

                <p className={styles.description}>
                    L'application mobile KomoraLink pour {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'mobile'} est en cours de déploiement.
                    <br /><br />
                    Elle sera très prochainement téléchargeable sur les stores.
                </p>

                <button className={styles.button} onClick={onClose}>
                    J'ai compris
                </button>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
