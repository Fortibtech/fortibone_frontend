import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`${styles.container} ${className}`}>
            {icon && <div className={styles.illustration}>{icon}</div>}
            {!icon && (
                <div className={styles.illustration}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                </div>
            )}
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
}

// Pre-defined SVG Illustrations
export const EmptyIllustrations = {
    Chart: (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="140" width="30" height="40" rx="2" fill="currentColor" fillOpacity="0.3" />
            <rect x="85" y="100" width="30" height="80" rx="2" fill="currentColor" fillOpacity="0.5" />
            <rect x="130" y="60" width="30" height="120" rx="2" fill="currentColor" fillOpacity="0.7" />
            <path d="M30 180H170" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    ),
    Data: (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 40L40 70V130L100 160L160 130V70L100 40Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d="M100 40V160M40 70L160 70M40 130L160 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
    ),
    Wishlist: (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 170L30 90C15 70 30 40 60 40C80 40 100 60 100 60C100 60 120 40 140 40C170 40 185 70 170 90L100 170Z"
                stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
            <path d="M100 40V20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
            <path d="M100 40L120 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
            <path d="M100 40L80 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        </svg>
    )
};
