import styles from './WebBusinessHeader.module.css';

interface WebBusinessHeaderProps {
    coverImageUrl?: string | null;
    logoUrl?: string | null;
    name: string;
    type: 'RESTAURANT' | 'BUSINESS'; // Simplified type for display logic
    rating: number;
    reviewCount: number;
    description?: string | null;
    address?: string | null;
    phoneNumber?: string | null;
    isVerified?: boolean;
}

export default function WebBusinessHeader({
    coverImageUrl,
    logoUrl,
    name,
    type,
    rating,
    reviewCount,
    description,
    address,
    phoneNumber,
    isVerified,
}: WebBusinessHeaderProps) {

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} style={{ color: i < fullStars ? '#f59e0b' : '#d1d5db' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div className={styles.headerContainer}>
            {/* Cover Image */}
            <div className={styles.coverSection}>
                {coverImageUrl ? (
                    <img src={coverImageUrl} alt={`${name} cover`} className={styles.coverImage} />
                ) : (
                    <div className={`${styles.coverPlaceholder} ${type === 'RESTAURANT' ? styles.restaurantCover : styles.businessCover}`}>
                        {type === 'RESTAURANT' ? '🍽️' : '🏢'}
                    </div>
                )}

                {/* Overlay Gradient for text readability if we decide to put text on image, 
                    but here we stick to the LinkedIn style (Logo floating below) */}
            </div>

            {/* Info Bar */}
            <div className={styles.infoSection}>
                <div className={styles.mainContent}>
                    {/* Logo Wrapper (Negative Margin to overlap cover) */}
                    <div className={styles.logoWrapper}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={`${name} logo`} className={styles.logo} />
                        ) : (
                            <div className={styles.logoPlaceholder}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Text Details */}
                    <div className={styles.details}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.name}>{name}</h1>
                            {isVerified && (
                                <span className={styles.verifiedBadge} title="Vérifié">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Vérifié
                                </span>
                            )}
                        </div>

                        {description && <p className={styles.description}>{description}</p>}

                        <div className={styles.metaGrid}>
                            <div className={styles.ratingRow}>
                                <div className={styles.stars}>{renderStars(rating)}</div>
                                <span className={styles.ratingText}>{rating.toFixed(1)} ({reviewCount} avis)</span>
                            </div>

                            {address && (
                                <div className={styles.metaItem}>
                                    <span className={styles.icon}>📍</span>
                                    {address}
                                </div>
                            )}

                            {phoneNumber && (
                                <div className={styles.metaItem}>
                                    <span className={styles.icon}>📞</span>
                                    <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions (Right Side) */}
                <div className={styles.actions}>
                    {phoneNumber && (
                        <a href={`tel:${phoneNumber}`} className={styles.actionBtn}>
                            Appeler
                        </a>
                    )}
                    <button className={styles.actionBtnPrimary}>
                        Contacter
                    </button>
                </div>
            </div>
        </div>
    );
}
