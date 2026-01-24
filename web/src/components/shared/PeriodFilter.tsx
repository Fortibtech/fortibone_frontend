'use client';

import { useState, useEffect } from 'react';
import styles from './PeriodFilter.module.css';

export type PeriodType = 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';

export interface PeriodDates {
    startDate: string;
    endDate: string;
}

export interface PeriodFilterProps {
    value: PeriodType;
    onChange: (period: PeriodType, dates: PeriodDates) => void;
    customStartDate?: string;
    customEndDate?: string;
}

const periodOptions = [
    { value: 'day' as PeriodType, label: "Aujourd'hui", icon: '📅' },
    { value: 'week' as PeriodType, label: 'Cette semaine', icon: '📆' },
    { value: 'month' as PeriodType, label: 'Ce mois', icon: '🗓️' },
    { value: 'year' as PeriodType, label: 'Cette année', icon: '📊' },
    { value: 'all' as PeriodType, label: 'Tout le temps', icon: '∞' },
    { value: 'custom' as PeriodType, label: 'Période personnalisée', icon: '✏️' },
];

export function getPeriodDates(period: PeriodType, customStart?: string, customEnd?: string): PeriodDates {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
        case 'day': {
            return { startDate: today, endDate: today };
        }
        case 'week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            return {
                startDate: startOfWeek.toISOString().split('T')[0],
                endDate: today,
            };
        }
        case 'month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: today,
            };
        }
        case 'year': {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return {
                startDate: startOfYear.toISOString().split('T')[0],
                endDate: today,
            };
        }
        case 'all': {
            // Return empty strings to indicate no date filter
            return { startDate: '', endDate: '' };
        }
        case 'custom': {
            return {
                startDate: customStart || today,
                endDate: customEnd || today,
            };
        }
        default:
            return { startDate: '', endDate: '' };
    }
}

export function getPeriodLabel(period: PeriodType): string {
    switch (period) {
        case 'day': return 'du jour';
        case 'week': return 'de la semaine';
        case 'month': return 'du mois';
        case 'year': return "de l'année";
        case 'all': return 'Global';
        case 'custom': return 'personnalisé';
        default: return '';
    }
}

export default function PeriodFilter({
    value,
    onChange,
    customStartDate,
    customEndDate,
}: PeriodFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(value);
    const [startDate, setStartDate] = useState(customStartDate || '');
    const [endDate, setEndDate] = useState(customEndDate || '');

    useEffect(() => {
        setSelectedPeriod(value);
    }, [value]);

    const handlePeriodSelect = (period: PeriodType) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            const dates = getPeriodDates(period);
            onChange(period, dates);
            setIsOpen(false);
        }
    };

    const handleApplyCustom = () => {
        if (startDate && endDate) {
            onChange('custom', { startDate, endDate });
            setIsOpen(false);
        }
    };

    const currentLabel = periodOptions.find(o => o.value === value)?.label || 'Période';

    return (
        <>
            {/* Trigger Button */}
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(true)}
            >
                <span className={styles.triggerIcon}>📅</span>
                <span className={styles.triggerLabel}>{currentLabel}</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.header}>
                            <h3 className={styles.title}>Sélectionner une période</h3>
                            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                ✕
                            </button>
                        </div>

                        <div className={styles.options}>
                            {periodOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`${styles.option} ${selectedPeriod === option.value ? styles.optionActive : ''}`}
                                    onClick={() => handlePeriodSelect(option.value)}
                                >
                                    <span className={styles.optionIcon}>{option.icon}</span>
                                    <span className={styles.optionLabel}>{option.label}</span>
                                </button>
                            ))}
                        </div>

                        {selectedPeriod === 'custom' && (
                            <div className={styles.customDates}>
                                <p className={styles.customTitle}>Définir la période</p>
                                <div className={styles.dateInputs}>
                                    <div className={styles.dateField}>
                                        <label className={styles.dateLabel}>Date de début</label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.dateField}>
                                        <label className={styles.dateLabel}>Date de fin</label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button className={styles.applyBtn} onClick={handleApplyCustom}>
                                    Appliquer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
