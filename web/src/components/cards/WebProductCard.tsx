'use client';

import React from 'react';
import styles from './WebProductCard.module.css';

interface WebProductCardProps {
    id: string;
    name: string;
    price: number;
    currencyCode: string;
    imageUrl?: string;
    rating?: number;
    reviewCount?: number;
    distance?: string;
    onPress?: () => void;
}

export default function WebProductCard({
    name,
    price,
    currencyCode,
    imageUrl,
    rating = 0,
    reviewCount = 0,
    distance,
    onPress,
    onRemove, // New prop
}: WebProductCardProps & { onRemove?: () => void }) {
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];

        // Render full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`}>★</span>);
        }

        // Render half star if needed
        if (hasHalfStar) {
            stars.push(<span key="half" style={{ opacity: 0.6 }}>★</span>);
        }

        // Fill remaining with empty stars if needed for consistent spacing, 
        // or just leave them out for a cleaner look. Let's stick to gold stars only for now.

        return stars;
    };

    return (
        <div className={styles.card} onClick={onPress}>
            <div className={styles.imageContainer}>
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className={styles.image} />
                ) : (
                    <div className={styles.placeholder}>
                        <span>📦</span>
                    </div>
                )}

                {/* Remove/Delete Action */}
                {onRemove && (
                    <button
                        className={styles.removeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer des favoris ?')) {
                                onRemove();
                            }
                        }}
                        title="Retirer des favoris"
                    >
                        🗑️
                    </button>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title} title={name}>{name}</h3>

                <div className={styles.priceRow}>
                    <span className={styles.price}>
                        {price.toLocaleString('fr-FR')} <span className={styles.currency}>{currencyCode}</span>
                    </span>
                </div>

                <div className={styles.metaRow}>
                    <div className={styles.rating}>
                        <span className={styles.stars}>{rating > 0 && renderStars(rating)}</span>
                        <span className={styles.ratingValue}>{rating > 0 ? rating.toFixed(1) : ''}</span>
                        {reviewCount > 0 && <span className={styles.reviewCount}>({reviewCount})</span>}
                    </div>
                    {distance && <span className={styles.distance}>{distance}</span>}
                </div>
            </div>

            <button className={styles.addButton} onClick={(e) => {
                e.stopPropagation();
                onPress?.(); // Or add to cart logic
            }}>
                Voir
            </button>
        </div>
    );
}
