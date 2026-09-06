'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatNumber } from '@/utils/format';
import {
  IconSearch,
  IconToken,
  IconCoins,
  IconUser,
  IconFlask,
  IconSurvey,
  IconShieldCheck,
  IconClock,
  IconUsers,
  IconCheckCircle,
  IconPlus,
  IconFileSpreadsheet,
  IconWallet,
  IconHelpCircle,
  IconLogOut,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconArrowRight,
  IconTrendingUp,
  IconActivity,
  IconBarChart,
  IconLock,
} from '@/components/Icons';

type UserRole = 'researcher' | 'respondent';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('respondent');
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Budi Santoso');
  const [userEmail, setUserEmail] = useState('budi.santoso@example.com');
  const [feedCategory, setFeedCategory] = useState('all');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login?redirect=/dashboard');
        return;
      }
      setIsAuthenticated(true);
      const storedName = localStorage.getItem('user_name');
      const storedEmail = localStorage.getItem('user_email');
      const storedRole = localStorage.getItem('user_role');
      const storedAvatar = localStorage.getItem('user_avatar');
      if (storedName) setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedRole === 'researcher') setRole('researcher');
      if (storedAvatar) setUserAvatar(storedAvatar);
    }
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  // Get time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    if (h < 20) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Mock Feed Data (Respondent)
  const researchFeed = [
    {
      id: 'res-1',
      title: 'Survei Kebiasaan Belanja Online Mingguan Produk Kebutuhan Rumah',
      rewardToken: 0.8,
      rewardIdr: 800,
      durationMinutes: 5,
      quotaCurrent: 38,
      quotaTotal: 50,
      deadline: 'Besok, 23:59 WIB',
      category: 'Konsumen & Retail',
      matchScore: 'Sesuai Profil',
    },
    {
      id: 'res-2',
      title: 'Preferensi Penggunaan Aplikasi Finansial & Dompet Digital 2026',
      rewardToken: 1.6,
      rewardIdr: 1600,
      durationMinutes: 10,
      quotaCurrent: 82,
      quotaTotal: 100,
      deadline: '3 hari lagi',
      category: 'Fintech & Perbankan',
      matchScore: 'Sesuai Profil',
    },
    {
      id: 'res-3',
      title: 'Adopsi Teknologi AI dalam Produktivitas Belajar Mahasiswa & Profesional',
      rewardToken: 1.2,
      rewardIdr: 1200,
      durationMinutes: 8,
      quotaCurrent: 24,
      quotaTotal: 60,
      deadline: '5 hari lagi',
      category: 'Pendidikan & Teknologi',
      matchScore: 'Sesuai Profil',
    },
    {
      id: 'res-4',
      title: 'Evaluasi Kepuasan Transportasi Publik Komuter Jabodetabek',
      rewardToken: 0.8,
      rewardIdr: 800,
      durationMinutes: 6,
      quotaCurrent: 44,
      quotaTotal: 50,
      deadline: '7 hari lagi',
      category: 'Transportasi',
      matchScore: 'Sesuai Profil',
    },
  ];

  // Mock My Research Data (Researcher)
  const myResearches = [
    {
      id: 'my-1',
      title: 'Survei Preferensi Penggunaan E-Wallet di Jabodetabek',
      target: 100,
      filled: 68,
      tokenReserved: 100,
      status: 'Recruiting',
      statusColor: 'badge-emerald',
      createdAt: '2 Sep 2026',
    },
    {
      id: 'my-2',
      title: 'Riset Pola Konsumsi Kopi Generasi Z di Perkotaan',
      target: 50,
      filled: 50,
      tokenReserved: 50,
      status: 'Selesai',
      statusColor: 'badge',
      createdAt: '28 Agu 2026',
    },
    {
      id: 'my-3',
      title: 'Evaluasi Antarmuka Aplikasi Kesehatan Mental Remaja',
      target: 80,
      filled: 12,
      tokenReserved: 80,
      status: 'Recruiting',
      statusColor: 'badge-emerald',
      createdAt: '3 Sep 2026',
    },
  ];

  const filteredFeed = researchFeed.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = feedCategory === 'all' || item.category.toLowerCase().includes(feedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // Shared styles
  const sidebarNavItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--neutral-text)',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    background: 'transparent',
    textDecoration: 'none',
  };

  if (isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <IconLock size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
            Akses Terbatas
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Halaman Dashboard hanya dapat diakses oleh pengguna yang telah masuk akun. Mengalihkan ke halaman login...
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/login?redirect=/dashboard" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Masuk Sekarang
            </Link>
            <Link href="/feed" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '12px' }}>
              Jelajah Kuesioner (Mode Tamu)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      <Navbar
        role={role}
        onRoleToggle={(newRole) => setRole(newRole)}
      />

      {/* ============================================================ */}
      {/* 2. HERO GREETING BANNER                                      */}
      {/* ============================================================ */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--neutral-border)' }}>
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '20px' }}>
          <div className={mounted ? 'dash-fade-up' : ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--neutral-text)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '4px' }}>
                {getGreeting()}, {userName.split(' ')[0]}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                {role === 'respondent'
                  ? 'Yuk lihat survei yang bisa kamu kerjakan hari ini dan dapatkan reward!'
                  : 'Pantau progres riset, kelola kuesioner, dan lihat insight dari responden.'}
              </p>
            </div>

            {role === 'researcher' && (
              <Link
                href="/research/create"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', flexShrink: 0, fontSize: '13px' }}
              >
                <IconPlus size={16} />
                <span>Buat Riset Baru</span>
              </Link>
            )}
          </div>

          {/* Quick Stat Cards */}
          <div className={`grid-dashboard-stats ${mounted ? 'dash-fade-up' : ''}`}>
            {role === 'respondent' ? (
              <>
                <StatCard
                  icon={<IconToken size={18} color="var(--accent-green)" />}
                  label="Saldo Reward"
                  value="Rp32.000"
                  sub="32.0 Token"
                  accentColor="var(--accent-green)"
                  delay={0}
                />
                <StatCard
                  icon={<IconCheckCircle size={18} color="var(--primary-blue)" />}
                  label="Survei Selesai"
                  value="24"
                  sub="bulan ini"
                  accentColor="var(--primary-blue)"
                  delay={1}
                />
                <StatCard
                  icon={<IconShieldCheck size={18} color="var(--accent-green)" />}
                  label="Quality Score"
                  value="98%"
                  sub="Sangat Baik"
                  accentColor="var(--accent-green)"
                  delay={2}
                />
                <StatCard
                  icon={<IconTrendingUp size={18} color="var(--primary-blue)" />}
                  label="Survei Tersedia"
                  value={`${researchFeed.length}`}
                  sub="cocok profilmu"
                  accentColor="var(--primary-blue)"
                  delay={3}
                />
              </>
            ) : (
              <>
                <StatCard
                  icon={<IconCoins size={18} color="var(--primary-blue)" />}
                  label="Saldo Token"
                  value="250"
                  sub="Token tersedia"
                  accentColor="var(--primary-blue)"
                  delay={0}
                />
                <StatCard
                  icon={<IconFlask size={18} color="var(--accent-green)" />}
                  label="Riset Aktif"
                  value="2"
                  sub="sedang berjalan"
                  accentColor="var(--accent-green)"
                  delay={1}
                />
                <StatCard
                  icon={<IconUsers size={18} color="var(--primary-blue)" />}
                  label="Total Responden"
                  value="130"
                  sub="terkumpul"
                  accentColor="var(--primary-blue)"
                  delay={2}
                />
                <StatCard
                  icon={<IconBarChart size={18} color="var(--accent-green)" />}
                  label="Completion Rate"
                  value="85%"
                  sub="rata-rata"
                  accentColor="var(--accent-green)"
                  delay={3}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN 3-COLUMN LAYOUT                                      */}
      {/* ============================================================ */}
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px', flex: 1 }}>
        <div className="grid-layout-3col">
          {/* ========================================================== */}
          {/* LEFT SIDEBAR                                                */}
          {/* ========================================================== */}
          <aside className={mounted ? 'dash-fade-up' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.05s' }}>
            {/* Profile Card */}
            <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: role === 'researcher' ? 'var(--primary-blue)' : 'var(--accent-green)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    overflow: 'hidden',
                    border: '3px solid #FFFFFF',
                    boxShadow: `0 0 0 2px ${role === 'researcher' ? 'rgba(27,111,224,0.25)' : 'rgba(28,154,91,0.25)'}`,
                    marginBottom: '12px',
                  }}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userName.split(' ').map(n => n[0]).slice(0, 2).join('')
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neutral-text)', marginBottom: '2px' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '8px' }}>
                  Jakarta Selatan, Indonesia
                </div>
                <span className={`badge ${role === 'researcher' ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '10px' }}>
                  {role === 'researcher' ? 'Peneliti Aktif' : 'Responden Terverifikasi'}
                </span>
              </div>

              {/* Quality / Balance info */}
              <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '14px' }}>
                {role === 'respondent' ? (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--neutral-text-muted)' }}>Quality Score</span>
                        <strong style={{ color: 'var(--accent-green)' }}>98%</strong>
                      </div>
                      <div className="progress-bar-track" style={{ height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: '98%', backgroundColor: 'var(--accent-green)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Masa Hold</span>
                      <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 8px' }}>4.8 Token</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Saldo Token</span>
                      <strong style={{ color: 'var(--primary-blue)' }}>250 Token</strong>
                    </div>
                    <Link
                      href="/wallet"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
                    >
                      + Top-Up Saldo
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Menu (Desktop Sidebar Only) */}
            <div className="card hide-on-mobile" style={{ padding: '12px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 14px 8px' }}>
                Menu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { href: '/dashboard', icon: <IconActivity size={15} color="var(--primary-blue)" />, label: 'Dashboard', active: true },
                  { href: '/feed', icon: <IconSurvey size={15} color="var(--primary-blue)" />, label: 'Feed Survei' },
                  { href: '/wallet', icon: <IconWallet size={15} color="var(--accent-green)" />, label: 'Dompet & Mutasi' },
                  { href: '/profile', icon: <IconUser size={15} color="var(--primary-blue)" />, label: 'Profil' },
                  { href: '/support', icon: <IconHelpCircle size={15} color="var(--warning)" />, label: 'Bantuan' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item-dash ${item.active ? 'active' : ''}`}
                    style={{
                      ...sidebarNavItem,
                      backgroundColor: item.active ? 'var(--primary-blue-light)' : 'transparent',
                      color: item.active ? 'var(--primary-blue)' : 'var(--neutral-text)',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.active && <IconChevronRight size={13} color="var(--primary-blue)" style={{ marginLeft: 'auto' }} />}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ========================================================== */}
          {/* CENTER FEED                                                 */}
          {/* ========================================================== */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section Title */}
            <div className={mounted ? 'dash-fade-up' : ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: '0.1s' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--neutral-text)', letterSpacing: '-0.01em' }}>
                  {role === 'respondent' ? 'Survei Tersedia' : 'Riset Saya'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginTop: '2px' }}>
                  {role === 'respondent'
                    ? `${filteredFeed.length} survei cocok dengan profilmu`
                    : `${myResearches.length} riset ditemukan`}
                </p>
              </div>
              {role === 'respondent' && (
                <Link
                  href="/feed"
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Lihat Semua</span>
                  <IconArrowRight size={14} />
                </Link>
              )}
            </div>

            {/* Category Chips (Respondent) */}
            {role === 'respondent' && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'Fintech', 'Retail', 'Pendidikan', 'Transportasi'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeedCategory(cat)}
                    className="chip-dash"
                    style={{
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: feedCategory === cat ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                      backgroundColor: feedCategory === cat ? 'var(--primary-blue)' : '#FFFFFF',
                      color: feedCategory === cat ? '#FFFFFF' : 'var(--neutral-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* ── RESPONDENT SURVEY CARDS ── */}
            {role === 'respondent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredFeed.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`survey-card-dash ${mounted ? 'dash-fade-up' : ''}`}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--neutral-border-subtle)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '20px 24px',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                      animationDelay: `${0.1 + idx * 0.06}s`,
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--neutral-text)', lineHeight: 1.4, flex: 1 }}>
                        {item.title}
                      </h3>
                      <span className="badge badge-cyan" style={{ fontSize: '10px', flexShrink: 0 }}>
                        {item.category}
                      </span>
                    </div>

                    {/* Reward + Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--accent-green-light)',
                          color: 'var(--accent-green)',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: '1px solid #C3EAD5',
                        }}
                      >
                        <IconCoins size={14} />
                        Rp{formatNumber(item.rewardIdr)}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconClock size={13} color="var(--primary-blue)" />
                        ~{item.durationMinutes} menit
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconShieldCheck size={13} color="var(--accent-green)" />
                        {item.deadline}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                        <span style={{ color: 'var(--neutral-text-muted)' }}>Kuota terisi</span>
                        <span style={{ fontWeight: 600, color: 'var(--neutral-text)' }}>
                          {item.quotaCurrent}/{item.quotaTotal} ({Math.round((item.quotaCurrent / item.quotaTotal) * 100)}%)
                        </span>
                      </div>
                      <div className="progress-bar-track" style={{ height: '5px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(item.quotaCurrent / item.quotaTotal) * 100}%`,
                            backgroundColor: (item.quotaCurrent / item.quotaTotal) > 0.8 ? 'var(--warning)' : 'var(--primary-blue)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--neutral-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge-pill badge-pill-blue" style={{ fontSize: '10px', padding: '3px 10px' }}>
                          <IconCheckCircle size={11} /> {item.matchScore}
                        </span>
                      </div>
                      <Link
                        href={`/research/${item.id}`}
                        className="btn btn-action"
                        style={{ padding: '7px 18px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Kerjakan
                        <IconArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}

                {filteredFeed.length === 0 && (
                  <div className="empty-state">
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-text-muted)', marginBottom: '12px' }}>
                      <IconSearch size={22} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px' }}>
                      Tidak Ada Survei Ditemukan
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', maxWidth: '320px', margin: '0 auto' }}>
                      Coba ganti kata kunci atau periksa kembali nanti.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── RESEARCHER RESEARCH CARDS ── */}
            {role === 'researcher' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myResearches.map((item, idx) => {
                  const pct = Math.round((item.filled / item.target) * 100);
                  const isComplete = item.filled >= item.target;
                  return (
                    <div
                      key={item.id}
                      className={`research-card-dash ${mounted ? 'dash-fade-up' : ''}`}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--neutral-border-subtle)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '20px 24px',
                        boxShadow: 'var(--shadow-card)',
                        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                        animationDelay: `${0.1 + idx * 0.06}s`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--neutral-text)', lineHeight: 1.4 }}>{item.title}</h3>
                          <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginTop: '3px' }}>Dibuat {item.createdAt}</div>
                        </div>
                        <span className={`badge ${item.statusColor}`} style={{ fontSize: '10px', flexShrink: 0 }}>{item.status}</span>
                      </div>

                      {/* Progress */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                          <span style={{ color: 'var(--neutral-text-muted)' }}>Responden terkumpul</span>
                          <span style={{ fontWeight: 600, color: isComplete ? 'var(--accent-green)' : 'var(--neutral-text)' }}>
                            {item.filled}/{item.target} ({pct}%)
                          </span>
                        </div>
                        <div className="progress-bar-track" style={{ height: '5px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isComplete ? 'var(--accent-green)' : 'var(--primary-blue)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--neutral-border)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                          Escrow: <strong style={{ color: 'var(--neutral-text)' }}>{item.tokenReserved} Token</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href="/research/create" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                            Studio Soal
                          </Link>
                          <button
                            type="button"
                            onClick={() => alert(`Mengunduh CSV untuk ${item.title}`)}
                            className="btn btn-action"
                            style={{ padding: '6px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <IconFileSpreadsheet size={13} />
                            <span>CSV</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ========================================================== */}
          {/* RIGHT SIDEBAR                                               */}
          {/* ========================================================== */}
          <aside className={mounted ? 'dash-slide-right' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {role === 'respondent' ? (
              <>
                {/* Wallet Quick Card */}
                <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconWallet size={18} color="var(--accent-green)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Saldo Dompet
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Rp32.000
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '14px' }}>
                    32.0 Token · 1 Token = Rp1.000
                  </div>
                  <Link href="/wallet" className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px 12px', justifyContent: 'center' }}>
                    Tarik Dana
                  </Link>
                </div>

                {/* Tips Card */}
                <div className="card" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <IconShieldCheck size={16} color="var(--primary-blue)" />
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                      Tips Quality Score
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Baca setiap pertanyaan dengan teliti',
                      'Hindari pola jawaban seragam',
                      'Jangan terlalu cepat (speeding)',
                      'Konsisten dan jujur dalam menjawab',
                    ].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                        <IconCheckCircle size={13} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feed CTA */}
                <div
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--primary-blue-light)',
                    border: '1px solid #D1E3FC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <IconSurvey size={18} color="var(--primary-blue)" />
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue-dark)' }}>
                      Cari Lebih Banyak?
                    </h3>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    Buka halaman Feed untuk filter lengkap dan rekomendasi survei.
                  </p>
                  <Link href="/feed" className="btn btn-primary" style={{ width: '100%', fontSize: '12px', padding: '8px 12px', justifyContent: 'center', gap: '6px' }}>
                    <span>Buka Feed Survei</span>
                    <IconArrowRight size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* CTA Create */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--primary-blue-light)',
                    border: '1px solid #D1E3FC',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                      boxShadow: 'var(--shadow-xs)',
                    }}>
                      <IconFlask size={20} color="var(--primary-blue)" />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue-dark)', marginBottom: '6px' }}>
                      Butuh Responden?
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      Dapatkan responden terverifikasi domisili & usia dalam hitungan jam.
                    </p>
                    <Link href="/research/create" className="btn btn-primary" style={{ width: '100%', padding: '10px 14px', justifyContent: 'center', fontSize: '13px' }}>
                      + Buat Kuesioner Baru
                    </Link>
                  </div>
                </div>

                {/* Research Quality Checklist */}
                <div className="card" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--neutral-text)' }}>
                    Standar Mutu Riset
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Minimal responden: 50 orang',
                      'Filter GPS & usia otomatis',
                      'Deteksi anti-bot & straight-lining',
                      'Ekspor CSV siap SPSS & R',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                        <IconCheckCircle size={14} color="var(--accent-green)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token Info */}
                <div className="card" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <IconCoins size={16} color="var(--primary-blue)" />
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>Info Token</h3>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.6 }}>
                    1 Token = Rp1.000. Token yang direservasi akan dikunci sebagai escrow dan dicairkan secara otomatis ke responden setelah jawaban divalidasi.
                  </div>
                  <Link
                    href="/wallet"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '10px' }}
                  >
                    <span>Kelola Saldo</span>
                    <IconArrowRight size={12} />
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ─── Stat Card Component ─── */
function StatCard({ icon, label, value, sub, accentColor, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  delay: number;
}) {
  return (
    <div
      className="stat-card-dash dash-count"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--neutral-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        animationDelay: `${0.05 + delay * 0.08}s`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
          backgroundColor: accentColor === 'var(--accent-green)' ? 'var(--accent-green-light)' : 'var(--primary-blue-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--neutral-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '3px' }}>
        {sub}
      </div>
    </div>
  );
}
