'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { formatNumber } from '../utils/format';

type UserRole = 'researcher' | 'respondent';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('respondent'); // Default to feed per §2.3 / §3
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Buat Riset (Researcher)
  const [targetCount, setTargetCount] = useState<number>(50);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [surveyUrl, setSurveyUrl] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(10);

  // Prohibited Keywords List (Content Moderation otomatis)
  const PROHIBITED_KEYWORDS = ['judi', 'slot', 'gacor', 'taruhan', 'porn', 'bokep', 'penipuan', 'narkoba', 'cheat', 'scam'];
  const detectedKeyword = PROHIBITED_KEYWORDS.find(kw =>
    new RegExp(`\\b${kw}\\b`, 'i').test(`${surveyTitle} ${surveyDesc}`)
  );

  // Form Profil & Consent (UU PDP)
  const [religion, setReligion] = useState('Islam');
  const [religionConsent, setReligionConsent] = useState(true);
  const [dataShareConsent, setDataShareConsent] = useState(true);
  const [termsConsent, setTermsConsent] = useState(true);
  const [domicileCity, setDomicileCity] = useState('Jakarta Selatan');
  const [gpsStatus, setGpsStatus] = useState<string | null>('Terverifikasi (Jakarta Selatan)');

  // Kalkulasi Biaya Real-Time
  const tokenPrice = 1000;
  const calculatedTokens = Math.max(50, targetCount);
  const calculatedCostIdr = calculatedTokens * tokenPrice;
  const respondentPoolIdr = calculatedCostIdr * 0.8;
  const platformFeeIdr = calculatedCostIdr * 0.2;

  const handleGpsVerify = () => {
    setGpsStatus('Mendeteksi GPS...');
    setTimeout(() => {
      setGpsStatus('Terverifikasi: Lat -6.2088, Lng 106.8456 (Jakarta Selatan)');
    }, 600);
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
      status: 'Selesai (Kuota Penuh)',
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      {/* Top Navigation — Sesuai design.md §2.3 & §3 */}
      <header
        style={{
          background: 'var(--neutral-white)',
          borderBottom: '1px solid var(--neutral-border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Sisi Kiri: Logo & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '500px' }}>
            <Link href="/" title="Beranda ResponKu" style={{ display: 'flex', alignItems: 'center' }}>
              <Logo height={34} />
            </Link>

            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <input
                type="text"
                placeholder="Cari research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  fontSize: '13px',
                  background: 'var(--neutral-bg)',
                  borderColor: 'var(--neutral-border)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-text-muted)',
                  fontSize: '13px',
                }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* Sisi Tengah / Kanan: Mode Switcher Instan (Elemen Paling Penting Sesuai §3 & §4.1) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--neutral-bg)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid var(--neutral-border)',
            }}
          >
            <button
              type="button"
              id="role-toggle-respondent"
              onClick={() => setRole('respondent')}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: role === 'respondent' ? 600 : 500,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: role === 'respondent' ? 'var(--accent-green)' : 'transparent',
                color: role === 'respondent' ? '#FFFFFF' : 'var(--neutral-text-muted)',
              }}
            >
              Mode Responden
            </button>
            <button
              type="button"
              id="role-toggle-researcher"
              onClick={() => setRole('researcher')}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: role === 'researcher' ? 600 : 500,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: role === 'researcher' ? 'var(--primary-blue)' : 'transparent',
                color: role === 'researcher' ? '#FFFFFF' : 'var(--neutral-text-muted)',
              }}
            >
              Mode Peneliti
            </button>
          </div>

          {/* Sisi Kanan: Notifikasi, Dompet & Profil Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/wallet"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              title="Dompet Token"
            >
              🪙 Saldo: <strong style={{ color: 'var(--accent-green)', marginLeft: '4px' }}>32.0</strong>
            </Link>

            <button
              onClick={() => setShowProfileModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              title="Pengaturan Profil & Kepatuhan Data Pribadi"
            >
              👤 Profil
            </button>

            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-blue)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              B
            </div>
          </div>
        </div>
      </header>

      {/* Main Container 3 Kolom — Sesuai design.md §2.3, §2.4, & §3 */}
      <div className="container" style={{ padding: '24px 20px', flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr 280px',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* ============================================================ */}
          {/* KOLOM KIRI (Profil Ringkas & Status)                          */}
          {/* ============================================================ */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Kartu Profil Ringkas */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#EDF4FE',
                    color: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    border: '1px solid #D1E3FC',
                  }}
                >
                  BS
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--neutral-text)' }}>Budi Santoso</div>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Jakarta Selatan, DKI</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {role === 'respondent' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Reputasi Akun:</span>
                      {/* Sesuai §4.6: Quality score TIDAK ditampilkan sebagai angka mentah, melainkan kualitatif */}
                      <span className="badge badge-emerald" title="Tingkat akurasi jawaban konsisten">
                        Baik (Terpercaya)
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Saldo Reward:</span>
                      <strong style={{ color: 'var(--accent-green)' }}>Rp32.000</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Masa Hold:</span>
                      <span style={{ color: 'var(--warning)', fontSize: '12px' }}>4.8 Token (24 jam)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Saldo Token:</span>
                      <strong style={{ color: 'var(--primary-blue)' }}>250 Token</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Riset Aktif:</span>
                      <span>2 Proyek</span>
                    </div>
                    <Link
                      href="/wallet"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '6px', padding: '8px 12px', fontSize: '13px' }}
                    >
                      + Top Up Saldo Token
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Menu Pintasan Kiri */}
            <div className="card" style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Navigasi Cepat
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <li>
                  <Link href="/wallet" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-text)', padding: '6px 0' }}>
                    🪙 Dompet & Pencairan Dana
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-text)', padding: '6px 0', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}
                  >
                    🛡️ Verifikasi GPS & Privasi
                  </button>
                </li>
                <li>
                  <Link href="/support" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-text)', padding: '6px 0' }}>
                    ⚖️ Layanan Bantuan & Banding
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* KOLOM TENGAH (FEED UTAMA)                                     */}
          {/* ============================================================ */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Feed */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="heading-page">
                  {role === 'respondent' ? 'Research Tersedia' : 'Daftar Riset Saya'}
                </h1>
                <p className="text-meta" style={{ marginTop: '2px' }}>
                  {role === 'respondent'
                    ? 'Menampilkan survei yang cocok secara demografi dengan profil Anda.'
                    : 'Pantau pengumpulan responden dan kelola survei yang sedang berjalan.'}
                </p>
              </div>

              {role === 'researcher' && (
                <button
                  id="btn-create-research-top"
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  + Buat Research Baru
                </button>
              )}
            </div>

            {/* FEED: Mode Respondent */}
            {role === 'respondent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {researchFeed.map((item) => (
                  <div key={item.id} className="card" style={{ padding: '18px 20px' }}>
                    {/* Urutan Elemen Card Sesuai design.md §2.4:
                        1. Judul research
                        2. Reward per jawaban (angka hijau paling menonjol)
                        3. Meta: estimasi durasi, sisa kuota, deadline
                        4. Tombol aksi: "Kerjakan Survey" (bg accent-green) */}
                    
                    {/* 1. Judul Research */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                      <h2 className="heading-card" style={{ flex: 1 }}>
                        {item.title}
                      </h2>
                      <span className="badge" style={{ flexShrink: 0 }}>
                        {item.category}
                      </span>
                    </div>

                    {/* 2. Reward per jawaban (Paling menonjol setelah judul) */}
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>Reward:</span>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: 'var(--accent-green)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Rp{formatNumber(item.rewardIdr)}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                        ({item.rewardToken} Token)
                      </span>
                    </div>

                    {/* 3. Meta: estimasi durasi, sisa kuota, deadline */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '13px',
                        color: 'var(--neutral-text-muted)',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>⏱️ Durasi: <strong style={{ color: 'var(--neutral-text)' }}>~{item.durationMinutes} menit</strong></span>
                      <span>👥 Kuota: <strong style={{ color: 'var(--neutral-text)' }}>{item.quotaCurrent}/{item.quotaTotal} terisi</strong></span>
                      <span>📅 Batas Waktu: <strong style={{ color: 'var(--neutral-text)' }}>{item.deadline}</strong></span>
                    </div>

                    {/* 4. Tombol aksi: Kerjakan Survey */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-border)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                        ✓ Otomatis terverifikasi demografi
                      </span>
                      <button
                        onClick={() => alert(`Memulai pengerjaan: ${item.title}`)}
                        className="btn btn-action"
                        style={{ padding: '8px 20px' }}
                      >
                        Kerjakan Survey →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEED: Mode Researcher */}
            {role === 'researcher' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myResearches.map((item) => (
                  <div key={item.id} className="card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h2 className="heading-card">{item.title}</h2>
                        <div className="text-meta" style={{ marginTop: '2px' }}>Dibuat pada {item.createdAt}</div>
                      </div>
                      <span className={`badge ${item.statusColor}`}>{item.status}</span>
                    </div>

                    {/* Progress Responden Sesuai §3 Mode Researcher */}
                    <div style={{ margin: '14px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--neutral-text-muted)' }}>Progress Responden:</span>
                        <strong>{item.filled} dari {item.target} kuota ({Math.round((item.filled / item.target) * 100)}%)</strong>
                      </div>
                      <div style={{ height: '6px', background: '#DFE4EA', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(item.filled / item.target) * 100}%`,
                            background: item.filled >= item.target ? 'var(--accent-green)' : 'var(--primary-blue)',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-border)', paddingTop: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                        Cadangan Token: <strong style={{ color: 'var(--neutral-text)' }}>{item.tokenReserved} Token</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => alert(`Mengunduh hasil CSV untuk ${item.title}`)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                        >
                          Ekspor CSV
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* ============================================================ */}
          {/* KOLOM KANAN (Widget Pendukung Sesuai §3)                      */}
          {/* ============================================================ */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {role === 'respondent' ? (
              <>
                {/* Ringkasan Saldo Token Sesuai §2.3 */}
                <div className="card">
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ringkasan Saldo
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>
                    Rp32.000
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '14px' }}>
                    Setara 32.0 Token (1 Token = Rp1.000)
                  </div>
                  <Link href="/wallet" className="btn btn-secondary" style={{ width: '100%', fontSize: '13px', padding: '8px' }}>
                    Buka Dompet / Tarik Dana
                  </Link>
                </div>

                {/* Widget Tips & Deadline */}
                <div className="card">
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                    Tips Menjaga Reputasi (Quality Score)
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                    Bacalah setiap pertanyaan survei dengan teliti. Hindari pengisian terlalu cepat (speeding) atau pola jawaban seragam (straight-lining) agar status Anda tetap <strong>Baik</strong>.
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 500 }}>
                    Status Akun: Terverifikasi Aktif
                  </div>
                </div>

                {/* Deadline Mendekat */}
                <div className="card" style={{ borderColor: '#F8E5B5', background: '#FFFDF7' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
                    ⏰ Deadline Mendekat
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--neutral-text)' }}>
                    Survei Kebutuhan Rumah Tangga ditutup dalam 24 jam.
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Tombol Buat Research Baru Paling Atas Sesuai §3 Mode Researcher */}
                <div className="card" style={{ textAlign: 'center', background: '#EDF4FE', borderColor: '#D1E3FC' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-blue-dark)', marginBottom: '6px' }}>
                    Butuh Data Cepat?
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '14px' }}>
                    Dapatkan responden terverifikasi dalam hitungan jam.
                  </p>
                  <button
                    id="btn-create-research-right"
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    + Buat Research Baru
                  </button>
                </div>

                {/* Standar Validitas Riset */}
                <div className="card">
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Standar Kuota & Akurasi
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    <li>✓ Minimal responden: 50 orang per kuesioner</li>
                    <li>✓ Otomatis terfilter domisili & GPS</li>
                    <li>✓ Deteksi bot & straight-lining otomatis</li>
                    <li>✓ Ekspor CSV bersih siap olah SPSS/Excel</li>
                  </ul>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL BUAT RESEARCH BARU (2 KOLOM SESUAI design.md §3)        */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 32, 58, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '14px' }}>
              <div>
                <h2 className="heading-page" style={{ fontSize: '20px' }}>Buat Research Baru</h2>
                <p className="text-meta">Publikasikan kuesioner Anda untuk responden terverifikasi.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--neutral-text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Layout 2 Kolom: Form di kiri, Ringkasan Biaya Sticky di kanan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Form Input Kiri */}
              <form
                id="form-create-research"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Riset berhasil dipublikasikan! Cadangan ${calculatedTokens} token dialokasikan.`);
                  setShowCreateModal(false);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                    Judul Research
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Riset Kepuasan Pengguna Dompet Digital"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    style={{
                      width: '100%',
                      borderColor: detectedKeyword ? 'var(--danger)' : 'var(--neutral-border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                    Deskripsi Singkat Riset
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jelaskan topik riset dan kriteria responden yang dicari..."
                    value={surveyDesc}
                    onChange={(e) => setSurveyDesc(e.target.value)}
                    style={{
                      width: '100%',
                      borderColor: detectedKeyword ? 'var(--danger)' : 'var(--neutral-border)',
                    }}
                  />
                </div>

                {/* Content Moderation Warning Sesuai §4.4 */}
                {detectedKeyword && (
                  <div
                    style={{
                      background: '#FDF0F0',
                      border: '1px solid #F8CECE',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      color: 'var(--danger)',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>Peringatan Kebijakan:</strong> Terdeteksi kata <code>&quot;{detectedKeyword}&quot;</code>. Hapus kata tersebut untuk melanjutkan.
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                    Tautan Survei (Google Form / Typeform)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://forms.gle/..."
                    value={surveyUrl}
                    onChange={(e) => setSurveyUrl(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                      Target Responden (Min. 50)
                    </label>
                    <input
                      type="number"
                      min={50}
                      required
                      value={targetCount}
                      onChange={(e) => setTargetCount(parseInt(e.target.value) || 0)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                      Estimasi Waktu (Menit)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 5)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={targetCount < 50 || Boolean(detectedKeyword)}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      opacity: targetCount < 50 || Boolean(detectedKeyword) ? 0.5 : 1,
                      cursor: targetCount < 50 || Boolean(detectedKeyword) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cadangkan Token & Publikasikan
                  </button>
                </div>
              </form>

              {/* Panel Ringkasan Biaya Live-Update Sticky Kanan Sesuai §3 & §4.2 */}
              <div
                style={{
                  background: 'var(--neutral-bg)',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: '6px',
                  padding: '18px',
                  position: 'sticky',
                  top: '10px',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '14px' }}>
                  Ringkasan Biaya Riset
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-text-muted)' }}>Target Responden:</span>
                    <strong>{targetCount} Orang</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-text-muted)' }}>Estimasi Durasi:</span>
                    <strong>{estimatedDuration} Menit</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-text-muted)' }}>Biaya per Responden:</span>
                    <span>🪙 1.0 Token (Rp1.000)</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--neutral-border)', margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)' }}>
                    <span>• Hak Responden (80%):</span>
                    <strong>Rp{formatNumber(respondentPoolIdr)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-text-muted)' }}>
                    <span>• Platform Fee (20%):</span>
                    <span>Rp{formatNumber(platformFeeIdr)}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--neutral-border)', margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-text)' }}>Total Deposit:</span>
                    <strong style={{ fontSize: '18px', color: 'var(--primary-blue-dark)' }}>
                      Rp{formatNumber(calculatedCostIdr)}
                    </strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', textAlign: 'right' }}>
                    (Setara {calculatedTokens} Token)
                  </div>
                </div>

                <div style={{ marginTop: '16px', background: 'var(--neutral-white)', border: '1px solid var(--neutral-border)', borderRadius: '4px', padding: '10px', fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.4 }}>
                  ℹ️ Token langsung dialokasikan dalam status <em>Reserve</em> dan hanya dipotong saat jawaban responden disetujui.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PROFIL & KEPATUHAN PDP (UU PDP §4.5)                   */}
      {/* ============================================================ */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 32, 58, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="heading-page" style={{ fontSize: '18px' }}>Profil & Kepatuhan Privasi (UU PDP)</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--neutral-text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                  Domisili Kota
                </label>
                <input
                  type="text"
                  value={domicileCity}
                  onChange={(e) => setDomicileCity(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Verifikasi GPS */}
              <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--neutral-border)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Verifikasi GPS Domisili</span>
                  <button onClick={handleGpsVerify} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                    Perbarui Lokasi
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>
                  {gpsStatus}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                  Agama (Data Pribadi Spesifik)
                </label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Sesuai §4.5: Consent checkbox terpisah dua baris berbeda, tidak digabung */}
              <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={religionConsent}
                    onChange={(e) => setReligionConsent(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    Saya memberikan persetujuan eksplisit untuk pemrosesan data agama saya khusus pencocokan riset demografis (UU PDP).
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dataShareConsent}
                    onChange={(e) => setDataShareConsent(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    Saya menyetujui data jawaban survei anonim dibagikan kepada peneliti terkait.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={termsConsent}
                    onChange={(e) => setTermsConsent(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    Saya menyetujui Syarat dan Ketentuan Layanan ResponKu.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
