'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import AdminHeader from '@/components/AdminHeader';
import {
  IconShieldCheck,
  IconCoins,
  IconFlask,
  IconUsers,
  IconTrendingUp,
  IconArrowRight,
  IconCheckCircle,
  IconAlertTriangle,
  IconClock,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconExternalLink,
} from '@/components/Icons';
import { formatNumber } from '@/utils/format';

export default function AdminMainDashboard() {
  const [filterQuery, setFilterQuery] = useState('');

  // Sistem KPI Metrik
  const metrics = {
    escrowTokens: 148500,
    escrowIdr: 148500000,
    activeResearches: 38,
    completedResearches: 194,
    verifiedRespondents: 12450,
    pendingScreeningCount: 14,
    totalPlatformFeesIdr: 32600000,
  };

  // Aktivitas Terbaru Sistem
  const [activities, setActivities] = useState([
    {
      id: 'act-01',
      type: 'fraud_alert',
      title: 'Terdeteksi straight-lining pengisian kuesioner',
      detail: 'Responden ID usr-8422 pada Riset #RS-901 (durasi acuan 10 mnt selesai dlm 1 mnt)',
      time: '10 menit yang lalu',
      severity: 'high',
      status: 'pending',
    },
    {
      id: 'act-02',
      type: 'withdrawal',
      title: 'Permintaan pencairan dana Rp97.000',
      detail: 'Budi Santoso via BCA Rek. 8271928371',
      time: '24 menit yang lalu',
      severity: 'medium',
      status: 'pending',
    },
    {
      id: 'act-03',
      type: 'research_created',
      title: 'Riset baru dipublikasikan: Persepsi AI di Dunia Medis',
      detail: 'Oleh Dr. Sari Peneliti (Target 150 responden, 15 Token/responden)',
      time: '1 jam yang lalu',
      severity: 'low',
      status: 'approved',
    },
    {
      id: 'act-04',
      type: 'screening_pass',
      title: 'Auto-screening berhasil memvalidasi 25 batch jawaban',
      detail: 'Lolos uji durasi minimum 60% dan lolos attention check',
      time: '2 jam yang lalu',
      severity: 'low',
      status: 'approved',
    },
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav Modern Admin */}
      <AdminHeader activeTab="overview" />

      {/* Main Container */}
      <main className="container" style={{ maxWidth: '1280px', padding: '24px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="heading-page" style={{ fontSize: '24px', marginBottom: '4px' }}>
              Ikhtisar Kesehatan & Operasional Sistem
            </h1>
            <p className="text-meta" style={{ fontSize: '13px' }}>
              Monitoring real-time transaksi escrow, kepatuhan mutu responden, dan arus keuangan platform.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/admin/quality" className="btn btn-secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconShieldCheck size={16} color="var(--primary-blue)" />
              Antrian Screening ({metrics.pendingScreeningCount})
            </Link>
            <Link href="/admin/finance" className="btn btn-action" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconCoins size={16} />
              Proses Pencairan Dana
            </Link>
          </div>
        </div>

        {/* System KPI Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Card 1: Escrow Fund */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="text-meta" style={{ fontSize: '12px' }}>Dana Escrow Terkunci</span>
              <span style={{ padding: '6px', borderRadius: '4px', background: '#EDF4FE' }}>
                <IconCoins size={18} color="var(--primary-blue)" />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neutral-text)' }}>
              Rp{formatNumber(metrics.escrowIdr)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>
              {formatNumber(metrics.escrowTokens)} Token dalam penahanan
            </div>
          </div>

          {/* Card 2: Riset Aktif */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="text-meta" style={{ fontSize: '12px' }}>Riset Aktif Berjalan</span>
              <span style={{ padding: '6px', borderRadius: '4px', background: 'var(--accent-green-light)' }}>
                <IconFlask size={18} color="var(--accent-green)" />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neutral-text)' }}>
              {metrics.activeResearches} Judul
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>
              {metrics.completedResearches} riset telah selesai
            </div>
          </div>

          {/* Card 3: Responden Terverifikasi */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="text-meta" style={{ fontSize: '12px' }}>Responden Terdaftar</span>
              <span style={{ padding: '6px', borderRadius: '4px', background: '#F4F5F6' }}>
                <IconUsers size={18} color="var(--neutral-text)" />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neutral-text)' }}>
              {formatNumber(metrics.verifiedRespondents)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>
              99.2% Lolos deklarasi usia 18+ (PDP)
            </div>
          </div>

          {/* Card 4: Screening & Fraud Alert */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="text-meta" style={{ fontSize: '12px' }}>Kecurigaan Anti-Bot</span>
              <span style={{ padding: '6px', borderRadius: '4px', background: '#FDF0F0' }}>
                <IconShieldCheck size={18} color="var(--danger)" />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--danger)' }}>
              {metrics.pendingScreeningCount} Kasus
            </div>
            <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>
              Menunggu keputusan manual
            </div>
          </div>

          {/* Card 5: Pendapatan Fee Platform */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="text-meta" style={{ fontSize: '12px' }}>Total Fee Platform</span>
              <span style={{ padding: '6px', borderRadius: '4px', background: 'var(--accent-green-light)' }}>
                <IconTrendingUp size={18} color="var(--accent-green)" />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-green)' }}>
              Rp{formatNumber(metrics.totalPlatformFeesIdr)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '4px' }}>
              20% riset pool + 3% penarikan
            </div>
          </div>
        </div>

        {/* 2-Column Section: Quick Shortcuts & Activity Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          {/* Left: Quick Access Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 className="heading-card" style={{ fontSize: '15px', marginBottom: '12px' }}>
                Modul Kontrol Admin
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/admin/quality"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--neutral-border)',
                    backgroundColor: 'var(--neutral-bg)',
                    textDecoration: 'none',
                    color: 'var(--neutral-text)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconShieldCheck size={18} color="var(--primary-blue)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>Quality Control</div>
                      <div className="text-meta" style={{ fontSize: '11px' }}>Moderasi jawaban & sinyal curang</div>
                    </div>
                  </div>
                  <IconArrowRight size={14} color="var(--neutral-text-muted)" />
                </Link>

                <Link
                  href="/admin/finance"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--neutral-border)',
                    backgroundColor: 'var(--neutral-bg)',
                    textDecoration: 'none',
                    color: 'var(--neutral-text)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconCoins size={18} color="var(--accent-green)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>Finance & Penarikan</div>
                      <div className="text-meta" style={{ fontSize: '11px' }}>Disbursement fee 3% & rekening</div>
                    </div>
                  </div>
                  <IconArrowRight size={14} color="var(--neutral-text-muted)" />
                </Link>

                <Link
                  href="/support"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--neutral-border)',
                    backgroundColor: 'var(--neutral-bg)',
                    textDecoration: 'none',
                    color: 'var(--neutral-text)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconAlertTriangle size={18} color="var(--warning)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>Pusat Sengketa Tiket</div>
                      <div className="text-meta" style={{ fontSize: '11px' }}>Banding takedown & komplain user</div>
                    </div>
                  </div>
                  <IconArrowRight size={14} color="var(--neutral-text-muted)" />
                </Link>
              </div>
            </div>

            {/* Quick Status Info */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--neutral-text)' }}>
                Status Mesin Auto-Screening
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  Aktif — Batas Speeding 60%
                </span>
              </div>
              <p className="text-meta" style={{ fontSize: '11px', lineHeight: 1.5 }}>
                Jawaban di bawah 60% waktu acuan dan gagal attention check otomatis dimasukkan ke antrian investigasi tanpa reward cair.
              </p>
            </div>
          </div>

          {/* Right: Aktivitas & Audit Trail Terbaru */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--neutral-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 className="heading-card" style={{ fontSize: '15px' }}>
                  Aktivitas & Log Audit Sistem Terkini
                </h3>
                <div className="text-meta" style={{ fontSize: '12px' }}>
                  Peristiwa penting yang membutuhkan perhatian atau tercatat otomatis.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge">
                  Real-time Ledger Log
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--neutral-bg)', borderBottom: '1px solid var(--neutral-border)', color: 'var(--neutral-text-muted)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Tipe Peristiwa</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Rincian Log</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>Waktu</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id} style={{ borderBottom: '1px solid var(--neutral-border)' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span
                          className={`badge ${
                            act.severity === 'high'
                              ? 'badge-danger'
                              : act.severity === 'medium'
                              ? 'badge-warning'
                              : 'badge-emerald'
                          }`}
                        >
                          {act.type === 'fraud_alert'
                            ? 'Peringatan Fraud'
                            : act.type === 'withdrawal'
                            ? 'Penarikan Dana'
                            : act.type === 'research_created'
                            ? 'Riset Dibuat'
                            : 'Screening Auto'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '2px' }}>
                          {act.title}
                        </div>
                        <div className="text-meta" style={{ fontSize: '12px' }}>
                          {act.detail}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <div className="text-meta" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconClock size={12} />
                          {act.time}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        {act.type === 'fraud_alert' ? (
                          <Link href="/admin/quality" className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 10px' }}>
                            Tinjau Kasus
                          </Link>
                        ) : act.type === 'withdrawal' ? (
                          <Link href="/admin/finance" className="btn btn-action" style={{ fontSize: '11px', padding: '4px 10px' }}>
                            Disburse Dana
                          </Link>
                        ) : (
                          <span className="text-meta" style={{ fontSize: '12px' }}>Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
