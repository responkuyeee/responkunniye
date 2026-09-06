'use client';

import React from 'react';
import Link from 'next/link';
import { IconLock, IconCheckCircle, IconX } from './Icons';
import { formatNumber } from '../utils/format';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: {
    id: string;
    title: string;
    rewardIdr?: number;
  } | null;
}

export default function AuthModal({ isOpen, onClose, survey }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 46, 99, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-float)',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--neutral-text-muted)',
          }}
          aria-label="Tutup modal"
        >
          <IconX size={20} />
        </button>

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-green-light)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <IconLock size={24} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
          Akses Kuesioner Terkunci
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
          {survey ? (
            <>
              Untuk mengisi kuesioner <strong>&ldquo;{survey.title}&rdquo;</strong>
              {survey.rewardIdr !== undefined && (
                <> dan menerima reward <strong>Rp{formatNumber(survey.rewardIdr)}</strong></>
              )}, kamu perlu masuk atau mendaftar terlebih dahulu.
            </>
          ) : (
            'Kamu sedang berada dalam mode pratinjau. Silakan masuk atau buat akun baru untuk mulai mengisi atau menyebarkan kuesioner.'
          )}
        </p>

        <div
          style={{
            backgroundColor: 'var(--neutral-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '20px',
            fontSize: '12px',
            color: 'var(--neutral-text)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <IconCheckCircle size={14} color="var(--accent-green)" />
            <span>Reward saldo langsung masuk ke dompet</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <IconCheckCircle size={14} color="var(--accent-green)" />
            <span>Cairkan ke GoPay, OVO, DANA, atau Bank</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconCheckCircle size={14} color="var(--accent-green)" />
            <span>Gratis &amp; pendaftaran cuma butuh 1 menit</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href={survey ? `/register?redirect=/research/${survey.id}` : '/register'}
            className="btn btn-primary"
            style={{ justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 700 }}
          >
            Daftar Akun Baru (Gratis)
          </Link>
          <Link
            href={survey ? `/login?redirect=/research/${survey.id}` : '/login'}
            className="btn btn-secondary"
            style={{ justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
