'use client';

import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
}

export default function StatsCard({
    title,
    value,
    icon,
    color = '#059669',
    subtitle,
}: StatsCardProps) {
    return (
        <div className={styles.card} style={{ borderLeftColor: color }}>
            <div className={styles.iconContainer} style={{ color }}>
                {icon}
            </div>
            <div className={styles.content}>
                <p className={styles.title}>{title}</p>
                <p className={styles.value} style={{ color }}>{value}</p>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
        </div>
    );
}
