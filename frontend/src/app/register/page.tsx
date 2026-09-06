'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconArrowLeft,
  IconCheckCircle,
  IconAlertTriangle,
  IconShieldCheck,
  IconCamera,
  IconClock,
  IconRefresh,
  IconCheck,
  IconCoins,
  IconFlask,
  IconSurvey,
  IconUsers,
  IconSparkles,
} from '@/components/Icons';

export default function RegisterPage() {
  const router = useRouter();

  // Steps: 'form' | 'otp' | 'success'
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Unified Account Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Preference focus (unified account, sets default view)
  const [primaryFocus, setPrimaryFocus] = useState<'respondent' | 'researcher'>('respondent');

  // Mandatory UU PDP Consents (§4.5 & §0)
  const [ageConsent, setAgeConsent] = useState(false);
  const [pdpGeneralConsent, setPdpGeneralConsent] = useState(false);

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#E2E8F0', width: '0%' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Lemah', color: '#EF4444', width: '33%' };
    } else if (score <= 3) {
      return { score: 2, label: 'Cukup', color: '#F59E0B', width: '66%' };
    } else {
      return { score: 3, label: 'Kuat & Aman', color: '#1C9A5B', width: '100%' };
    }
  }, [password]);

  // Handle local avatar photo upload simulation
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Harap lengkapi seluruh kolom data akun Anda.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    if (!ageConsent) {
      setErrorMsg('Pendaftar wajib menyatakan berumur 18 tahun atau lebih (mandat batas usia UU PDP No. 27/2022).');
      return;
    }

    if (!pdpGeneralConsent) {
      setErrorMsg('Persetujuan pemrosesan data pribadi wajib disetujui sesuai regulasi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          primary_focus: primaryFocus,
          age_declared_18plus: true,
        }),
      });

      if (res.ok) {
        setStep('otp');
        startOtpTimer();
      } else {
        // prototype fallback
        setStep('otp');
        startOtpTimer();
      }
    } catch {
      setStep('otp');
      startOtpTimer();
    } finally {
      setLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtpCountdown(60);
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Masukkan kode verifikasi OTP 4 digit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: email, code: otpCode }),
      });
    } catch {
      // offline prototype fallback
    }

    // Save unified user session to localStorage
    localStorage.setItem('access_token', 'token_registered_' + Date.now());
    localStorage.setItem('user_name', name.trim());
    localStorage.setItem('user_role', primaryFocus);
    localStorage.setItem('user_email', email.trim().toLowerCase());
    if (avatarPreview) {
      localStorage.setItem('user_avatar', avatarPreview);
    }

    setLoading(false);
    setStep('success');

    setTimeout(() => {
      if (primaryFocus === 'researcher') {
        router.push('/dashboard');
      } else {
        router.push('/feed');
      }
    }, 1600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        color: '#0F172A',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '14px 24px',
          boxShadow: '0 1px 3px rgba(11, 46, 99, 0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={32} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>Sudah memiliki akun?</span>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '8px',
                color: 'var(--primary-blue)',
                borderColor: '#D1E3FC',
              }}
            >
              Masuk Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: '36px 20px 60px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1140px',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 440px) minmax(360px, 1fr)',
            gap: '32px',
            alignItems: 'start',
          }}
          className="register-split-container"
        >
          {/* LEFT SIDE: Brand Showcase & Value Proposition */}
          <aside
            style={{
              backgroundColor: '#0B2E63',
              borderRadius: '24px',
              padding: '40px 32px',
              color: '#FFFFFF',
              boxShadow: '0 12px 36px -4px rgba(11, 46, 99, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '620px',
            }}
            className="register-left-panel"
          >
            {/* Background Ambient Glows */}
            <div
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(27, 111, 224, 0.45) 0%, rgba(27, 111, 224, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-60px',
                left: '-60px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(28, 154, 91, 0.35) 0%, rgba(28, 154, 91, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Compliance Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#E0EEFD',
                  marginBottom: '24px',
                }}
              >
                <IconShieldCheck size={16} color="#38BDF8" />
                <span>Patuh Regulasi UU PDP No. 27/2022</span>
              </div>

              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  marginBottom: '14px',
                  color: '#FFFFFF',
                }}
              >
                Satu Akun Fleksibel untuk Peneliti & Responden
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: '#CBD5E1',
                  marginBottom: '32px',
                }}
              >
                Bebas beralih kapan saja antara mempublikasikan survei riset ilmiah atau menghasilkan pendapatan tambahan dari menjawab kuesioner.
              </p>

              {/* Feature Highlights with SVG Icons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(27, 111, 224, 0.25)',
                      border: '1px solid rgba(27, 111, 224, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60A5FA',
                      flexShrink: 0,
                    }}
                  >
                    <IconFlask size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                      Distribusi Survei Terarah
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Filter responden akurat berdasarkan demografi, domisili, usia, dan bidang pekerjaan.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(28, 154, 91, 0.25)',
                      border: '1px solid rgba(28, 154, 91, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4ADE80',
                      flexShrink: 0,
                    }}
                  >
                    <IconCoins size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                      Pencairan Saldo Dompet Instan
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Tarik reward tunai langsung ke GoPay, OVO, DANA, ShopeePay atau Rekening Bank.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(245, 158, 11, 0.25)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FBBF24',
                      flexShrink: 0,
                    }}
                  >
                    <IconShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                      Verifikasi & Enkripsi Berlapis
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Data jawaban responden dianonimkan dengan algoritma pembersihan respons bot otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Metrics */}
            <div
              style={{
                marginTop: '36px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>15.000+</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Responden Aktif</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#38BDF8' }}>99.8%</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Akurasi Data</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ADE80' }}>4.9 / 5.0</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Kepuasan Peneliti</div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Interactive Registration Card */}
          <div
            className="card"
            style={{
              padding: '36px 36px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px -2px rgba(11, 46, 99, 0.08), 0 1px 3px rgba(11, 46, 99, 0.04)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Step Stepper Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: step === 'form' ? 'var(--primary-blue)' : '#E2E8F0',
                    color: step === 'form' ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {step !== 'form' ? <IconCheck size={14} color="#1C9A5B" strokeWidth={3} /> : '1'}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: step === 'form' ? 700 : 500,
                    color: step === 'form' ? '#0F172A' : '#64748B',
                  }}
                >
                  Data Akun
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: step === 'otp' || step === 'success' ? 'var(--primary-blue)' : '#E2E8F0',
                  margin: '0 12px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: step === 'otp' ? 'var(--primary-blue)' : step === 'success' ? '#1C9A5B' : '#F1F5F9',
                    color: step === 'otp' || step === 'success' ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {step === 'success' ? <IconCheck size={14} color="#FFFFFF" strokeWidth={3} /> : '2'}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: step === 'otp' ? 700 : 500,
                    color: step === 'otp' ? '#0F172A' : '#64748B',
                  }}
                >
                  Verifikasi OTP
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: step === 'success' ? '#1C9A5B' : '#E2E8F0',
                  margin: '0 12px',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: step === 'success' ? '#1C9A5B' : '#F1F5F9',
                    color: step === 'success' ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  3
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: step === 'success' ? 700 : 500,
                    color: step === 'success' ? '#0F172A' : '#64748B',
                  }}
                >
                  Selesai
                </span>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#EF4444',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                }}
              >
                <IconAlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Peringatan Pendaftaran:</strong> {errorMsg}
                </div>
              </div>
            )}

            {/* STEP 1: FORM */}
            {step === 'form' && (
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <h1
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.02em',
                      marginBottom: '6px',
                    }}
                  >
                    Buat Akun ResponKu
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B' }}>
                    Daftar gratis dalam 2 menit. Mulai riset atau kumpulkan penghasilan survei Anda.
                  </p>
                </div>

                {/* Focus Preference Selector (Interactive Cards) */}
                <div style={{ marginBottom: '22px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px',
                    }}
                  >
                    Tujuan Utama Pendaftaran
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setPrimaryFocus('respondent')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: primaryFocus === 'respondent' ? '2px solid var(--primary-blue)' : '1px solid #E2E8F0',
                        backgroundColor: primaryFocus === 'respondent' ? 'var(--primary-blue-light)' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <IconSurvey size={16} color={primaryFocus === 'respondent' ? 'var(--primary-blue)' : '#64748B'} />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: primaryFocus === 'respondent' ? 'var(--primary-blue)' : '#0F172A',
                          }}
                        >
                          Responden
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                        Isi survei & kumpulkan insentif saldo tunai
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrimaryFocus('researcher')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: primaryFocus === 'researcher' ? '2px solid var(--primary-blue)' : '1px solid #E2E8F0',
                        backgroundColor: primaryFocus === 'researcher' ? 'var(--primary-blue-light)' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <IconFlask size={16} color={primaryFocus === 'researcher' ? 'var(--primary-blue)' : '#64748B'} />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: primaryFocus === 'researcher' ? 'var(--primary-blue)' : '#0F172A',
                          }}
                        >
                          Peneliti / Riset
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                        Publikasi kuesioner & kumpulkan responden
                      </div>
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                    *Akun tetap memiliki akses penuh ke kedua fitur dan dapat beralih peran kapan saja.
                  </div>
                </div>

                {/* Avatar Photo Upload Widget */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid var(--primary-blue)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-blue)',
                      flexShrink: 0,
                    }}
                  >
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Preview Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <IconUser size={26} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="avatar-upload-file"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--primary-blue)',
                      }}
                    >
                      <IconCamera size={15} />
                      <span>{avatarPreview ? 'Ganti Foto Profil' : 'Pasang Foto Profil (Opsional)'}</span>
                    </label>
                    <input
                      id="avatar-upload-file"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      Format JPG, PNG, atau WebP (Maks 2MB)
                    </div>
                  </div>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Nama Lengkap */}
                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#334155',
                    }}
                  >
                    Nama Lengkap Sesuai Identitas
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        display: 'flex',
                        pointerEvents: 'none',
                      }}
                    >
                      <IconUser size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Andhika Pratama"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 42px',
                        fontSize: '14px',
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                </div>

                {/* Grid Alamat Email & WhatsApp */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                    marginBottom: '18px',
                  }}
                  className="register-grid-2col"
                >
                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      Alamat Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8',
                          display: 'flex',
                          pointerEvents: 'none',
                        }}
                      >
                        <IconMail size={18} />
                      </span>
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 42px',
                          fontSize: '14px',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      Nomor WhatsApp Aktif
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8',
                          display: 'flex',
                          pointerEvents: 'none',
                        }}
                      >
                        <IconPhone size={18} />
                      </span>
                      <input
                        type="tel"
                        placeholder="081234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 42px',
                          fontSize: '14px',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password with Strength Meter */}
                <div style={{ marginBottom: '22px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#334155',
                    }}
                  >
                    Kata Sandi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                        display: 'flex',
                        pointerEvents: 'none',
                      }}
                    >
                      <IconLock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 44px 11px 42px',
                        fontSize: '14px',
                        borderRadius: '10px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '6px',
                      }}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div
                        style={{
                          height: '5px',
                          width: '100%',
                          backgroundColor: '#E2E8F0',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          marginBottom: '4px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: passwordStrength.width,
                            backgroundColor: passwordStrength.color,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#64748B' }}>Kekuatan sandi:</span>
                        <span style={{ fontWeight: 700, color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mandatori UU PDP Cards (Sleek custom interactive boxes, no ugly browser checkboxes) */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <IconShieldCheck size={14} color="var(--primary-blue)" />
                    <span>Persetujuan Regulasi & Batas Usia</span>
                  </div>

                  {/* Consent 1: Usia 18+ */}
                  <div
                    onClick={() => setAgeConsent(!ageConsent)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: ageConsent ? '#EDF4FE' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: ageConsent ? '2px solid var(--primary-blue)' : '2px solid #CBD5E1',
                        backgroundColor: ageConsent ? 'var(--primary-blue)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {ageConsent && <IconCheck size={13} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                      Saya menyatakan telah berumur <strong>18 tahun atau lebih</strong> sesuai mandat batas usia responden (UU PDP No. 27/2022).
                    </span>
                  </div>

                  {/* Consent 2: PDP */}
                  <div
                    onClick={() => setPdpGeneralConsent(!pdpGeneralConsent)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: pdpGeneralConsent ? '#EDF4FE' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: pdpGeneralConsent ? '2px solid var(--primary-blue)' : '2px solid #CBD5E1',
                        backgroundColor: pdpGeneralConsent ? 'var(--primary-blue)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {pdpGeneralConsent && <IconCheck size={13} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                      Saya menyetujui pemrosesan data pribadi untuk verifikasi riset dan menerima{' '}
                      <Link href="/support" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'underline' }}>
                        Syarat & Ketentuan Layanan
                      </Link>{' '}
                      ResponKu.
                    </span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(27, 111, 224, 0.35)',
                  }}
                >
                  {loading ? 'Memproses Data...' : 'Lanjut ke Verifikasi OTP'}
                  {!loading && <IconArrowRight size={17} />}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{ padding: '12px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      border: '1px solid #D1E3FC',
                    }}
                  >
                    <IconMail size={28} />
                  </div>

                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Verifikasi Email Anda
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                    Kode verifikasi 4-digit telah dikirimkan ke alamat email{' '}
                    <strong style={{ color: '#0F172A' }}>{email}</strong>
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    marginBottom: '24px',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                    }}
                  >
                    Masukkan 4 Digit Kode OTP
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    style={{
                      textAlign: 'center',
                      fontSize: '28px',
                      fontWeight: 800,
                      letterSpacing: '12px',
                      padding: '12px 16px',
                      width: '240px',
                      margin: '0 auto',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid var(--primary-blue)',
                      color: '#0F172A',
                      boxShadow: '0 0 0 4px rgba(27, 111, 224, 0.1)',
                    }}
                  />

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#94A3B8',
                      marginTop: '12px',
                    }}
                  >
                    (Mode simulasi: Masukkan sembarang 4 angka, e.g. <strong style={{ color: '#0F172A' }}>1234</strong>)
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#64748B',
                    marginBottom: '28px',
                  }}
                >
                  <IconClock size={16} />
                  <span>
                    Kirim ulang kode dalam{' '}
                    <strong style={{ color: otpCountdown > 0 ? 'var(--primary-blue)' : '#EF4444' }}>
                      {otpCountdown} detik
                    </strong>
                  </span>
                  {otpCountdown === 0 && (
                    <button
                      type="button"
                      onClick={startOtpTimer}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-blue)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        marginLeft: '6px',
                      }}
                    >
                      Kirim Sekarang
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '13px', borderRadius: '12px', fontWeight: 600 }}
                  >
                    <IconArrowLeft size={16} />
                    Ubah Data
                  </button>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 4}
                    className="btn btn-primary"
                    style={{
                      flex: 2,
                      padding: '13px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(27, 111, 224, 0.3)',
                    }}
                  >
                    {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
                    {!loading && <IconArrowRight size={16} />}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#E4F5EC',
                    color: '#1C9A5B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    boxShadow: '0 0 0 8px rgba(28, 154, 91, 0.12)',
                  }}
                >
                  <IconCheckCircle size={42} strokeWidth={2.5} />
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Pendaftaran Berhasil!
                </h2>

                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                  Selamat datang di ResponKu, <strong style={{ color: '#0F172A' }}>{name}</strong>. Akun terpadu Anda telah aktif dengan akses penuh.
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    backgroundColor: '#F1F5F9',
                    fontSize: '13px',
                    color: '#475569',
                    marginBottom: '28px',
                  }}
                >
                  <IconSparkles size={16} color="var(--primary-blue)" />
                  <span>
                    Mode Awal:{' '}
                    <strong>{primaryFocus === 'researcher' ? 'Peneliti Riset' : 'Responden Survei'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (primaryFocus === 'researcher') {
                        router.push('/dashboard');
                      } else {
                        router.push('/feed');
                      }
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: '13px 28px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    Buka Halaman Sekarang
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global CSS Responsive Helpers for Registration */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .register-split-container {
            grid-template-columns: 1fr !important;
          }
          .register-left-panel {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .register-grid-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
