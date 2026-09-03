'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './components/Logo';
import { formatNumber } from './utils/format';

export default function HomePage() {
  // State untuk Live Interactive Calculator
  const [respondentCount, setRespondentCount] = useState<number>(100);
  const [durationMinutes, setDurationMinutes] = useState<number>(7);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Kalkulasi Token & Rupiah
  const rewardPerRespondent = Math.max(10, Math.round(durationMinutes * 2));
  const totalTokens = respondentCount * rewardPerRespondent;
  const totalRupiah = totalTokens * 1000;
  const respondentEarning = Math.round(rewardPerRespondent * 0.8);
  const platformFee = rewardPerRespondent - respondentEarning;

  const faqs = [
    {
      q: 'Berapa jumlah minimum responden yang bisa saya rekrut?',
      a: 'Sesuai standar validitas riset platform, jumlah minimum target responden adalah 50 orang per kuesioner. Anda dapat menambah hingga ribuan responden sesuai kebutuhan.',
    },
    {
      q: 'Bagaimana sistem token & pembagian reward 80:20 bekerja?',
      a: '1 Token setara dengan Rp1.000. Saat riset dipublikasikan, token dialokasikan sebagai cadangan. Saat respon disetujui (Approved), 80% token otomatis cair ke wallet responden, dan 20% menjadi platform fee.',
    },
    {
      q: 'Bagaimana ResponKu menjamin kualitas jawaban responden?',
      a: 'Sistem dilengkapi Quality Control otomatis: verifikasi durasi minimum pengerjaan, deteksi jawaban seragam (straight-lining), uji perhatian (attention check), serta masa hold 24 jam sebelum reward cair.',
    },
    {
      q: 'Apakah satu akun bisa menjadi Peneliti sekaligus Responden?',
      a: 'Ya! ResponKu menggunakan sistem single-account dengan Multi-Role Dashboard. Anda cukup menggeser toggle switcher instan untuk berpindah antara Mode Researcher dan Mode Respondent.',
    },
    {
      q: 'Bagaimana metode penarikan dana (withdrawal)?',
      a: 'Saldo token dapat ditarik langsung ke rekening bank atau e-wallet (GoPay, OVO, Dana) kapan saja dengan konversi 1 Token = Rp1.000 dipotong biaya penarikan platform transparan sebesar 3%.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      {/* Global Header / Navigation — Bersih Sesuai design.md §2.1 */}
      <header
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          background: 'var(--neutral-white)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="container"
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Brand ResponKu dari Path /images/logo.png */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={38} />
          </Link>

          {/* Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '14px',
              color: 'var(--neutral-text-muted)',
            }}
          >
            <a href="#simulator" style={{ transition: 'color 0.15s' }}>Kalkulator</a>
            <a href="#fitur" style={{ transition: 'color 0.15s' }}>Standar Mutu</a>
            <a href="#alur" style={{ transition: 'color 0.15s' }}>Cara Kerja</a>
            <a href="#faq" style={{ transition: 'color 0.15s' }}>FAQ</a>
          </nav>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/wallet"
              className="badge badge-emerald"
              style={{ padding: '6px 12px', fontSize: '13px', textDecoration: 'none' }}
              title="1 Token = Rp1.000"
            >
              🪙 1 Token = Rp1.000
            </Link>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Masuk Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Bersih, Profesional, Left & Center Balanced */}
      <section style={{ padding: '64px 0 48px 0', borderBottom: '1px solid var(--neutral-border)', background: 'var(--neutral-white)' }}>
        <div className="container" style={{ maxWidth: '980px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <span className="badge">
              Platform Dua Sisi Berbasis Token Pertama di Indonesia
            </span>
          </div>

          <h1
            style={{
              fontSize: '38px',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--neutral-text)',
              marginBottom: '16px',
            }}
          >
            Hubungkan <span style={{ color: 'var(--primary-blue)' }}>Peneliti Presisi</span> dengan{' '}
            <span style={{ color: 'var(--accent-green)' }}>Responden Terverifikasi</span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--neutral-text-muted)',
              marginBottom: '32px',
              maxWidth: '720px',
              margin: '0 auto 32px auto',
              lineHeight: 1.6,
            }}
          >
            Dapatkan respon kuesioner valid dalam hitungan jam, bukan minggu. Didukung ledger token transparan, auto-screening anti-bot, dan pembagian reward 80% langsung ke responden.
          </p>

          {/* Dual Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '14px' }}>
              🔬 Mulai Buat Riset (Peneliti)
            </Link>
            <Link href="/dashboard" className="btn btn-action" style={{ padding: '12px 26px', fontSize: '14px' }}>
              📋 Jawab & Dapatkan Reward (Responden)
            </Link>
          </div>

          {/* Trust Points */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--neutral-text-muted)',
              paddingTop: '20px',
              borderTop: '1px solid var(--neutral-border)',
            }}
          >
            <span>✓ Auto-Publish Instan</span>
            <span>✓ Deteksi Straight-Lining & Bot</span>
            <span>✓ Penarikan Dana Transparan (3% Fee)</span>
            <span>✓ 1 Akun Dua Mode Instan</span>
          </div>
        </div>
      </section>

      {/* Social Proof / Metrics Row */}
      <section style={{ padding: '36px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '6px' }}>Responden Aktif</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--neutral-text)' }}>10.000+</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '4px' }}>Terverifikasi GPS & Demografi</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '6px' }}>Riset Selesai</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--primary-blue)' }}>1.450+</div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>Akademik, UMKM & Startup</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '6px' }}>Kecepatan Pemenuhan</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--neutral-text)' }}>&lt; 24 Jam</div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>Rata-rata 100 kuota terpenuhi</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '6px' }}>Total Reward Terdistribusi</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-green)' }}>Rp850 Juta+</div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>Dicairkan via Bank & E-Wallet</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Dual Simulator (Live Calculator & Card Preview Sesuai §3) */}
      <section id="simulator" style={{ padding: '48px 0', borderTop: '1px solid var(--neutral-border)', background: 'var(--neutral-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge" style={{ marginBottom: '8px' }}>Simulasi Dua Sisi Real-Time</span>
            <h2 className="heading-page" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Transparansi Anggaran untuk Peneliti dan Hak Responden
            </h2>
            <p className="text-meta" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '14px' }}>
              Geser penggeser di bawah untuk mensimulasikan anggaran riset Peneliti dan estimasi reward nyata yang diterima Responden.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Left: Researcher Live Budget Calculator */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="badge">
                    🔬 Sisi Peneliti (Researcher)
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>1 Token = Rp1.000</span>
                </div>

                <h3 className="heading-card" style={{ marginBottom: '20px' }}>
                  Kalkulator Anggaran Kuesioner
                </h3>

                {/* Slider 1: Jumlah Responden */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--neutral-text-muted)' }}>Target Jumlah Responden:</span>
                    <strong style={{ color: 'var(--neutral-text)', fontSize: '15px' }}>{respondentCount} Orang</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="25"
                    value={respondentCount}
                    onChange={(e) => setRespondentCount(Number(e.target.value))}
                    style={{ marginBottom: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                    <span>Min. 50</span>
                    <span>250</span>
                    <span>Maks. 500</span>
                  </div>
                </div>

                {/* Slider 2: Durasi */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--neutral-text-muted)' }}>Estimasi Waktu Pengerjaan:</span>
                    <strong style={{ color: 'var(--primary-blue)', fontSize: '15px' }}>{durationMinutes} Menit</strong>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    style={{ marginBottom: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                    <span>3 Menit</span>
                    <span>10 Menit</span>
                    <span>20 Menit</span>
                  </div>
                </div>
              </div>

              {/* Biaya Ringkasan */}
              <div
                style={{
                  background: 'var(--neutral-bg)',
                  borderRadius: '6px',
                  padding: '16px',
                  border: '1px solid var(--neutral-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--neutral-text-muted)' }}>Alokasi per Responden:</span>
                  <span>🪙 {rewardPerRespondent} Token (~Rp{rewardPerRespondent * 1000})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--neutral-text-muted)' }}>Total Cadangan Token:</span>
                  <span style={{ color: 'var(--primary-blue-dark)', fontWeight: 600 }}>🪙 {formatNumber(totalTokens)} Token</span>
                </div>
                <div style={{ height: '1px', background: 'var(--neutral-border)', marginBottom: '10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Total Biaya Riset</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                      Rp{formatNumber(totalRupiah)}
                    </div>
                  </div>
                  <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Pasang Riset →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Respondent Live Card Preview Sesuai §2.4 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="badge badge-emerald">
                    📋 Sisi Responden (Respondent)
                  </span>
                  <span className="badge">
                    Match 100% Profil
                  </span>
                </div>

                <h3 className="heading-card" style={{ marginBottom: '6px' }}>
                  Tampilan Research Card di Feed Responden
                </h3>
                <p className="text-meta" style={{ marginBottom: '18px' }}>
                  Struktur card persis seperti yang dilihat responden di halaman feed utamanya.
                </p>

                {/* Research Card Preview Persis Sesuai §2.4 */}
                <div
                  style={{
                    background: 'var(--neutral-white)',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: '6px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 className="heading-card" style={{ fontSize: '15px' }}>
                      Preferensi Penggunaan Aplikasi Finansial 2026
                    </h4>
                    <span className="badge">Survei Konsumen</span>
                  </div>

                  {/* Reward Hijau Menonjol Sesuai §2.4 */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
                    <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Reward:</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>
                      Rp{formatNumber(respondentEarning * 1000)}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                      ({respondentEarning} Token)
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '12px' }}>
                    Kuesioner terkait kebiasaan menabung dan investasi generasi produktif di kota-kota besar.
                  </p>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '14px' }}>
                    <span>⏱️ ~{durationMinutes} Menit</span>
                    <span>👥 34 / {respondentCount} terisi</span>
                    <span>🛡️ Hold 24 Jam (Aman)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-border)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--accent-green)' }}>Split 80% Hak Responden</span>
                    <button className="btn btn-action" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      Kerjakan Survey →
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginTop: '16px', lineHeight: 1.5 }}>
                💡 <strong>Keadilan Transaksi:</strong> Responden menerima <strong>Rp{formatNumber(respondentEarning * 1000)}</strong> per pengisian secara transparan. Saldo dapat ditarik ke rekening bank atau e-wallet kapan saja.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Standar Mutu Platform */}
      <section id="fitur" style={{ padding: '56px 0', borderTop: '1px solid var(--neutral-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge" style={{ marginBottom: '8px' }}>Standar Mutu Platform</span>
            <h2 className="heading-page" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Keunggulan Arsitektur ResponKu
            </h2>
            <p className="text-meta" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '14px' }}>
              Dirancang untuk menghilangkan kendala riset konvensional: responden fiktif, data lambat, dan biaya tidak transparan.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🎯</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Verifikasi GPS & Demografi Presisi</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Filter responden berbasis usia (18+), domisili aktual dengan verifikasi GPS, dan screening bersyarat agar target 100% tepat sasaran.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>⚡</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Auto-Publish Tanpa Antrean</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Begitu token dicadangkan, kuesioner Anda langsung tayang otomatis dengan filter konten cerdas tanpa birokrasi manual.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🛡️</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Deteksi Anti-Bot & Straight-Lining</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Algoritma QC otomatis memantau durasi pengerjaan, jawaban seragam, dan attention check untuk menjamin integritas data kuesioner.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🪙</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Ledger Transparan & Split 80:20</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Setiap mutasi token tercatat dalam buku besar append-only. Responden berhak atas 80% reward yang aman cair setelah masa hold 24 jam.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>💳</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Pencairan Fleksibel Bank & E-Wallet</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Tarik saldo ke BCA, Mandiri, GoPay, OVO, atau Dana kapan saja dengan potongan fee penarikan transparan sebesar 3%.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>🔒</div>
              <h3 className="heading-card" style={{ marginBottom: '6px' }}>Kepatuhan Privasi Data (UU PDP)</h3>
              <p className="text-meta" style={{ lineHeight: 1.5 }}>
                Persetujuan eksplisit untuk data sensitif (agama, domisili) dipisahkan secara tegas dari syarat & ketentuan umum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Kerja 3 Langkah */}
      <section id="alur" style={{ padding: '56px 0', borderTop: '1px solid var(--neutral-border)', background: 'var(--neutral-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge" style={{ marginBottom: '8px' }}>Alur Penggunaan</span>
            <h2 className="heading-page" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Bagaimana Alur Kerja di ResponKu?
            </h2>
            <p className="text-meta" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '14px' }}>
              Memangkas waktu operasional pengumpulan responden hingga 80% lebih cepat dibanding cara konvensional.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Alur Peneliti */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="badge">Alur Peneliti (Researcher)</span>
                <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>3 Langkah Mudah</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#EDF4FE', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Buat Kuesioner & Kriteria</h4>
                    <p className="text-meta">Masukkan link Google Form/Typeform dan tetapkan target responden (min. 50 orang).</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#EDF4FE', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Cadangkan Token & Auto-Publish</h4>
                    <p className="text-meta">Biaya terhitung transparan. Riset otomatis aktif dan didistribusikan ke responden yang cocok.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#EDF4FE', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Pantau Progress & Ekspor CSV</h4>
                    <p className="text-meta">Lihat perkembangan responden secara live dan unduh dataset bersih siap analisis.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alur Responden */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="badge badge-emerald">Alur Responden (Respondent)</span>
                <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>3 Langkah Menghasilkan</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--accent-green-light)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Pilih Riset yang Cocok</h4>
                    <p className="text-meta">Feed hanya menampilkan survei yang sesuai dengan profil dan verifikasi domisili Anda.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--accent-green-light)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Isi Jawaban Secara Jujur</h4>
                    <p className="text-meta">Selesaikan kuesioner dengan cermat tanpa terburu-buru untuk menjaga reputasi akun.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--accent-green-light)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>Terima Reward & Tarik Dana</h4>
                    <p className="text-meta">Reward otomatis masuk ke saldo token setelah masa hold 24 jam dan siap ditarik ke bank.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '56px 0', borderTop: '1px solid var(--neutral-border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="badge" style={{ marginBottom: '8px' }}>Pertanyaan Umum</span>
            <h2 className="heading-page" style={{ fontSize: '26px', marginBottom: '8px' }}>
              Kerap Ditanyakan (FAQ)
            </h2>
            <p className="text-meta">
              Hal-hal penting seputar operasional platform ResponKu.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderColor: isOpen ? 'var(--primary-blue)' : 'var(--neutral-border)',
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: isOpen ? 'var(--primary-blue)' : 'var(--neutral-text)' }}>
                      {item.q}
                    </h4>
                    <span style={{ fontSize: '16px', color: 'var(--neutral-text-muted)' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--neutral-border)', paddingTop: '10px' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Bersih & Sederhana */}
      <footer
        style={{
          borderTop: '1px solid var(--neutral-border)',
          background: 'var(--neutral-white)',
          padding: '40px 0 24px 0',
          fontSize: '13px',
          color: 'var(--neutral-text-muted)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ marginBottom: '12px' }}>
                <Logo height={30} />
              </div>
              <p style={{ lineHeight: 1.5, fontSize: '13px' }}>
                Marketplace dua sisi riset kuesioner berbasis token terverifikasi di Indonesia.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '10px' }}>Navigasi Platform</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link href="/dashboard" style={{ color: 'var(--neutral-text-muted)' }}>Dashboard Multi-Role</Link></li>
                <li><Link href="/wallet" style={{ color: 'var(--neutral-text-muted)' }}>Dompet & Saldo Token</Link></li>
                <li><Link href="/support" style={{ color: 'var(--neutral-text-muted)' }}>Pusat Bantuan & Banding</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '10px' }}>Panel Admin</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link href="/admin/quality" style={{ color: 'var(--neutral-text-muted)' }}>Admin Quality Control</Link></li>
                <li><Link href="/admin/finance" style={{ color: 'var(--neutral-text-muted)' }}>Admin Finance & Penarikan</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '10px' }}>Nilai Tukar Token</div>
              <div style={{ background: 'var(--neutral-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--neutral-border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Kurs Tetap:</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-green)' }}>1 Token = Rp1.000</div>
                <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '2px' }}>Biaya penarikan 3%</div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--neutral-border)',
              paddingTop: '20px',
              fontSize: '12px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>© 2026 ResponKu (Marketplace Responden). Seluruh hak cipta dilindungi.</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span>Desain Sesuai design.md</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-green)' }}>● Sistem Operasional Aktif</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
