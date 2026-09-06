'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatNumber, formatToken, formatCurrencyIdr } from '@/utils/format';
import {
  IconToken,
  IconWallet,
  IconCoins,
  IconShieldCheck,
  IconArrowRight,
  IconCheckCircle,
  IconXCircle,
  IconLock,
  IconX,
} from '@/components/Icons';

interface WalletBalance {
  balance_token: number;
  balance_idr_equivalent: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  researchId?: string;
  participationId?: string;
  idempotencyKey?: string;
}

const TX_TYPE_LABEL: Record<string, { label: string; badgeClass: string; sign: string }> = {
  topup:      { label: 'Top-up Saldo',       badgeClass: 'badge-emerald', sign: '+' },
  reserve:    { label: 'Cadangan Riset',     badgeClass: 'badge-warning', sign: '-' },
  consume:    { label: 'Reward Cair',        badgeClass: 'badge-emerald', sign: '+' },
  refund:     { label: 'Refund Kuota',       badgeClass: 'badge',         sign: '+' },
  withdrawal: { label: 'Penarikan Bank',     badgeClass: 'badge-danger',  sign: '-' },
};

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>({
    balance_token: 32.0,
    balance_idr_equivalent: 32000,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      type: 'consume',
      amount: 0.8,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'tx-2',
      type: 'consume',
      amount: 1.6,
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    },
    {
      id: 'tx-3',
      type: 'topup',
      amount: 50,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'tx-4',
      type: 'reserve',
      amount: -50,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState(100);
  const [topupMethod, setTopupMethod] = useState<'qris' | 'ewallet' | 'va'>('qris');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState('');

  // Withdrawal States
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(25);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const grossWithdrawIdr = withdrawAmount * 1000;
  const feeWithdrawIdr = grossWithdrawIdr * 0.03;
  const netWithdrawIdr = grossWithdrawIdr - feeWithdrawIdr;

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const [balRes, txRes] = await Promise.all([
        fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/wallet/transactions', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (balRes.ok) setBalance(await balRes.json());
      if (txRes.ok) {
        const data = await txRes.json();
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      }
    } catch {
      // Fallback tetap tampil data mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopup = async () => {
    if (topupAmount < 1) return;
    setTopupLoading(true);
    setTopupMsg('');
    try {
      const token = localStorage.getItem('access_token');
      const idempotencyKey = `topup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount_token: topupAmount,
          payment_method: topupMethod,
          idempotency_key: idempotencyKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTopupMsg(`✅ Instruksi pembayaran dibuat. Selesaikan pembayaran Rp${(topupAmount * 1000).toLocaleString('id-ID')} via ${topupMethod.toUpperCase()}.`);
        setTimeout(() => { setTopupModal(false); setTopupMsg(''); fetchWallet(); }, 3000);
      } else {
        setTopupMsg(`❌ ${data.message ?? 'Gagal membuat topup'}`);
      }
    } catch {
      setTopupMsg(`✅ Simulasi topup: Rp${(topupAmount * 1000).toLocaleString('id-ID')} via ${topupMethod.toUpperCase()} berhasil diajukan.`);
      setTimeout(() => { setTopupModal(false); setTopupMsg(''); }, 2000);
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount < 10) return;
    setWithdrawLoading(true);
    setWithdrawMsg('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token_amount: withdrawAmount,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder_name: accountHolder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg(`✅ Penarikan ${withdrawAmount} token (Rp${netWithdrawIdr.toLocaleString('id-ID')}) diajukan.`);
        setTimeout(() => {
          setWithdrawModal(false);
          setWithdrawMsg('');
          fetchWallet();
        }, 2500);
      } else {
        setWithdrawMsg(`❌ ${data.message ?? 'Gagal mengajukan penarikan'}`);
      }
    } catch {
      setWithdrawMsg(`✅ Simulasi penarikan: Rp${netWithdrawIdr.toLocaleString('id-ID')} ke ${bankName} berhasil diajukan.`);
      setTimeout(() => {
        setWithdrawModal(false);
        setWithdrawMsg('');
      }, 2500);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      <Navbar tokenBalance={balance?.balance_token} />

      {/* Main Content */}
      <main className="container" style={{ padding: '32px 20px', maxWidth: '820px', flex: 1 }}>
        {/* Header Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="heading-page">Dompet Akun</h1>
          <p className="text-meta">Kelola saldo token riset, top-up kuota, dan penarikan reward responden.</p>
        </div>

        {/* Saldo Besar Sesuai design.md §3: saldo besar di atas (hijau, mencolok) */}
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Total Saldo Tersedia
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '38px', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {formatToken(balance?.balance_token ?? 0)}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-text)' }}>Token</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--neutral-text-muted)', marginTop: '6px' }}>
                ≈ Rp{formatNumber(balance?.balance_idr_equivalent ?? 0)} (1 Token = Rp1.000)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTopupModal(true)}
                className="btn btn-primary"
                style={{ padding: '9px 18px' }}
              >
                + Top Up Token
              </button>
              <button
                onClick={() => setWithdrawModal(true)}
                className="btn btn-action"
                style={{ padding: '9px 18px' }}
              >
                Tarik Tunai (Withdrawal)
              </button>
            </div>
          </div>
        </div>

        {/* Riwayat Transaksi di Bawah Sesuai design.md §3 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--neutral-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="heading-card">Riwayat Transaksi</h2>
            <span style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>Ledger Transparan</span>
          </div>

          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--neutral-text-muted)' }}>Memuat data...</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--neutral-text-muted)', fontSize: '13px' }}>
              Belum ada riwayat transaksi.
            </div>
          ) : (
            <div>
              {transactions.map((tx) => {
                const meta = TX_TYPE_LABEL[tx.type] ?? { label: tx.type, badgeClass: 'badge', sign: '' };
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--neutral-border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)' }}>
                          {tx.type === 'topup' ? 'Top-up Kuota Token' : tx.type === 'consume' ? 'Reward Jawaban Survei' : tx.type === 'reserve' ? 'Alokasi Cadangan Riset' : 'Penarikan ke Rekening'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>{formatDate(tx.createdAt)}</div>
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '15px',
                        color: isPositive ? 'var(--accent-green)' : 'var(--neutral-text)',
                      }}
                    >
                      {isPositive ? '+' : ''}{tx.amount.toLocaleString('id-ID')} Token
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: TOP UP TOKEN */}
      {topupModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(18, 32, 58, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setTopupModal(false); }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-page" style={{ fontSize: '18px' }}>Top-up Saldo Token</h3>
              <button
                onClick={() => setTopupModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--neutral-text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              Jumlah Token
            </label>
            <input
              type="number"
              min={1}
              value={topupAmount}
              onChange={e => setTopupAmount(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '4px' }}
            />
            <p className="text-meta" style={{ marginBottom: '16px' }}>
              = Rp{(topupAmount * 1000).toLocaleString('id-ID')} (1 Token = Rp1.000)
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Metode Pembayaran
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {(['qris', 'ewallet', 'va'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTopupMethod(m)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: topupMethod === m ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                    background: topupMethod === m ? '#EDF4FE' : 'var(--neutral-white)',
                    color: topupMethod === m ? 'var(--primary-blue)' : 'var(--neutral-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {topupMsg && (
              <div
                style={{
                  background: topupMsg.startsWith('✅') ? 'var(--accent-green-light)' : '#FDF0F0',
                  border: `1px solid ${topupMsg.startsWith('✅') ? '#C3EAD5' : '#F8CECE'}`,
                  color: topupMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {topupMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTopupModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Batal
              </button>
              <button
                onClick={handleTopup}
                disabled={topupLoading || topupAmount < 1}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {topupLoading ? 'Memproses...' : `Bayar Rp${(topupAmount * 1000).toLocaleString('id-ID')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TARIK DANA */}
      {withdrawModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(18, 32, 58, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setWithdrawModal(false); }}
        >
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-page" style={{ fontSize: '18px' }}>Tarik Saldo (Withdrawal)</h3>
              <button
                onClick={() => setWithdrawModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--neutral-text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              Jumlah Token Ditarik (Min. 10 Token)
            </label>
            <input
              type="number"
              min={10}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '12px' }}
            />

            {/* Breakdown Sesuai Persyaratan 3% Fee */}
            <div
              style={{
                background: 'var(--neutral-bg)',
                border: '1px solid var(--neutral-border)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--neutral-text-muted)' }}>Nilai Kotor:</span>
                <span>Rp{grossWithdrawIdr.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--danger)' }}>
                <span>Biaya Penarikan (3%):</span>
                <span>-Rp{feeWithdrawIdr.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--neutral-border)', paddingTop: '6px', marginTop: '4px', fontWeight: 700, color: 'var(--accent-green)' }}>
                <span>Bersih Diterima:</span>
                <span>Rp{netWithdrawIdr.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '4px' }}>Bank/E-Wallet</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="Dana">Dana</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '4px' }}>Nomor Rekening / HP</label>
                <input
                  type="text"
                  placeholder="0812... / 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {withdrawMsg && (
              <div
                style={{
                  background: withdrawMsg.startsWith('✅') ? 'var(--accent-green-light)' : '#FDF0F0',
                  border: `1px solid ${withdrawMsg.startsWith('✅') ? '#C3EAD5' : '#F8CECE'}`,
                  color: withdrawMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {withdrawMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setWithdrawModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Batal
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || withdrawAmount < 10}
                className="btn btn-action"
                style={{ flex: 2 }}
              >
                {withdrawLoading ? 'Memproses...' : `Cairkan Rp${netWithdrawIdr.toLocaleString('id-ID')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
