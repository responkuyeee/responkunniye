'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatNumber } from '@/utils/format';
import {
  IconFlask,
  IconSurvey,
  IconCheckCircle,
  IconShieldCheck,
  IconActivity,
  IconCoins,
  IconWallet,
  IconLock,
  IconArrowRight,
  IconClock,
  IconUsers,
  IconFileSpreadsheet,
  IconSliders,
  IconZap,
} from '@/components/Icons';

export default function HomePage() {

  // Simulator State
  const [respondentCount, setRespondentCount] = useState<number>(100);
  const [durationMinutes, setDurationMinutes] = useState<number>(7);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Kalkulasi Transparan Rupiah
  const rewardPerPerson = Math.max(1200, Math.round(durationMinutes * 200));
  const totalCost = respondentCount * rewardPerPerson;
  const respondentTakeHome = Math.round(rewardPerPerson * 0.8);

  const faqs = [
    {
      q: 'Berapa lama kuesioner saya bisa terisi penuh?',
      a: 'Rata-rata 100 responden terpenuhi dalam waktu kurang dari 24 jam. Kuesioner Anda langsung tayang otomatis ke feed mahasiswa aktif begitu dipublikasikan.',
    },
    {
      q: 'Bagaimana ResponKu mencegah jawaban asal-asalan (bot / speeding)?',
      a: 'Setiap pengisian diaudit oleh sistem anti-bot: deteksi kecepatan isi (anti-speeding), jebakan uji perhatian (attention check), dan deteksi pola jawaban seragam (straight-lining). Respon yang tidak valid otomatis ditolak.',
    },
    {
      q: 'Berapa minimal penarikan reward dan ke mana saja?',
      a: 'Bisa ditarik mulai dari Rp20.000 langsung ke GoPay, OVO, DANA, ShopeePay, atau rekening bank (BCA, Mandiri, BRI). Diproses dalam waktu maksimal 24 jam.',
    },
    {
      q: 'Apakah saya bisa pakai satu akun untuk sebar kuesioner sekaligus cari cuan?',
      a: 'Bisa! Cukup satu akun. Anda bisa sebar kuesioner skripsi saat butuh responden, dan mengisi survei orang lain saat senggang untuk mengumpulkan reward.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Paramitha',
      role: 'Mahasiswi Manajemen',
      campus: 'Universitas Indonesia',
      initials: 'SP',
      quote: '150 responden skripsi terkumpul cuma dalam 8 jam. Datanya rapi, bersih, dan langsung bisa di-run di SPSS!',
    },
    {
      name: 'Dimas Arya',
      role: 'Mahasiswa Informatika',
      campus: 'Institut Teknologi Bandung',
      initials: 'DA',
      quote: 'Lumayan banget, seminggu dapat Rp75.000 cuma dari luangkan 10 menit jawab survei di sela-sela kelas.',
    },
    {
      name: 'Dr. Rian Wibowo',
      role: 'Dosen Pembimbing',
      campus: 'Universitas Gadjah Mada',
      initials: 'RW',
      quote: 'Attention check otomatisnya efektif menyaring jawaban asal. Dataset hasil akhirnya memenuhi syarat uji validitas.',
    },
    {
      name: 'Nabila Azzahra',
      role: 'Mahasiswi Psikologi',
      campus: 'Universitas Airlangga',
      initials: 'NA',
      quote: 'Simulasi biayanya transparan dari awal. Tidak ada biaya tersembunyi, dan pencairan uang saku sangat lancar.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      <Navbar variant="landing" />

      {/* ============================================================ */}
      {/* 2. HERO SECTION — Punchy, Scannable & High Conversion        */}
      {/* ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderBottom: '1px solid var(--neutral-border)',
          padding: '64px 0 60px 0',
        }}
      >
        <div className="container">
          <div className="grid-hero">
            {/* Left Hero Content */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge-pill badge-pill-blue" style={{ fontSize: '12px', fontWeight: 700, padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <IconZap size={13} color="var(--primary-blue)" />
                  <span>Platform Kuesioner Mahasiswa No. 1 di Indonesia</span>
                </span>
              </div>

              <h1
                className="hero-heading"
                style={{
                  fontSize: '44px',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'var(--primary-blue-dark)',
                  marginBottom: '18px',
                }}
              >
                Sebar Kuesioner Skripsi <span style={{ color: 'var(--primary-blue)' }}>Cepat & Valid</span>. Atau Isi Survei, <span style={{ color: 'var(--accent-green)' }}>Dapat Cuan</span>.
              </h1>

              <p
                className="hero-subheading"
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--neutral-text-muted)',
                  marginBottom: '30px',
                  maxWidth: '520px',
                }}
              >
                Kumpulkan 100+ responden presisi tanpa spam grup WA dan bebas bot. Atau luangkan 5 menit isi kuesioner, reward langsung cair ke GoPay, OVO, atau rekening.
              </p>

              {/* Dual Action CTAs */}
              <div className="hero-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{
                    padding: '13px 26px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <IconFlask size={17} />
                  <span>Sebar Kuesioner Sekarang</span>
                </Link>

                <Link
                  href="/feed"
                  className="btn btn-action"
                  style={{
                    padding: '13px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <IconSurvey size={17} />
                  <span>Isi Survei & Cuan</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                className="hero-trust"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--neutral-text)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCheckCircle size={15} color="var(--accent-green)" />
                  100% Anti-Bot
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCheckCircle size={15} color="var(--accent-green)" />
                  Cair Instan E-Wallet
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCheckCircle size={15} color="var(--accent-green)" />
                  Siap Olah SPSS & Excel
                </span>
              </div>
            </div>

            {/* Right Hero Interactive Preview */}
            <div>
              <div
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-card-hover)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Header Mockup */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                      Survei Siap Dikerjakan
                    </span>
                  </div>
                  <span className="badge-pill badge-pill-green" style={{ fontSize: '11px' }}>
                    Cocok Profil Kampus
                  </span>
                </div>

                {/* Sample Survey Card */}
                <div
                  style={{
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px',
                    backgroundColor: '#FAFCFF',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', lineHeight: 1.4 }}>
                      Preferensi Penggunaan Dompet Digital di Kalangan Mahasiswa
                    </h3>
                    <span className="badge badge-cyan" style={{ fontSize: '10px', flexShrink: 0 }}>Finansial</span>
                  </div>

                  {/* Reward & Duration */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span className="badge-pill badge-pill-green" style={{ fontSize: '13px', fontWeight: 700, padding: '3px 10px' }}>
                      Reward: Rp1.600
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>• ~7 Menit</span>
                  </div>

                  {/* Quota Progress */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--neutral-text-muted)' }}>Progress:</span>
                      <strong style={{ color: 'var(--neutral-text)' }}>82 / 100 terisi (82%)</strong>
                    </div>
                    <div className="progress-bar-track" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: '82%', backgroundColor: 'var(--primary-blue)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconShieldCheck size={14} color="var(--accent-green)" />
                      Mahasiswa Terverifikasi
                    </span>
                    <Link
                      href="/feed"
                      className="btn btn-action"
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Mulai Kerjakan</span>
                      <IconArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div
                  style={{
                    backgroundColor: 'var(--neutral-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconWallet size={18} color="var(--accent-green)" />
                    <span style={{ fontSize: '12px', color: 'var(--neutral-text)' }}>Rata-rata reward responden:</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)' }}>Rp50.000 / minggu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. STATS STRIP — Ringkas & Meyakinkan                        */}
      {/* ============================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          padding: '28px 0',
        }}
      >
        <div className="container">
          <div className="grid-stats">
            <div style={{ borderRight: '1px solid var(--neutral-border)' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-blue-dark)' }}>
                10.000+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginTop: '2px' }}>
                Responden Aktif
              </div>
              <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                Dari 100+ kampus di Indonesia
              </div>
            </div>

            <div style={{ borderRight: '1px solid var(--neutral-border)' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                &lt; 24 Jam
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginTop: '2px' }}>
                Kuota Terpenuhi
              </div>
              <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                Target 100 responden tuntas
              </div>
            </div>

            <div style={{ borderRight: '1px solid var(--neutral-border)' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--neutral-text)' }}>
                100%
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginTop: '2px' }}>
                Bebas Bot & Speeding
              </div>
              <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                Uji perhatian & durasi valid
              </div>
            </div>

            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-green)' }}>
                Rp850 Jt+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginTop: '2px' }}>
                Reward Dicairkan
              </div>
              <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                Via GoPay, OVO, DANA & Bank
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CARA KERJA — 3 Langkah Ringkas untuk Kedua Sisi           */}
      {/* ============================================================ */}
      <section id="cara-kerja" style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="badge-pill badge-pill-blue" style={{ marginBottom: '10px' }}>
              Alur Sangat Simpel
            </span>
            <h2 className="heading-page" style={{ fontSize: '30px', marginBottom: '8px' }}>
              Cara Kerja ResponKu
            </h2>
            <p className="text-meta" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '14px' }}>
              Pilih kebutuhanmu: kumpulkan responden untuk skripsi, atau isi survei saat senggang untuk tambah uang saku.
            </p>
          </div>

          <div className="grid-2col">
            {/* Sisi 1: Punya Kuesioner Skripsi */}
            <div className="card" style={{ padding: '30px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-blue)',
                  }}
                >
                  <IconFlask size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                    Punya Kuesioner Skripsi?
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                    Untuk mahasiswa akhir, dosen & periset
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Susun Soal Kuesioner
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Buat pertanyaan pilihan ganda atau skala Likert dengan cepat. Tentukan kriteria responden (jurusan, semester, atau domisili).
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Tentukan Target & Reward
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Pilih berapa banyak responden yang kamu butuhkan. Dana reward diamankan otomatis dan hanya cair ke respon yang valid.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Unduh Dataset Siap Olah
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Jawaban bot disaring otomatis. Ekspor data lengkap format CSV/Excel yang rapi dan siap diolah langsung di SPSS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi 2: Mau Tambah Uang Saku */}
            <div className="card" style={{ padding: '30px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-green-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-green)',
                  }}
                >
                  <IconSurvey size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                    Mau Tambah Uang Saku?
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                    Untuk mahasiswa & siapa saja yang ingin reward
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green-light)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Pilih Survei yang Cocok
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Buka katalog survei. Sistem otomatis menampilkan daftar kuesioner yang sesuai dengan profil dan jurusan kampusmu.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green-light)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Jawab Jujur & Teliti
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Luangkan 3–10 menit untuk mengisi survei. Pastikan membaca soal dengan cermat dan tidak asal klik.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green-light)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '3px' }}>
                      Tarik Saldo Instan
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                      Reward langsung masuk ke saldo dompetmu. Tarik kapan saja ke GoPay, OVO, DANA, atau rekening bank.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. KEUNGGULAN — Bento Cards Ringkas & Visual                 */}
      {/* ============================================================ */}
      <section
        id="keunggulan"
        style={{
          borderTop: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          padding: '64px 0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="badge-pill badge-pill-blue" style={{ marginBottom: '10px' }}>
              Bebas Repot
            </span>
            <h2 className="heading-page" style={{ fontSize: '30px', marginBottom: '8px' }}>
              Kenapa Pilih ResponKu?
            </h2>
            <p className="text-meta" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '14px' }}>
              Tinggalkan cara lama sebar link di grup chat yang lambat dan penuh jawaban asal.
            </p>
          </div>

          <div className="grid-3col">
            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', marginBottom: '14px' }}>
                <IconShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                100% Anti-Bot & Anti-Speeding
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Algoritma kami otomatis menyaring responden yang menjawab terburu-buru atau mengisi pilihan seragam (straight-lining).
              </p>
            </div>

            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', marginBottom: '14px' }}>
                <IconActivity size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                Tayang Cepat Tanpa Antre
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Kuesionermu langsung muncul ke ribuan responden terverifikasi begitu dipasang. Rata-rata terisi penuh dalam &lt; 24 jam.
              </p>
            </div>

            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', marginBottom: '14px' }}>
                <IconFileSpreadsheet size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                Dataset Siap Olah SPSS
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Unduh hasil dalam format Excel/CSV dengan penomoran variabel yang rapi, siap untuk uji validitas dan reliabilitas.
              </p>
            </div>

            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', marginBottom: '14px' }}>
                <IconWallet size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                Pencairan Reward Fleksibel
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Tarik uang sakumu langsung ke GoPay, OVO, DANA, ShopeePay, atau rekening bank favoritmu kapan saja.
              </p>
            </div>

            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', marginBottom: '14px' }}>
                <IconUsers size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                Target Mahasiswa Presisi
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Pilih target responden berdasarkan jurusan, fakultas, gender, usia, atau universitas tertentu sesuai kriteria risetmu.
              </p>
            </div>

            <div className="card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', marginBottom: '14px' }}>
                <IconLock size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '8px' }}>
                Privasi Terlindungi (UU PDP)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                Data pribadi responden disamarkan dan dilindungi sesuai ketentuan UU Perlindungan Data Pribadi No. 27/2022.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SIMULASI BIAYA & REWARD — Bersih & Transparan             */}
      {/* ============================================================ */}
      <section id="simulator" style={{ padding: '64px 0', borderTop: '1px solid var(--neutral-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="badge-pill badge-pill-green" style={{ marginBottom: '10px' }}>
              Transparan Tanpa Biaya Tersembunyi
            </span>
            <h2 className="heading-page" style={{ fontSize: '30px', marginBottom: '8px' }}>
              Simulasi Biaya & Reward
            </h2>
            <p className="text-meta" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '14px' }}>
              Geser nilai untuk melihat estimasi biaya kuesioner dan reward yang diterima responden.
            </p>
          </div>

          <div className="grid-simulator">
            {/* Control Panel */}
            <div className="card" style={{ padding: '30px', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '24px' }}>
                Atur Kebutuhan Kuesionermu
              </h3>

              {/* Slider 1 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)' }}>Target Responden:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-blue)' }}>
                    {respondentCount} Orang
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={respondentCount}
                  onChange={(e) => setRespondentCount(Number(e.target.value))}
                  style={{ marginBottom: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                  <span>Min. 50</span>
                  <span>250</span>
                  <span>Maks. 500</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)' }}>Estimasi Waktu Pengisian:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--neutral-text)' }}>
                    {durationMinutes} Menit
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  style={{ marginBottom: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                  <span>Singkat (3 mnt)</span>
                  <span>Standar (10 mnt)</span>
                  <span>Komprehensif (20 mnt)</span>
                </div>
              </div>

              {/* Cost Summary Box */}
              <div
                style={{
                  backgroundColor: 'var(--neutral-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--neutral-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--neutral-text-muted)' }}>Alokasi per Responden:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                    Rp{formatNumber(rewardPerPerson)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '14px' }}>
                  <span style={{ color: 'var(--neutral-text-muted)' }}>Jumlah Responden:</span>
                  <span style={{ fontWeight: 700, color: 'var(--neutral-text)' }}>
                    {respondentCount} Orang
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--neutral-border)', marginBottom: '14px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>Total Biaya:</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-blue-dark)' }}>
                      Rp{formatNumber(totalCost)}
                    </div>
                  </div>
                  <Link href="/register" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>Pasang Kuesioner Ini</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Card: Preview Responden */}
            <div className="card" style={{ padding: '30px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <span className="badge-pill badge-pill-green">
                    Sisi Responden
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                    Tampilan di Feed
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '14px' }}>
                  Yang Dilihat Responden di Aplikasi:
                </h3>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)', lineHeight: 1.4 }}>
                      Survei Skripsi: Dampak E-Commerce Terhadap Kebiasaan Belanja
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge-pill badge-pill-green" style={{ fontSize: '13px', fontWeight: 800, padding: '3px 10px' }}>
                      Reward: Rp{formatNumber(respondentTakeHome)}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                      • ~{durationMinutes} Menit
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--neutral-text)', marginBottom: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconCheckCircle size={13} color="var(--accent-green)" />
                      100 Kuota Tersedia
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconShieldCheck size={13} color="var(--accent-green)" />
                      Verifikasi Kampus
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-border)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700 }}>
                      Langsung Masuk Saldo
                    </span>
                    <span className="btn btn-action" style={{ padding: '5px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>Kerjakan Survei</span>
                      <IconArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '14px 16px', backgroundColor: '#F1F6FD', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--primary-blue-dark)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <IconShieldCheck size={16} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Keadilan Bersama:</strong> Responden menerima reward transparan <strong>Rp{formatNumber(respondentTakeHome)}</strong> bersih per kuesioner yang berhasil diselesaikan dan lolos validasi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. TESTIMONI — Pengalaman Nyata Mahasiswa                    */}
      {/* ============================================================ */}
      <section
        id="testimoni"
        style={{
          borderTop: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          padding: '64px 0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="badge-pill badge-pill-blue" style={{ marginBottom: '10px' }}>
              Cerita Mahasiswa
            </span>
            <h2 className="heading-page" style={{ fontSize: '30px', marginBottom: '8px' }}>
              Dipercaya Mahasiswa & Dosen
            </h2>
            <p className="text-meta" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
              Pengalaman nyata dari mereka yang telah menggunakan ResponKu.
            </p>
          </div>

          <div className="grid-4col">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: idx % 2 === 0 ? 'var(--primary-blue-light)' : 'var(--accent-green-light)',
                        color: idx % 2 === 0 ? 'var(--primary-blue)' : 'var(--accent-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                        {t.name}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                        {t.role}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--neutral-text)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--neutral-border)' }}>
                  <span className="badge" style={{ fontSize: '10px' }}>
                    {t.campus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FAQ ACCORDION — To The Point                             */}
      {/* ============================================================ */}
      <section id="faq" style={{ padding: '64px 0', borderTop: '1px solid var(--neutral-border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge-pill badge-pill-blue" style={{ marginBottom: '10px' }}>
              Pertanyaan Umum
            </span>
            <h2 className="heading-page" style={{ fontSize: '28px', marginBottom: '8px' }}>
              FAQ ResponKu
            </h2>
            <p className="text-meta" style={{ fontSize: '14px' }}>
              Jawaban cepat seputar penyebaran kuesioner, validitas data, dan pencairan reward.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '18px 22px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    borderColor: isOpen ? 'var(--primary-blue)' : 'rgba(11, 46, 99, 0.08)',
                    boxShadow: isOpen ? '0 4px 16px rgba(27, 111, 224, 0.08)' : 'var(--shadow-card)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isOpen ? 'var(--primary-blue)' : 'var(--neutral-text)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.q}
                    </h3>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isOpen ? 'var(--primary-blue-light)' : 'var(--neutral-bg)',
                        color: isOpen ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {isOpen ? '−' : '+'}
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        marginTop: '12px',
                        fontSize: '13px',
                        color: 'var(--neutral-text-muted)',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--neutral-border)',
                        paddingTop: '12px',
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. CALL TO ACTION BANNER                                     */}
      {/* ============================================================ */}
      <section
        style={{
          backgroundColor: 'var(--primary-blue-dark)',
          padding: '64px 0',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '14px',
              color: '#FFFFFF',
            }}
          >
            Siap Selesaikan Skripsimu Lebih Cepat?
          </h2>

          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: '28px',
              color: '#CBD5E1',
            }}
          >
            Daftar sekarang dalam 1 menit. Kumpulkan responden valid tanpa ribet, atau mulai kumpulkan uang saku dari mengisi survei.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              href="/register"
              className="btn btn-action"
              style={{
                padding: '14px 32px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Mulai Sekarang — Gratis</span>
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
