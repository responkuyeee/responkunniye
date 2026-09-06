'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
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
  IconWallet,
  IconHelpCircle,
  IconArrowRight,
  IconSliders,
  IconActivity,
  IconSettings,
  IconLock,
  IconEye,
} from '@/components/Icons';

export default function FeedPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Budi Santoso');
  const [userEmail, setUserEmail] = useState('budi.santoso@example.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Auth Gate Modal State (untuk tamu/spy mode)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedSurveyForAuth, setSelectedSurveyForAuth] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');
        const storedAvatar = localStorage.getItem('user_avatar');
        if (storedName) setUserName(storedName);
        if (storedEmail) setUserEmail(storedEmail);
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleStartSurvey = (e: React.MouseEvent, survey: any) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setSelectedSurveyForAuth(survey);
      setAuthModalOpen(true);
    } else {
      router.push(`/research/${survey.id}`);
    }
  };

  const handleCreateResearchClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setSelectedSurveyForAuth(null);
      setAuthModalOpen(true);
    } else {
      router.push('/research/create');
    }
  };

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'fintech', label: 'Fintech & Dompet Digital' },
    { id: 'retail', label: 'Konsumen & Retail' },
    { id: 'tech', label: 'Teknologi & AI' },
    { id: 'education', label: 'Pendidikan & Kampus' },
    { id: 'lifestyle', label: 'Gaya Hidup & Kuliner' },
  ];

  const surveyFeed = [
    {
      id: 'res-1',
      title: 'Survei Preferensi Penggunaan Aplikasi Finansial & Dompet Digital 2026',
      description: 'Riset pola transaksi nontunai, fitur transfer instan, dan kebiasaan menabung generasi muda Indonesia untuk keperluan skripsi ekonomi.',
      category: 'fintech',
      categoryLabel: 'Fintech & Perbankan',
      rewardToken: 1.6,
      rewardIdr: 1600,
      durationMinutes: 8,
      quotaCurrent: 82,
      quotaTotal: 100,
      deadline: '2 hari lagi',
      matchScore: '99% Cocok',
      verifiedInstitution: 'Fakultas Ekonomi UI',
    },
    {
      id: 'res-2',
      title: 'Survei Kebiasaan Belanja Online Mingguan Produk Kebutuhan Rumah',
      description: 'Menganalisis frekuensi checkout, pertimbangan gratis ongkir, dan pemilihan promo flash sale mahasiswa & keluarga muda.',
      category: 'retail',
      categoryLabel: 'Konsumen & Retail',
      rewardToken: 1.2,
      rewardIdr: 1200,
      durationMinutes: 6,
      quotaCurrent: 38,
      quotaTotal: 50,
      deadline: 'Besok, 23:59 WIB',
      matchScore: '96% Cocok',
      verifiedInstitution: 'SBM ITB',
    },
    {
      id: 'res-3',
      title: 'Adopsi Alat AI Generatif dalam Produktivitas Tugas & Riset Akademik',
      description: 'Kuesioner evaluasi pemanfaatan ChatGPT, Claude, dan Gemini untuk penyusunan laporan serta dampaknya terhadap orisinalitas karya tulis.',
      category: 'tech',
      categoryLabel: 'Teknologi & AI',
      rewardToken: 2.0,
      rewardIdr: 2000,
      durationMinutes: 10,
      quotaCurrent: 145,
      quotaTotal: 200,
      deadline: '3 hari lagi',
      matchScore: '94% Cocok',
      verifiedInstitution: 'Fasilkom UI',
    },
    {
      id: 'res-4',
      title: 'Evaluasi Pembelajaran Hybrid & Kesiapan Ujian Akhir Semester Mahasiswa',
      description: 'Studi komparasi efektivitas kuliah tatap muka langsung vs kelas daring interaktif terhadap indeks prestasi kumulatif (IPK).',
      category: 'education',
      categoryLabel: 'Pendidikan & Kampus',
      rewardToken: 0.8,
      rewardIdr: 800,
      durationMinutes: 5,
      quotaCurrent: 64,
      quotaTotal: 80,
      deadline: '4 hari lagi',
      matchScore: '98% Cocok',
      verifiedInstitution: 'Universitas Gadjah Mada',
    },
    {
      id: 'res-5',
      title: 'Pola Konsumsi Kopi Susu Kekinian & Loyalitas Brand di Kalangan Gen-Z',
      description: 'Survei faktor pemilihan kafe (WiFi, stopkontak, suasana, rasa) sebagai tempat belajar & nongkrong mahasiswa Jabodetabek.',
      category: 'lifestyle',
      categoryLabel: 'Gaya Hidup & Kuliner',
      rewardToken: 1.0,
      rewardIdr: 1000,
      durationMinutes: 5,
      quotaCurrent: 180,
      quotaTotal: 200,
      deadline: '5 hari lagi',
      matchScore: '92% Cocok',
      verifiedInstitution: 'Universitas Padjadjaran',
    },
  ];

  const filteredSurveys = surveyFeed.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.verifiedInstitution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* ============================================================ */}
      {/* 2. MAIN FEED LAYOUT                                          */}
      {/* ============================================================ */}
      <main className="container" style={{ paddingTop: '28px', paddingBottom: '60px', flex: 1 }}>
        {/* Banner Sapaan (Personal vs Guest) */}
        {isLoggedIn ? (
          <div
            className="card card-banner"
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F6FD 100%)',
              borderColor: '#D1E3FC',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '11px', fontWeight: 700 }}>
                    <IconCheckCircle size={13} />
                    <span>Akun Aktif & Terverifikasi</span>
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Quality Score: 98%
                  </span>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                  Halo, {userName.split(' ')[0]}! Siap Mengumpulkan Cuan Hari Ini?
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--neutral-text-muted)', maxWidth: '640px', lineHeight: 1.5 }}>
                  Pilih survei terverifikasi dari berbagai kampus, jawab pertanyaan dengan jujur, dan terima saldo reward langsung ke dompetmu.
                </p>
              </div>

              <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/dashboard"
                  className="btn btn-secondary mobile-full-width"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  <IconActivity size={15} />
                  <span>Dashboard Saya</span>
                </Link>
                <Link
                  href="/research/create"
                  className="btn btn-primary mobile-full-width"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  <IconPlus size={15} />
                  <span>Sebar Kuesioner</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="card card-banner"
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F6FD 100%)',
              borderColor: '#D1E3FC',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px' }}>
              <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <IconEye size={13} color="var(--primary-blue)" /> Mode Pratinjau (Tamu)
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                    Hanya Dapat Melihat Daftar Kuesioner
                  </span>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                  Katalog Kuesioner Aktif ResponKu
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--neutral-text-muted)', maxWidth: '640px', lineHeight: 1.5 }}>
                  Anda sedang melihat kuesioner aktif dari berbagai kampus. Untuk mulai mengisi kuesioner, mengumpulkan saldo reward, atau memasang riset skripsi, silakan buat akun atau masuk.
                </p>
              </div>

              <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  href="/login"
                  className="btn btn-secondary mobile-full-width"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary mobile-full-width"
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
                >
                  Daftar Akun Gratis →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter Kategori Chips */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '24px',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? 'var(--primary-blue)' : 'var(--neutral-border)',
                backgroundColor: selectedCategory === cat.id ? 'var(--primary-blue)' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--neutral-text)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Feed Survei (Kiri) + Widget Dompet/Info (Kanan) */}
        <div className="grid-feed">
          {/* KOLOM KIRI: LIST KUESIONER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                Tersedia {filteredSurveys.length} Kuesioner
              </span>
              <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                Diurutkan berdasarkan rekomendasi
              </span>
            </div>

            {filteredSurveys.map((survey) => {
              const quotaPercent = Math.round((survey.quotaCurrent / survey.quotaTotal) * 100);

              return (
                <div
                  key={survey.id}
                  className="card"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box',
                    minWidth: 0,
                  }}
                >
                  {/* Top Header Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {survey.categoryLabel}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', fontWeight: 500 }}>
                        oleh <strong>{survey.verifiedInstitution}</strong>
                      </span>
                    </div>

                    <span className="badge badge-emerald" style={{ fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      <IconShieldCheck size={13} />
                      <span>{survey.matchScore}</span>
                    </span>
                  </div>

                  {/* Survey Title */}
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px', lineHeight: 1.4, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {survey.title}
                  </h3>

                  {/* Survey Description */}
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5, marginBottom: '16px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {survey.description}
                  </p>

                  {/* Metadata Chips: Reward, Duration, Deadline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {/* Reward Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--accent-green-light)',
                        border: '1px solid #C3EAD5',
                        borderRadius: 'var(--radius-pill)',
                        padding: '6px 12px',
                      }}
                    >
                      <IconToken size={15} color="var(--accent-green)" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
                        Reward: Rp{formatNumber(survey.rewardIdr)}
                      </span>
                    </div>

                    {/* Duration Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--neutral-bg)',
                        border: '1px solid var(--neutral-border)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '6px 12px',
                        fontSize: '12px',
                        color: 'var(--neutral-text)',
                        fontWeight: 600,
                      }}
                    >
                      <IconClock size={14} color="var(--neutral-text-muted)" />
                      <span>~{survey.durationMinutes} Menit</span>
                    </div>

                    {/* Deadline Pill */}
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--neutral-text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      Batas pengisian: <strong>{survey.deadline}</strong>
                    </div>
                  </div>

                  {/* Quota Progress Bar & Action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--neutral-border)',
                      paddingTop: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ color: 'var(--neutral-text-muted)' }}>Kuota Terkumpul</span>
                        <strong>{survey.quotaCurrent} / {survey.quotaTotal} Responden ({quotaPercent}%)</strong>
                      </div>
                      <div className="progress-bar-track" style={{ height: '6px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${quotaPercent}%`,
                            backgroundColor: quotaPercent > 80 ? 'var(--warning)' : 'var(--primary-blue)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Button Action */}
                    {isLoggedIn ? (
                      <Link
                        href={`/research/${survey.id}`}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '11px 20px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: 'var(--shadow-button)',
                        }}
                      >
                        <span>Mulai Isi Kuesioner</span>
                        <IconArrowRight size={14} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleStartSurvey(e, survey)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '11px 20px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: 'var(--shadow-button)',
                        }}
                      >
                        <IconLock size={14} />
                        <span>Mulai Isi Kuesioner</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* KOLOM KANAN: SIDEBAR WIDGET */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isLoggedIn ? (
              <>
                {/* Widget Saldo Dompet */}
                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--accent-green-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-green)',
                      }}
                    >
                      <IconWallet size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Saldo Dompet Anda</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)' }}>
                        Rp32.000 <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--neutral-text-muted)' }}>(32.0 Token)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href="/wallet"
                      className="btn btn-action"
                      style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '12px' }}
                    >
                      Tarik Saldo
                    </Link>
                    <Link
                      href="/wallet"
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '12px' }}
                    >
                      Riwayat
                    </Link>
                  </div>
                </div>

                {/* Widget Quality Control Info */}
                <div className="card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <IconShieldCheck size={18} color="var(--accent-green)" />
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                      Integritas Akun Anda
                    </h4>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    Skor Anda saat ini <strong>98%</strong>. Jawaban yang lolos audit otomatis akan langsung cair setelah masa hold 24 jam.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheckCircle size={14} color="var(--accent-green)" />
                      <span>Hindari menjawab terlalu cepat (anti-speeding)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheckCircle size={14} color="var(--accent-green)" />
                      <span>Waspadai pertanyaan jebakan (attention check)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCheckCircle size={14} color="var(--accent-green)" />
                      <span>Jangan memilih opsi yang sama terus-menerus</span>
                    </div>
                  </div>
                </div>

                {/* Banner Sebar Kuesioner */}
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--primary-blue-light)',
                    borderColor: '#BFDBFE',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue-dark)', marginBottom: '6px' }}>
                    Butuh Responden untuk Skripsi Anda?
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--neutral-text)', lineHeight: 1.4, marginBottom: '12px' }}>
                    Satu akun ResponKu juga bisa digunakan untuk membuat kuesioner baru dan merekrut ratusan responden terverifikasi.
                  </p>
                  <Link
                    href="/research/create"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '9px 12px', fontSize: '13px' }}
                  >
                    + Sebar Kuesioner Baru
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Guest Restricted Card */}
                <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px auto',
                    }}
                  >
                    <IconLock size={22} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                    Akses Terbatas (Tamu)
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                    Fitur dompet saldo, pengisian kuesioner, dasbor riset, dan pencairan reward hanya tersedia untuk pengguna yang telah memiliki akun.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                      href="/register"
                      className="btn btn-primary"
                      style={{ justifyContent: 'center', padding: '10px', fontSize: '13px', fontWeight: 700 }}
                    >
                      Daftar Sekarang (Gratis)
                    </Link>
                    <Link
                      href="/login"
                      className="btn btn-secondary"
                      style={{ justifyContent: 'center', padding: '10px', fontSize: '13px' }}
                    >
                      Sudah Punya Akun? Masuk
                    </Link>
                  </div>
                </div>

                {/* Quick Benefits Card */}
                <div className="card" style={{ padding: '20px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '12px' }}>
                    Keuntungan Punya Akun:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--neutral-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconCheckCircle size={15} color="var(--accent-green)" />
                      <span>Dapat reward Rp1.000–Rp20.000 / survei</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconCheckCircle size={15} color="var(--accent-green)" />
                      <span>Tarik dana instan ke E-Wallet & Bank</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconCheckCircle size={15} color="var(--accent-green)" />
                      <span>Bisa sebar kuesioner skripsi sendiri</span>
                    </div>
                  </div>
                </div>

                {/* CTA Sebar Kuesioner (Buka Modal Auth) */}
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--primary-blue-light)',
                    borderColor: '#BFDBFE',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue-dark)', marginBottom: '6px' }}>
                    Punya Kuesioner Skripsi?
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--neutral-text)', lineHeight: 1.4, marginBottom: '12px' }}>
                    Daftar akun gratis untuk menyebarkan kuesioner dan kumpulkan 100+ responden valid tanpa repot.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateResearchClick}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '9px 12px', fontSize: '13px' }}
                  >
                    + Sebar Kuesioner
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        survey={selectedSurveyForAuth}
      />
    </div>
  );
}
