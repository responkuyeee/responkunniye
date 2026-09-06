'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import {
  IconArrowLeft,
  IconClock,
  IconShieldCheck,
  IconToken,
  IconCheckCircle,
  IconAlertTriangle,
  IconBuilding,
  IconExternalLink,
  IconSurvey,
  IconHelpCircle,
  IconLock,
} from '@/components/Icons';
import { formatNumber, formatToken } from '@/utils/format';

interface ResearchDetail {
  id: string;
  title: string;
  researcherName: string;
  institution: string;
  description: string;
  rewardToken: number;
  rewardIdr: number;
  estimatedDurationMinutes: number;
  minDurationSeconds: number;
  targetCriteria: string;
  surveyUrl: string;
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const researchId = (params?.id as string) || 'rs-01';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setTimeout(() => {
          router.push(`/login?redirect=/research/${researchId}`);
        }, 1500);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router, researchId]);

  // State
  const [research, setResearch] = useState<ResearchDetail>({
    id: researchId,
    title: 'Evaluasi Dampak Regulasi AI pada Pengambilan Keputusan Klinis',
    researcherName: 'Dr. Sari Peneliti, Ph.D',
    institution: 'Pusat Studi Informatika Medis Universitas Indonesia',
    description:
      'Penelitian independen untuk memetakan kesiapan tenaga kesehatan dan akademisi dalam memanfaatkan algoritma asistensi diagnostik di fasilitas layanan primer dan rujukan.',
    rewardToken: 15,
    rewardIdr: 15000,
    estimatedDurationMinutes: 10,
    minDurationSeconds: 15, // 15 detik untuk simulasi pengerjaan
    targetCriteria: 'Berumur 18+ tahun, berdomisili di Indonesia, memiliki pemahaman dasar tentang teknologi medis.',
    surveyUrl: 'https://forms.gle/demo-survey-responku',
  });

  // Anti-Speeding Timer (§4.3)
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Attention Check (§4.3)
  const [attentionAnswer, setAttentionAnswer] = useState('');
  const [attentionError, setAttentionError] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const canSubmit = secondsElapsed >= research.minDurationSeconds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attentionAnswer !== 'valid') {
      setAttentionError(true);
      return;
    }
    setAttentionError(false);
    setSubmitting(true);

    setTimeout(() => {
      setTimerActive(false);
      setSubmitting(false);
      setIsCompleted(true);
    }, 1000);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <IconLock size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
            Pengisian Kuesioner Terkunci
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Untuk mengisi kuesioner dan menerima kompensasi reward, Anda perlu masuk ke akun terlebih dahulu. Mengalihkan ke halaman login...
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href={`/login?redirect=/research/${researchId}`} className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1080px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard">
              <Logo height={30} />
            </Link>
            <span style={{ height: '16px', width: '1px', backgroundColor: 'var(--neutral-border)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)' }}>
              Pengisian Kuesioner Riset
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Anti-Speeding Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: canSubmit ? 'var(--accent-green-light)' : 'var(--primary-blue-light)',
                border: `1px solid ${canSubmit ? '#C3EAD5' : '#D1E3FC'}`,
                color: canSubmit ? 'var(--accent-green)' : 'var(--primary-blue)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <IconClock size={14} />
              <span>Durasi: {formatTimer(secondsElapsed)}</span>
              {canSubmit && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheckCircle size={13} color="var(--accent-green)" /> Lolos QC
                </span>
              )}
            </div>

            <Link
              href="/dashboard"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconArrowLeft size={14} />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ maxWidth: '880px', padding: '36px 20px', flex: 1 }}>
        {!isCompleted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Card */}
            <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '12px' }}>
                  Riset Terverifikasi
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--accent-green)',
                  }}
                >
                  <IconToken size={20} color="var(--accent-green)" />
                  <span>+{formatToken(research.rewardToken)} Token</span>
                  <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', fontWeight: 500 }}>
                    (~Rp{formatNumber(research.rewardIdr)})
                  </span>
                </div>
              </div>

              <h1 className="heading-page" style={{ fontSize: '24px', marginBottom: '10px', lineHeight: 1.3 }}>
                {research.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '18px' }}>
                <IconBuilding size={15} color="var(--primary-blue)" />
                <span style={{ fontWeight: 600, color: 'var(--neutral-text)' }}>{research.researcherName}</span>
                <span>•</span>
                <span>{research.institution}</span>
              </div>

              <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--neutral-text)', marginBottom: '24px' }}>
                {research.description}
              </p>

              <div
                style={{
                  background: 'var(--neutral-bg)',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--neutral-text-muted)', display: 'block', marginBottom: '4px' }}>Estimasi Waktu:</span>
                  <strong>{research.estimatedDurationMinutes} Menit</strong> (Batas acuan anti-speeding)
                </div>
                <div>
                  <span style={{ color: 'var(--neutral-text-muted)', display: 'block', marginBottom: '4px' }}>Kriteria Responden:</span>
                  <strong>{research.targetCriteria}</strong>
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <IconSurvey size={22} color="var(--primary-blue)" />
                <h2 className="heading-card" style={{ fontSize: '18px', margin: 0 }}>
                  Instruksi & Pengisian Kuesioner
                </h2>
              </div>

              <p className="text-body" style={{ color: 'var(--neutral-text-muted)', marginBottom: '24px' }}>
                Silakan buka tautan kuesioner resmi di bawah ini pada tab baru, jawab semua pertanyaan dengan teliti, kemudian selesaikan uji perhatian (*attention check*) di bagian bawah halaman ini.
              </p>

              <div style={{ marginBottom: '28px' }}>
                <a
                  href={research.surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '13px 24px',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Buka Form Kuesioner Resmi</span>
                  <IconExternalLink size={16} />
                </a>
              </div>

              {/* Attention Check Section (§4.3) */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    borderTop: '1px solid var(--neutral-border)',
                    paddingTop: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <IconShieldCheck size={18} color="var(--primary-blue)" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-text)' }}>
                      Uji Kualitas & Perhatian (Attention Check)
                    </span>
                  </div>
                  <p className="text-meta" style={{ fontSize: '13px', marginBottom: '16px' }}>
                    Untuk mencegah bot otomatis dan memastikan Quality Score Anda tetap <strong>Sangat Baik</strong>, silakan pilih opsi valid di bawah:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {[
                      { val: 'random_1', text: 'Saya hanya mengisi survei secara acak dan cepat' },
                      { val: 'valid', text: 'Saya membaca kuesioner ini dengan teliti dan jujur (Pilihan Valid)' },
                      { val: 'random_2', text: 'Saya menggunakan script bot otomatis untuk menjawab' },
                    ].map((opt) => (
                      <label
                        key={opt.val}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: attentionAnswer === opt.val ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                          backgroundColor: attentionAnswer === opt.val ? 'var(--primary-blue-light)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontSize: '13px',
                          fontWeight: opt.val === 'valid' ? 600 : 400,
                        }}
                      >
                        <input
                          type="radio"
                          name="attention"
                          value={opt.val}
                          checked={attentionAnswer === opt.val}
                          onChange={(e) => setAttentionAnswer(e.target.value)}
                          style={{ accentColor: 'var(--primary-blue)' }}
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>

                  {attentionError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--danger-light)',
                        border: '1px solid #FECACA',
                        color: 'var(--danger)',
                        fontSize: '13px',
                        marginBottom: '20px',
                        fontWeight: 600,
                      }}
                    >
                      <IconAlertTriangle size={18} color="var(--danger)" />
                      <span>Jawaban Attention Check belum benar. Silakan pilih opsi valid sesuai instruksi.</span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  {!canSubmit ? (
                    <div style={{ fontSize: '13px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <IconClock size={16} />
                      <span>Tombol klaim aktif setelah durasi minimal: sisa {research.minDurationSeconds - secondsElapsed} detik</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <IconCheckCircle size={16} />
                      <span>Syarat durasi pengisian terpenuhi. Anda dapat mengirim jawaban.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || submitting || !attentionAnswer}
                    className="btn btn-action"
                    style={{
                      padding: '12px 28px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {submitting ? 'Mengirim Jawaban...' : 'Kirim Jawaban & Klaim Reward'}
                    {!submitting && <IconCheckCircle size={16} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="card" style={{ padding: '48px 32px', textAlign: 'center', borderRadius: 'var(--radius-2xl)' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green-light)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <IconCheckCircle size={40} />
            </div>

            <h2 className="heading-page" style={{ fontSize: '26px', marginBottom: '10px' }}>
              Jawaban Berhasil Diverifikasi!
            </h2>
            <p className="text-meta" style={{ fontSize: '14px', maxWidth: '520px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              Terima kasih telah berkontribusi secara teliti. Sistem screening otomatis telah meloloskan respon Anda.
            </p>

            <div
              style={{
                backgroundColor: 'var(--neutral-bg)',
                border: '1px solid var(--neutral-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '420px',
                margin: '0 auto 32px auto',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '6px' }}>
                Reward yang Diterima
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '6px' }}>
                +{formatToken(research.rewardToken)} Token
              </div>
              <div style={{ fontSize: '13px', color: 'var(--neutral-text)' }}>
                Setara Rp{formatNumber(research.rewardIdr)} telah dialokasikan ke dompet Anda
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '12px 26px' }}>
                Kembali ke Feed Riset
              </Link>
              <Link href="/wallet" className="btn btn-secondary" style={{ padding: '12px 26px' }}>
                Buka Dompet Saya
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
