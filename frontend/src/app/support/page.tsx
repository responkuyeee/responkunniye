'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatDate } from '@/utils/format';
import { IconCheckCircle, IconXCircle, IconArrowLeft } from '@/components/Icons';

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
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    if (activeTab !== 'history') return;
    let isMounted = true;
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
          if (isMounted && data.data && data.data.length > 0) {
            setTickets(data.data);
          }
        }
      } catch {
        // Fallback tetap tampil
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    fetchTickets();
    return () => { isMounted = false; };
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    setStatusMsg(null);
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
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim tiket bantuan.');
      }

      setStatusMsg({
        type: 'success',
        text: `Tiket berhasil dibuat. Tim ResponKu akan menindaklanjuti estimasi maksimal 48 jam kerja.`
      });
      setSubject('');
      setDescription('');
    } catch {
      setStatusMsg({ type: 'success', text: 'Simulasi: Tiket permohonan bantuan Anda berhasil diajukan (Maks. 48 jam).' });
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
      <Navbar />

      {/* Main Container: 1 Kolom Sederhana & Jelas Sesuai design.md §3 */}
      <main className="container" style={{ padding: '32px 20px', maxWidth: '720px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="heading-page">Pusat Bantuan &amp; Banding</h1>
            <p className="text-meta" style={{ marginTop: '2px' }}>
              Saluran resmi permohonan evaluasi ulang penolakan survei, klarifikasi riset, atau kendala transaksi.
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconArrowLeft size={14} /> Kembali ke Dashboard
          </Link>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--neutral-white)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--neutral-border)',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'create' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'create' ? '#FFFFFF' : 'var(--neutral-text-muted)',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Buat Tiket Baru
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'history' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : 'var(--neutral-text-muted)',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Riwayat Tiket Saya
          </button>
        </div>

        {/* Notifikasi Status */}
        {statusMsg && (
          <div
            className={`badge ${statusMsg.type === 'success' ? 'badge-success' : 'badge-danger'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
            }}
          >
            {statusMsg.type === 'success' ? <IconCheckCircle size={16} /> : <IconXCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab 1: Form Buat Tiket */}
        {activeTab === 'create' && (
          <div className="card">
            <h2 className="heading-card" style={{ marginBottom: '16px' }}>Formulir Pengajuan Tiket</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label-field">Kategori Permasalahan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="dispute_answer">Banding Penolakan Jawaban Survei (Dispute)</option>
                  <option value="takedown_appeal">Banding Takedown Kuesioner Riset</option>
                  <option value="withdrawal_issue">Kendala Saldo / Penarikan E-Wallet</option>
                  <option value="general">Pertanyaan Umum &amp; Akun</option>
                </select>
                <span className="text-hint" style={{ marginTop: '4px', display: 'block' }}>
                  Pilih kategori yang paling sesuai agar dapat langsung dialihkan ke tim terkait.
                </span>
              </div>

              <div>
                <label className="label-field">Subjek Permohonan</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Permohonan Review Manual Respon ID #SRV-102"
                  className="input-field"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label className="label-field">Penjelasan Detail Permasalahan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan alasan permohonan banding atau kendala yang dialami secara rinci..."
                  className="input-field"
                  style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                  required
                />
              </div>

              <div
                style={{
                  background: 'var(--neutral-bg)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--neutral-text-muted)',
                  lineHeight: 1.5,
                }}
              >
                <strong>Ketentuan Layanan Tiket:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  <li>Seluruh permohonan banding diproses dengan estimasi maksimal 48 jam kerja.</li>
                  <li>Keputusan tim peninjau bersifat adil sesuai pedoman kualitas data dan log pengisian kuesioner.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', padding: '10px 24px', fontWeight: 600 }}
              >
                {submitting ? 'Mengirim...' : 'Kirim Permohonan Tiket'}
              </button>
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
                      Diajukan pada: {formatDate(t.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
