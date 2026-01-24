'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

interface PublicHeaderProps {
    variant?: 'transparent' | 'solid';
}

export default function PublicHeader({ variant = 'solid' }: PublicHeaderProps) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isTransparent = variant === 'transparent' && !isMenuOpen;

    const navLinks = [
        { href: '/about', label: 'À propos' },
        { href: '/docs/start', label: 'Documentation' },
        { href: '/careers', label: 'Recrutement' },
    ];

    return (
        <header style={{
            padding: '0 24px',
            height: 'var(--header-height)',
            background: isTransparent ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            borderBottom: isTransparent ? 'none' : '1px solid var(--color-gray-200)',
            transition: 'all 0.3s ease',
            boxShadow: isTransparent ? 'none' : 'var(--shadow-sm)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: 'var(--content-max-width)',
                margin: '0 auto'
            }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '240px', height: '60px' }}>
                        {/* Show White Logo when transparent (on Green BG), Green Logo otherwise */}
                        <Image
                            src={isTransparent ? "/logo-white.png" : "/logo-green.png"}
                            alt="KomoraLink Logo"
                            fill
                            style={{ objectFit: 'contain', objectPosition: 'left center' }}
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav style={{ gap: '30px', alignItems: 'center' }} className="desktop-nav">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} style={{
                            color: isTransparent ? 'white' : 'var(--color-gray-900)',
                            textDecoration: 'none',
                            opacity: pathname.startsWith(link.href) ? 1 : 0.8,
                            fontWeight: pathname.startsWith(link.href) ? 600 : 400,
                            fontSize: '15px',
                            transition: 'opacity 0.2s'
                        }}>{link.label}</Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: isTransparent ? 'white' : 'var(--color-gray-900)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'none'
                    }}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '72px', // Matches header height approx
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--color-white)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    borderTop: '1px solid var(--color-gray-200)',
                    zIndex: 99
                }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                color: 'var(--color-gray-900)',
                                textDecoration: 'none',
                                fontSize: '18px',
                                fontWeight: '600',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'var(--color-gray-50)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            {link.label}
                            <ArrowRight size={20} color="var(--color-gray-400)" />
                        </Link>
                    ))}
                </div>
            )}

            <style jsx>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: block !important; }
                    .hidden-mobile { display: none !important; }
                }
                @media (min-width: 769px) {
                    .desktop-nav { display: flex !important; }
                    .mobile-menu-btn { display: none !important; }
                    .hidden-mobile { display: inline !important; }
                }
            `}</style>
        </header>
    );
}
