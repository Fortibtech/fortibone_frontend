'use client';

import React from 'react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
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

export default function ProductCard({
    name,
    price,
    currencyCode,
    imageUrl,
    rating = 0,
    reviewCount = 0,
    distance,
    onPress,
}: ProductCardProps) {
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={i < fullStars ? styles.starFilled : styles.starEmpty}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <button className={styles.card} onClick={onPress}>
            <img
                src={imageUrl || 'https://via.placeholder.com/300'}
                alt={name}
                className={styles.image}
            />
            <div className={styles.content}>
                <h3 className={styles.title}>{name}</h3>
                <p className={styles.price}>
                    {price.toLocaleString('fr-FR')} {currencyCode}
                </p>
                <div className={styles.ratingRow}>
                    <span className={styles.stars}>{renderStars(rating)}</span>
                    {reviewCount > 0 && (
                        <span className={styles.reviewCount}>({reviewCount})</span>
                    )}
                </div>
                {distance && <p className={styles.distance}>{distance}</p>}
            </div>
        </button>
    );
}
