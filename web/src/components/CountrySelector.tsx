'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Country, getPhoneCode } from '@/lib/validation';
import styles from './CountrySelector.module.css';

interface CountrySelectorProps {
    selectedCountry: Country | null;
    onSelect: (country: Country) => void;
    placeholder?: string;
    label?: string;
    error?: string;
}

const REGIONS = ['Tous', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function CountrySelector({
    selectedCountry,
    onSelect,
    placeholder = 'Sélectionnez votre pays',
    label,
    error
}: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('Tous');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch countries on first open
    useEffect(() => {
        if (isOpen && countries.length === 0) {
            setLoading(true);
            fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2,idd,region,subregion')
                .then(res => res.json())
                .then((data: Country[]) => {
                    const valid = data.filter(
                        c => c.idd?.root && c.idd?.suffixes?.length > 0
                    );
                    const sorted = valid.sort((a, b) =>
                        a.name.common.localeCompare(b.name.common)
                    );
                    setCountries(sorted);
                })
                .catch(err => {
                    console.error('Error loading countries:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, countries.length]);

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Filter countries
    const filteredCountries = useMemo(() => {
        let list = countries;

        if (selectedRegion !== 'Tous') {
            list = list.filter(c => c.region === selectedRegion);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            list = list.filter(c =>
                c.name.common.toLowerCase().includes(searchLower)
            );
        }

        return list;
    }, [countries, search, selectedRegion]);

    const handleSelect = (country: Country) => {
        onSelect(country);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            {label && <label className={styles.label}>{label}</label>}

            {/* Trigger Button */}
            <button
                type="button"
                className={`${styles.trigger} ${error ? styles.error : ''} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedCountry ? (
                    <div className={styles.selectedValue}>
                        <img
                            src={selectedCountry.flags.png}
                            alt={selectedCountry.name.common}
                            className={styles.flag}
                        />
                        <span className={styles.countryName}>{selectedCountry.name.common}</span>
                        <span className={styles.phoneCode}>{getPhoneCode(selectedCountry)}</span>
                    </div>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}
                <svg
                    className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {error && <p className={styles.errorText}>{error}</p>}

            {/* Dropdown */}
            {isOpen && (
                <div className={styles.dropdown}>
                    {/* Search */}
                    <div className={styles.searchWrapper}>
                        <svg
                            className={styles.searchIcon}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Rechercher un pays..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Region Filters */}
                    <div className={styles.regionFilters}>
                        {REGIONS.map(region => (
                            <button
                                key={region}
                                type="button"
                                className={`${styles.regionChip} ${selectedRegion === region ? styles.active : ''}`}
                                onClick={() => setSelectedRegion(region)}
                            >
                                {region === 'Tous' ? 'Tous' : region}
                            </button>
                        ))}
                    </div>

                    {/* Countries List */}
                    <div className={styles.countryList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <span className={styles.spinner} />
                                Chargement...
                            </div>
                        ) : filteredCountries.length === 0 ? (
                            <div className={styles.empty}>Aucun pays trouvé</div>
                        ) : (
                            filteredCountries.map(country => (
                                <button
                                    key={country.cca2}
                                    type="button"
                                    className={`${styles.countryItem} ${selectedCountry?.cca2 === country.cca2 ? styles.selected : ''}`}
                                    onClick={() => handleSelect(country)}
                                >
                                    <img
                                        src={country.flags.png}
                                        alt={country.name.common}
                                        className={styles.countryFlag}
                                    />
                                    <div className={styles.countryInfo}>
                                        <span className={styles.countryItemName}>{country.name.common}</span>
                                        <span className={styles.countryItemCode}>{getPhoneCode(country)}</span>
                                    </div>
                                    {selectedCountry?.cca2 === country.cca2 && (
                                        <svg
                                            className={styles.checkIcon}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
