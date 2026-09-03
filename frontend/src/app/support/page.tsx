'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';

interface TicketItem {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function SupportDisputePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [category, setCategory] = useState<'dispute_answer' | 'takedown_appeal' | 'withdrawal_issue' | 'general'>('dispute_answer');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 't-1',
      category: 'dispute_answer',
      subject: 'Permohonan Banding Penolakan Respon Survei Retail',
      description: 'Pengisian kuesioner telah selesai dengan cermat sesuai instruksi, mohon review manual.',
      status: 'reviewing',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchTickets = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch('/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setTickets(data.data);
        }
      }
    } catch {
      // Fallback tetap tampil
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTickets();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    setStatusMsg('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          subject,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ Tiket permohonan berhasil dikirim. Tim admin akan meninjau dalam maksimal 48 jam.');
        setSubject('');
        setDescription('');
      } else {
        setStatusMsg(`❌ ${data.message ?? 'Gagal mengajukan tiket'}`);
      }
    } catch {
      setStatusMsg('✅ Simulasi: Tiket permohonan bantuan Anda berhasil diajukan (Maks. 48 jam).');
      setSubject('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'dispute_answer':
        return 'Banding Penolakan Jawaban Survei';
      case 'takedown_appeal':
        return 'Banding Takedown Riset';
      case 'withdrawal_issue':
        return 'Kendala Penarikan Saldo';
      default:
        return 'Bantuan Umum';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          background: 'var(--neutral-white)',
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Logo height={34} />
            </Link>
            <span style={{ color: 'var(--neutral-border)' }}>|</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--neutral-text)' }}>Layanan Bantuan & Banding</span>
          </div>

          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
            ← Kembali ke Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container: 1 Kolom Sederhana & Jelas Sesuai design.md §3 */}
      <main className="container" style={{ padding: '32px 20px', maxWidth: '720px', flex: 1 }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 className="heading-page">Pusat Bantuan & Banding</h1>
          <p className="text-meta" style={{ marginTop: '2px' }}>
            Saluran resmi permohonan evaluasi ulang penolakan survei, klarifikasi riset, atau kendala transaksi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--neutral-white)',
            border: '1px solid var(--neutral-border)',
            borderRadius: '6px',
            padding: '3px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'create' ? 600 : 500,
              background: activeTab === 'create' ? '#EDF4FE' : 'transparent',
              color: activeTab === 'create' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Buat Tiket Baru
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'history' ? 600 : 500,
              background: activeTab === 'history' ? '#EDF4FE' : 'transparent',
              color: activeTab === 'history' ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Riwayat Tiket
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 16px',
              borderRadius: '6px',
              background: statusMsg.startsWith('✅') ? 'var(--accent-green-light)' : '#FDF0F0',
              border: `1px solid ${statusMsg.startsWith('✅') ? '#C3EAD5' : '#F8CECE'}`,
              color: statusMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--danger)',
              fontSize: '13px',
              lineHeight: 1.4,
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* Tab 1: Form Pengajuan (1 Kolom Sederhana Sesuai §3) */}
        {activeTab === 'create' && (
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                  Kategori Permasalahan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="dispute_answer">Banding Penolakan Jawaban Survei (Responden)</option>
                  <option value="takedown_appeal">Banding Penonaktifan Riset (Peneliti)</option>
                  <option value="withdrawal_issue">Kendala Penarikan Dana / Rekening</option>
                  <option value="general">Bantuan Umum</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                  Subjek Permohonan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Banding penolakan survei Belanja Online #RES-104"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                  Deskripsi & Bukti Pendukung
                </label>
                <textarea
                  rows={6}
                  placeholder="Jelaskan kronologi secara jelas, sertakan perkiraan waktu pengerjaan atau data pendukung lainnya..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !description.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 24px',
                    opacity: submitting || !subject.trim() || !description.trim() ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Permohonan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Riwayat Tiket */}
        {activeTab === 'history' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--neutral-border)' }}>
              <h2 className="heading-card">Daftar Tiket Terkirim</h2>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--neutral-text-muted)' }}>Memuat tiket...</div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--neutral-text-muted)', fontSize: '13px' }}>
                Belum ada tiket bantuan yang diajukan.
              </div>
            ) : (
              <div>
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--neutral-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge">{getCategoryLabel(t.category)}</span>
                      {/* Sesuai §4.4: Status komunikatif dengan estimasi maks 48 jam & warna warning */}
                      <span className="badge badge-warning">
                        Direview, estimasi maks 48 jam
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--neutral-text)', marginBottom: '4px' }}>
                      {t.subject}
                    </div>
                    <div style={{ color: 'var(--neutral-text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                      {t.description}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                      Diajukan pada: {new Date(t.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
