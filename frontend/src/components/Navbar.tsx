'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import {
  IconSearch,
  IconToken,
  IconCoins,
  IconUser,
  IconFlask,
  IconSurvey,
  IconWallet,
  IconHelpCircle,
  IconLogOut,
  IconChevronDown,
  IconMenu,
  IconX,
  IconSliders,
  IconActivity,
  IconSettings,
  IconShieldCheck,
  IconArrowRight,
} from './Icons';
import { formatNumber } from '../utils/format';

interface NavbarProps {
  variant?: 'landing' | 'app';
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  role?: 'researcher' | 'respondent';
  onRoleToggle?: (role: 'researcher' | 'respondent') => void;
  tokenBalance?: number;
}

export default function Navbar({
  variant = 'app',
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari survei berdasarkan judul, topik, reward...',
  role: controlledRole,
  onRoleToggle,
  tokenBalance: propTokenBalance,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Budi Santoso');
  const [userEmail, setUserEmail] = useState('budi.santoso@example.com');
  const [userRole, setUserRole] = useState<'researcher' | 'respondent'>('respondent');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const activeRole = controlledRole || userRole;
  const tokenCount = propTokenBalance !== undefined ? propTokenBalance : 142.5;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);

      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');
        const storedRole = localStorage.getItem('user_role');
        const storedAvatar = localStorage.getItem('user_avatar');

        if (storedName) setUserName(storedName);
        if (storedEmail) setUserEmail(storedEmail);
        if (storedRole === 'researcher') setUserRole('researcher');
        if (storedAvatar) setUserAvatar(storedAvatar);
      } else {
        setIsLoggedIn(false);
      }

      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    router.push('/login');
  };

  const handleRoleSwitch = (newRole: 'researcher' | 'respondent') => {
    setUserRole(newRole);
    localStorage.setItem('user_role', newRole);
    if (onRoleToggle) {
      onRoleToggle(newRole);
    }
    setUserMenuOpen(false);
  };

  // ─────────────────────────────────────────────────────────────
  // LANDING VARIANT NAVBAR
  // ─────────────────────────────────────────────────────────────
  if (variant === 'landing') {
    return (
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: isScrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: isScrolled ? 'rgba(11, 46, 99, 0.1)' : 'rgba(11, 46, 99, 0.05)',
          transition: 'all 0.25s ease',
          boxShadow: isScrolled ? '0 4px 20px -2px rgba(11, 46, 99, 0.06)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px',
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={36} />
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
            className="hide-mobile"
          >
            <a
              href="/#features"
              style={{
                color: 'var(--neutral-text-muted)',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutral-text-muted)')}
            >
              Fitur & Keunggulan
            </a>
            <a
              href="/#how-it-works"
              style={{
                color: 'var(--neutral-text-muted)',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutral-text-muted)')}
            >
              Cara Kerja
            </a>
            <a
              href="/#pricing"
              style={{
                color: 'var(--neutral-text-muted)',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutral-text-muted)')}
            >
              Simulasi Token
            </a>
            <Link
              href="/feed"
              style={{
                color: pathname === '/feed' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.15s ease',
              }}
            >
              <IconSurvey size={16} />
              <span>Jelajah Survei</span>
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hide-mobile">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <IconActivity size={16} />
                <span>Buka Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-ghost"
                  style={{
                    color: 'var(--neutral-text)',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '8px 16px',
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(27, 111, 224, 0.25)',
                  }}
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="show-mobile-flex"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--neutral-text)',
              padding: '6px',
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px 24px',
              background: 'white',
              borderBottom: '1px solid var(--neutral-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 500, color: 'var(--neutral-text)' }}
            >
              Fitur & Keunggulan
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 500, color: 'var(--neutral-text)' }}
            >
              Cara Kerja
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 500, color: 'var(--neutral-text)' }}
            >
              Simulasi Biaya
            </a>
            <Link
              href="/feed"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 600, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <IconSurvey size={18} />
              <span>Jelajah Survei</span>
            </Link>
            <div style={{ height: '1px', background: 'var(--neutral-border)', margin: '6px 0' }} />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                Dashboard Saya
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // APP VARIANT NAVBAR (Feed, Dashboard, Wallet, Create Research, Settings, Admin, dll.)
  // ─────────────────────────────────────────────────────────────
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(11, 46, 99, 0.08)',
        boxShadow: isScrolled ? '0 4px 18px -2px rgba(11, 46, 99, 0.06)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '66px',
          gap: '20px',
        }}
      >
        {/* Brand Logo & Global Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={34} />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hide-mobile">
            <Link
              href="/feed"
              className={`nav-tab-pill ${pathname === '/feed' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: pathname === '/feed' ? 600 : 500,
                color: pathname === '/feed' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                backgroundColor: pathname === '/feed' ? 'var(--primary-blue-light)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <IconSurvey size={16} />
              <span>Jelajah Survei</span>
            </Link>

            <Link
              href="/dashboard"
              className={`nav-tab-pill ${pathname === '/dashboard' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: pathname === '/dashboard' ? 600 : 500,
                color: pathname === '/dashboard' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                backgroundColor: pathname === '/dashboard' ? 'var(--primary-blue-light)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <IconActivity size={16} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/wallet"
              className={`nav-tab-pill ${pathname === '/wallet' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: pathname === '/wallet' ? 600 : 500,
                color: pathname === '/wallet' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                backgroundColor: pathname === '/wallet' ? 'var(--primary-blue-light)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <IconWallet size={16} />
              <span>Dompet Saldo</span>
            </Link>
          </nav>
        </div>

        {/* Middle: Optional Search Input */}
        {onSearchChange && (
          <div style={{ flex: 1, maxWidth: '440px' }} className="hide-mobile">
            <div style={{ position: 'relative' }}>
              <IconSearch
                size={16}
                color="var(--neutral-text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-search"
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--neutral-border)',
                  backgroundColor: 'var(--neutral-bg)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Right Section: Actions & User Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {isLoggedIn ? (
            <>
              {/* Sebar Riset Button (Researcher CTA) */}
              <Link
                href="/research/create"
                className="btn btn-secondary hide-mobile"
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-pill)',
                  gap: '6px',
                  borderColor: 'var(--primary-blue)',
                  color: 'var(--primary-blue)',
                }}
              >
                <IconFlask size={15} />
                <span>Buat Riset</span>
              </Link>

              {/* Token Balance Chip */}
              <Link
                href="/wallet"
                title="Klik untuk membuka dompet & top up token"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  backgroundColor: 'var(--accent-green-light)',
                  border: '1px solid rgba(28, 154, 91, 0.2)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--accent-green-dark)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-green)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  ₮
                </div>
                <span>{tokenCount} Token</span>
              </Link>

              {/* User Avatar Menu Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '5px 10px 5px 6px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--neutral-border)',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  aria-expanded={userMenuOpen}
                  aria-label="User profile menu"
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: activeRole === 'researcher' ? 'var(--primary-blue)' : 'var(--accent-green)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className="hide-mobile"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--neutral-text)',
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userName.split(' ')[0]}
                  </span>
                  <IconChevronDown size={14} color="var(--neutral-text-muted)" />
                </button>

                {/* Dropdown Menu Box */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '270px',
                      backgroundColor: 'white',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-float)',
                      border: '1px solid var(--neutral-border-subtle)',
                      padding: '8px',
                      zIndex: 1000,
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    {/* User Info Header */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--neutral-border)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                        {userName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
                        {userEmail}
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: activeRole === 'researcher' ? 'var(--primary-blue-light)' : 'var(--accent-green-light)',
                            color: activeRole === 'researcher' ? 'var(--primary-blue)' : 'var(--accent-green-dark)',
                          }}
                        >
                          Mode: {activeRole === 'researcher' ? 'Peneliti (Researcher)' : 'Responden'}
                        </span>
                      </div>
                    </div>

                    {/* Mode Switcher */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--neutral-border)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--neutral-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Ganti Peran Aktif
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleRoleSwitch('respondent')}
                          style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: activeRole === 'respondent' ? 'var(--accent-green)' : 'var(--neutral-border)',
                            backgroundColor: activeRole === 'respondent' ? 'var(--accent-green-light)' : 'transparent',
                            color: activeRole === 'respondent' ? 'var(--accent-green-dark)' : 'var(--neutral-text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          Responden
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('researcher')}
                          style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: activeRole === 'researcher' ? 'var(--primary-blue)' : 'var(--neutral-border)',
                            backgroundColor: activeRole === 'researcher' ? 'var(--primary-blue-light)' : 'transparent',
                            color: activeRole === 'researcher' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          Peneliti
                        </button>
                      </div>
                    </div>

                    {/* Menu Navigation Items */}
                    <div style={{ padding: '4px 0' }}>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: 'var(--neutral-text)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <IconUser size={16} color="var(--neutral-text-muted)" />
                        <span>Profil & Verifikasi</span>
                      </Link>

                      <Link
                        href="/wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: 'var(--neutral-text)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <IconWallet size={16} color="var(--neutral-text-muted)" />
                        <span>Dompet & Saldo</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: 'var(--neutral-text)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <IconSettings size={16} color="var(--neutral-text-muted)" />
                        <span>Pengaturan Akun</span>
                      </Link>

                      <Link
                        href="/support"
                        onClick={() => setUserMenuOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: 'var(--neutral-text)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <IconHelpCircle size={16} color="var(--neutral-text-muted)" />
                        <span>Pusat Bantuan</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '4px' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: 'var(--danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'left',
                        }}
                      >
                        <IconLogOut size={16} color="var(--danger)" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Buttons */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                className="btn btn-secondary"
                style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600 }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ padding: '7px 18px', fontSize: '13px', fontWeight: 600 }}
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="show-mobile-flex"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--neutral-text)',
              padding: '6px',
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '16px 24px 24px',
            background: 'white',
            borderBottom: '1px solid var(--neutral-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {onSearchChange && (
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <IconSearch
                size={16}
                color="var(--neutral-text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari survei..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--neutral-border)',
                  fontSize: '13px',
                }}
              />
            </div>
          )}

          <Link
            href="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${pathname === '/feed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <IconSurvey size={16} />
            <span>Jelajah Survei</span>
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${pathname === '/dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <IconActivity size={16} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${pathname === '/wallet' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <IconWallet size={16} />
            <span>Dompet Saldo</span>
          </Link>

          <Link
            href="/research/create"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <IconFlask size={16} color="var(--primary-blue)" />
            <span>Buat Riset</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
          >
            <IconUser size={16} />
            <span>Profil Saya</span>
          </Link>

          {isLoggedIn ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="btn btn-danger"
              style={{ justifyContent: 'flex-start', padding: '10px 14px', marginTop: '8px' }}
            >
              <IconLogOut size={16} />
              <span>Keluar Akun</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
