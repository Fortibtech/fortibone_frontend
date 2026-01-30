import styles from './Skeleton.module.css';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
}

export function Skeleton({
    className = '',
    variant = 'rect',
    width,
    height,
    style
}: SkeletonProps) {
    const variantClass = variant === 'circle' ? styles.circle : variant === 'text' ? styles.text : '';

    return (
        <div
            className={`${styles.skeleton} ${variantClass} ${className}`}
            style={{ width, height, ...style }}
        />
    );
}
