'use client';

import { useEffect, useRef } from 'react';
import styles from './ConfirmationModal.module.css';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showCancel?: boolean;
}

const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Annuler',
    type = 'info',
    showCancel = false,
}: ConfirmationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div
            className={styles.backdrop}
            ref={modalRef}
            onClick={handleBackdropClick}
        >
            <div className={`${styles.modal} ${styles[type]}`}>
                <div className={styles.icon}>
                    {icons[type]}
                </div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {showCancel && (
                        <button
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`${styles.confirmBtn} ${styles[`confirmBtn${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
