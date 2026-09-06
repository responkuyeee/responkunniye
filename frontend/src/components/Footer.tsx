import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--neutral-border)',
        backgroundColor: '#FFFFFF',
        padding: '48px 0 24px 0',
        fontSize: '13px',
        color: 'var(--neutral-text-muted)',
      }}
    >
      <div className="container">
        <div className="grid-footer">
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <Logo height={32} />
            </Link>
            <p style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '260px' }}>
              Platform kuesioner mahasiswa Indonesia dengan filter anti-bot dan pencairan reward instan berbasis token.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '12px' }}>
              Sebar Kuesioner
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li><Link href="/research/create" style={{ color: 'inherit' }}>Buat Kuesioner</Link></li>
              <li><Link href="/#pricing" style={{ color: 'inherit' }}>Simulasi Biaya</Link></li>
              <li><Link href="/dashboard" style={{ color: 'inherit' }}>Dashboard Progres</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '12px' }}>
              Isi Survei & Reward
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li><Link href="/feed" style={{ color: 'inherit' }}>Jelajah Survei Aktif</Link></li>
              <li><Link href="/wallet" style={{ color: 'inherit' }}>Dompet & Saldo</Link></li>
              <li><Link href="/profile" style={{ color: 'inherit' }}>Verifikasi Mahasiswa</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '12px' }}>
              Bantuan & Privasi
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li><Link href="/support" style={{ color: 'inherit' }}>Pusat Bantuan</Link></li>
              <li><Link href="/settings" style={{ color: 'inherit' }}>Pengaturan Akun</Link></li>
              <li><span style={{ color: 'inherit' }}>Kepatuhan UU PDP RI</span></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--neutral-border)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--neutral-text-muted)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>© 2026 ResponKu. Hak cipta dilindungi undang-undang.</div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>Anti-Bot Verified</span>
            <span>•</span>
            <span>UU PDP Compliant</span>
            <span>•</span>
            <span>Pencairan Instan E-Wallet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
