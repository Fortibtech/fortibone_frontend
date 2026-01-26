'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PublicHeaderProps {
    variant?: 'transparent' | 'solid';
}

export default function PublicHeader({ variant = 'solid' }: PublicHeaderProps) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('candidate_token');
            const email = localStorage.getItem('candidate_email');
            setIsLoggedIn(!!token);
            if (email) setUserEmail(email);
        };
        checkAuth();
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('candidate_token');
        localStorage.removeItem('candidate_email');
        setIsLoggedIn(false);
        setUserEmail('');
        setShowProfileMenu(false);
        window.dispatchEvent(new Event('auth-change'));
    };

    const isTransparent = variant === 'transparent' && !isMenuOpen;

    const navLinks = [
        // { href: '/about', label: 'À propos' },
        // { href: '/docs', label: 'Documentation' },
        { href: '/careers', label: 'Recrutement' },
    ];

    return (
        <header style={{
            padding: '20px 40px',
            background: isTransparent ? 'rgba(255, 255, 255, 0.05)' : '#0f172a',
            backdropFilter: isTransparent ? 'blur(10px)' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderBottom: isTransparent ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'background 0.3s ease'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #00c9a7, #00a389)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>K</div>
                        KomoraLink
                        {pathname.startsWith('/docs') && (
                            <span style={{
                                fontSize: '14px',
                                opacity: 0.6,
                                marginLeft: '8px',
                                fontWeight: 'normal',
                                borderLeft: '1px solid rgba(255,255,255,0.3)',
                                paddingLeft: '10px',
                                display: 'none' // Hidden on mobile by default, handled by media query usually but inline logic here
                            }} className="hidden-mobile">Docs</span>
                        )}
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav style={{ gap: '30px', alignItems: 'center' }} className="desktop-nav">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} style={{
                            color: 'white',
                            textDecoration: 'none',
                            opacity: pathname.startsWith(link.href) ? 1 : 0.8,
                            fontWeight: pathname.startsWith(link.href) ? 600 : 400
                        }}>{link.label}</Link>
                    ))}

                    {isLoggedIn && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '20px'
                                }}
                            >
                                👤
                            </button>
                            {showProfileMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    background: 'white',
                                    color: '#0f172a',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    width: '200px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px'
                                }}>
                                    <div style={{ padding: '10px', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                        Mon Profil <br />
                                        <span style={{ fontSize: '12px', fontWeight: '400' }}>{userEmail}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            border: 'none',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Se déconnecter
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'none' // Toggled via CSS usually, but we'll use a style tag for responsiveness
                    }}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '72px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#0f172a',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '18px',
                                padding: '10px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {/* Removed Connexion Button */}
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                padding: '14px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                textAlign: 'center',
                                marginTop: '20px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Se déconnecter (Profil)
                        </button>
                    )}
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
