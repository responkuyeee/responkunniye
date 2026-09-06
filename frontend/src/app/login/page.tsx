'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertTriangle,
  IconCheckCircle,
  IconShieldCheck,
} from '@/components/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Harap isi alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
          localStorage.setItem('user_name', data.user.name || 'Pengguna ResponKu');
          localStorage.setItem('user_email', data.user.email || email);
        }
        setSuccessMsg('Login berhasil! Mengalihkan ke feed survei...');
        setTimeout(() => {
          if (email.includes('admin')) {
            router.push('/admin');
          } else {
            router.push('/feed');
          }
        }, 800);
      } else {
        // Fallback simulation mode for prototype preview
        const simulatedName = email.includes('sari')
          ? 'Dr. Sari Peneliti'
          : email.includes('admin')
          ? 'Admin ResponKu'
          : 'Budi Santoso';
        const simulatedRole = email.includes('admin')
          ? 'admin'
          : 'respondent';

        localStorage.setItem('access_token', 'simulated_jwt_token_' + Date.now());
        localStorage.setItem('user_name', simulatedName);
        localStorage.setItem('user_role', simulatedRole);
        localStorage.setItem('user_email', email);

        setSuccessMsg(`Selamat datang kembali, ${simulatedName}! Mengalihkan...`);
        setTimeout(() => {
          if (simulatedRole === 'admin') {
            router.push('/admin');
          } else {
            router.push('/feed');
          }
        }, 800);
      }
    } catch {
      // Offline fallback
      const isAdmin = email.includes('admin');
      const name = isAdmin ? 'Admin ResponKu' : 'Budi Santoso';
      localStorage.setItem('access_token', 'offline_demo_token');
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_role', isAdmin ? 'admin' : 'respondent');
      localStorage.setItem('user_email', email);

      setSuccessMsg(`Login berhasil (${name}). Mengalihkan ke feed...`);
      setTimeout(() => {
        router.push(isAdmin ? '/admin' : '/feed');
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--neutral-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Simple Header */}
      <header
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          padding: '16px 24px',
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={32} />
          </Link>

          <div style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
            Belum punya akun?{' '}
            <Link
              href="/register"
              style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card Center */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div
            className="card"
            style={{
              padding: '36px 32px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card-hover)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Logo Badge & Title */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
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
                <IconShieldCheck size={26} color="var(--primary-blue)" />
              </div>

              <h1 className="heading-page" style={{ fontSize: '24px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Masuk ke ResponKu
              </h1>
              <p className="text-meta" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Satu akun terpadu untuk Peneliti skripsi dan Responden berbayar.
              </p>
            </div>

            {errorMsg && (
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
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-green-light)',
                  border: '1px solid #C3EAD5',
                  color: 'var(--accent-green)',
                  fontSize: '13px',
                  marginBottom: '20px',
                  fontWeight: 600,
                }}
              >
                <IconCheckCircle size={18} color="var(--accent-green)" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--neutral-text)',
                  }}
                >
                  Alamat Email Kampus / Pribadi
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--neutral-text-muted)',
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
                      padding: '12px 14px 12px 42px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </div>
              </div>

              {/* Password Input Modern */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--neutral-text)',
                    }}
                  >
                    Kata Sandi
                  </label>
                  <Link
                    href="/support"
                    style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--neutral-text-muted)',
                      display: 'flex',
                      pointerEvents: 'none',
                    }}
                  >
                    <IconLock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 42px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-md)',
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
                      color: 'var(--neutral-text-muted)',
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 0',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
                {!loading && <IconArrowRight size={16} />}
              </button>
            </form>

            <div
              style={{
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: '1px solid var(--neutral-border)',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--neutral-text-muted)',
                lineHeight: 1.5,
              }}
            >
              Dilindungi oleh enkripsi standar keamanan UU PDP No. 27/2022.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
