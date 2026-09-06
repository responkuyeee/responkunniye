'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { formatNumber, formatToken } from '@/utils/format';
import {
  IconPlus,
  IconCheckCircle,
  IconAlertTriangle,
  IconShieldCheck,
  IconClock,
  IconUsers,
  IconCoins,
  IconArrowRight,
  IconEdit,
  IconEye,
  IconRadio,
  IconCheckSquare,
  IconSliders,
  IconAlignLeft,
  IconArrowUp,
  IconArrowDown,
  IconCopy,
  IconTrash,
  IconLock,
  IconX,
} from '@/components/Icons';

type QuestionType = 'multiple_choice' | 'checkbox' | 'likert' | 'text';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options: string[];
  required: boolean;
}

export default function SurveyBuilderPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login?redirect=/research/create');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Research metadata
  const [title, setTitle] = useState('Survei Preferensi Penggunaan Aplikasi Finansial 2026');
  const [description, setDescription] = useState(
    'Riset ini bertujuan memahami pola transaksi digital, kebiasaan menabung, dan preferensi pembayaran generasi muda di Indonesia.'
  );
  const [category, setCategory] = useState('Fintech & Perbankan');
  const [targetCount, setTargetCount] = useState<number>(50);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(8);
  const [deadlineDays, setDeadlineDays] = useState<number>(7);

  // Demographic criteria
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(25);
  const [targetGender, setTargetGender] = useState<'all' | 'male' | 'female'>('all');
  const [targetCity, setTargetCity] = useState('Semua Wilayah Indonesia');

  // Navigation steps: 'target' | 'questions' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      type: 'multiple_choice',
      title: 'Berapa frekuensi Anda bertransaksi menggunakan dompet digital dalam sebulan terakhir?',
      options: ['Kurang dari 5 kali', '5 - 15 kali', '16 - 30 kali', 'Lebih dari 30 kali'],
      required: true,
    },
    {
      id: 'q-2',
      type: 'checkbox',
      title: 'Aplikasi dompet digital apa saja yang aktif Anda gunakan saat ini?',
      options: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'],
      required: true,
    },
    {
      id: 'q-3',
      type: 'likert',
      title: 'Seberapa puas Anda dengan kemudahan dan kecepatan fitur transfer bank instan?',
      options: ['Sangat Tidak Puas', 'Tidak Puas', 'Netral', 'Puas', 'Sangat Puas'],
      required: true,
    },
    {
      id: 'q-4',
      type: 'text',
      title: 'Apa kendala atau keluhan paling mengganggu yang pernah Anda alami saat bertransaksi digital?',
      options: [],
      required: false,
    },
  ]);

  // Preview answers state for interactive test-run
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | string[]>>({});

  // Content moderation
  const PROHIBITED_KEYWORDS = ['judi', 'slot', 'gacor', 'taruhan', 'porn', 'bokep', 'penipuan', 'narkoba', 'cheat', 'scam'];
  const fullContentToScan = `${title} ${description} ${questions.map(q => `${q.title} ${q.options.join(' ')}`).join(' ')}`;
  const detectedKeyword = PROHIBITED_KEYWORDS.find(kw =>
    new RegExp(`\\b${kw}\\b`, 'i').test(fullContentToScan)
  );

  // Cost calculation
  const tokenPrice = 1000;
  const calculatedTokens = Math.max(50, targetCount);
  const calculatedCostIdr = calculatedTokens * tokenPrice;
  const respondentPoolIdr = calculatedCostIdr * 0.8;
  const platformFeeIdr = calculatedCostIdr * 0.2;
  const rewardPerRespondentIdr = targetCount > 0 ? respondentPoolIdr / targetCount : 0;
  const rewardPerRespondentToken = targetCount > 0 ? (calculatedTokens * 0.8) / targetCount : 0;

  // Auto-save indicator simulation
  const [saveStatus, setSaveStatus] = useState('Tersimpan di Cloud');
  useEffect(() => {
    setSaveStatus('Menyimpan...');
    const timer = setTimeout(() => {
      setSaveStatus('Tersimpan di Cloud');
    }, 500);
    return () => clearTimeout(timer);
  }, [title, description, questions, targetCount, estimatedDuration, minAge, maxAge, targetGender]);

  // Question CRUD Handlers
  const handleAddQuestion = () => {
    const newId = `q-${Date.now()}`;
    const newQuestion: Question = {
      id: newId,
      type: 'multiple_choice',
      title: 'Pertanyaan Baru',
      options: ['Pilihan Jawaban 1', 'Pilihan Jawaban 2'],
      required: true,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleUpdateQuestionTitle = (id: string, newTitle: string) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, title: newTitle } : q)));
  };

  const handleUpdateQuestionType = (id: string, newType: QuestionType) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== id) return q;
        let newOptions = q.options;
        if (newType === 'likert' && q.options.length === 0) {
          newOptions = ['Sangat Tidak Setuju', 'Tidak Setuju', 'Netral', 'Setuju', 'Sangat Setuju'];
        } else if (newType === 'multiple_choice' && q.options.length === 0) {
          newOptions = ['Pilihan 1', 'Pilihan 2'];
        } else if (newType === 'checkbox' && q.options.length === 0) {
          newOptions = ['Pilihan 1', 'Pilihan 2'];
        } else if (newType === 'text') {
          newOptions = [];
        }
        return { ...q, type: newType, options: newOptions };
      })
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: [...q.options, `Pilihan ${q.options.length + 1}`] };
      })
    );
  };

  const handleUpdateOption = (questionId: string, optIndex: number, text: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleRemoveOption = (questionId: string, optIndex: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
      })
    );
  };

  const handleToggleRequired = (id: string) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, required: !q.required } : q)));
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('Kuesioner minimal harus memiliki 1 pertanyaan.');
      return;
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleDuplicateQuestion = (id: string) => {
    const target = questions.find(q => q.id === id);
    if (!target) return;
    const duplicated: Question = {
      ...target,
      id: `q-${Date.now()}`,
      title: `${target.title} (Salinan)`,
      options: [...target.options],
    };
    const index = questions.findIndex(q => q.id === id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setQuestions(newQuestions);
  };

  const [publishing, setPublishing] = useState(false);
  const handlePublish = () => {
    if (detectedKeyword) {
      alert(`Mohon periksa konten survei Anda, terdeteksi kata dilarang: ${detectedKeyword}`);
      return;
    }
    if (targetCount < 50) {
      alert('Target responden minimal 50 orang untuk menjaga validitas metodologi.');
      return;
    }
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      alert(`Selamat! Kuesioner "${title}" berhasil dipublikasikan. ${calculatedTokens} Token telah dialokasikan ke escrow cadangan.`);
      router.push('/dashboard');
    }, 1200);
  };

  if (isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <IconLock size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
            Pembuat Kuesioner Terkunci
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Untuk menyusun dan menyebarkan kuesioner riset, Anda perlu masuk ke akun terlebih dahulu.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/login?redirect=/research/create" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Masuk ke Akun
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-bg)' }}>
      {/* ============================================================ */}
      {/* 1. TOP HEADER — Modern Floating Bar                          */}
      {/* ============================================================ */}
      <header
        style={{
          borderBottom: '1px solid var(--neutral-border)',
          backgroundColor: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          className="container"
          style={{
            minHeight: '68px',
            paddingTop: '12px',
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
              <Logo height={34} />
            </Link>
            <div className="hide-on-mobile" style={{ width: '1px', height: '24px', backgroundColor: 'var(--neutral-border)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-blue-dark)' }}>
                  Survey Builder Studio
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Native 2027
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: saveStatus.includes('Menyimpan') ? 'var(--warning)' : 'var(--accent-green)',
                    display: 'inline-block',
                  }}
                />
                <span>{saveStatus}</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Editor vs Live Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }} className="mobile-full-width">
            <div className="segmented-control mobile-full-width" style={{ flex: 1, minWidth: '240px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`segmented-control-item ${activeTab === 'editor' ? 'active-white' : ''}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <IconEdit size={14} />
                <span>Editor Soal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`segmented-control-item ${activeTab === 'preview' ? 'active-white' : ''}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <IconEye size={14} />
                <span>Live Preview</span>
              </button>
            </div>

            <Link
              href="/dashboard"
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              Kembali
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN LAYOUT: 2-Kolom (Canvas Soal & Sticky Summary)       */}
      {/* ============================================================ */}
      <main className="container" style={{ paddingTop: '24px', paddingBottom: '60px', flex: 1 }}>
        {/* Moderation Alert Banner */}
        {detectedKeyword && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid #FECACA',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <IconAlertTriangle size={20} color="var(--danger)" />
            <div>
              <strong>Peringatan Kebijakan Riset:</strong> Terdeteksi kata dilarang{' '}
              <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                {detectedKeyword}
              </code>
              . Mohon ganti istilah tersebut agar riset dapat lolos validasi otomatis.
            </div>
          </div>
        )}

        <div
          className="grid-layout-sidebar"
          style={{
            alignItems: 'start',
          }}
        >
          {/* ========================================================== */}
          {/* KOLOM KIRI: EDITOR SOAL / LIVE PRATINJAU                    */}
          {/* ========================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {activeTab === 'editor' ? (
              <>
                {/* 1. KARTU DETAIL RISET & METADATA */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        1
                      </div>
                      <div>
                        <h2 className="heading-card" style={{ fontSize: '18px' }}>
                          Identitas & Konsep Kuesioner
                        </h2>
                        <p className="text-meta" style={{ fontSize: '12px' }}>
                          Informasi ini akan muncul di kartu feed calon responden Anda.
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-emerald">Standar Akademik</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                        Judul Kuesioner Riset <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Pengaruh E-Wallet terhadap Keputusan Pembelian Impulsif"
                        style={{ fontWeight: 600, fontSize: '15px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                        Deskripsi & Pengantar Riset
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan tujuan kuesioner dan instruksi pengerjaan bagi responden..."
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                          Kategori Topik
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="Fintech & Perbankan">Fintech & Perbankan</option>
                          <option value="Konsumen & Retail">Konsumen & Retail</option>
                          <option value="Pendidikan & Akademik">Pendidikan & Akademik</option>
                          <option value="Kesehatan & Gaya Hidup">Kesehatan & Gaya Hidup</option>
                          <option value="Teknologi & Internet">Teknologi & Internet</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                          Estimasi Durasi Pengerjaan
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="number"
                            min={2}
                            max={30}
                            value={estimatedDuration}
                            onChange={(e) => setEstimatedDuration(Number(e.target.value) || 5)}
                            style={{ width: '100px', fontWeight: 700 }}
                          />
                          <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>Menit per responden</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KARTU FILTER TARGET DEMOGRAFI */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        2
                      </div>
                      <div>
                        <h2 className="heading-card" style={{ fontSize: '18px' }}>
                          Kriteria Target Responden
                        </h2>
                        <p className="text-meta" style={{ fontSize: '12px' }}>
                          Sistem otomatis hanya mengundang responden yang sesuai dengan kriteria berikut.
                        </p>
                      </div>
                    </div>
                    <span className="badge-pill badge-pill-blue">UU PDP Compliant</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {/* Umur */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                        Rentang Usia Target
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min={17}
                          max={65}
                          value={minAge}
                          onChange={(e) => setMinAge(Number(e.target.value))}
                          style={{ width: '80px', fontWeight: 600 }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>s/d</span>
                        <input
                          type="number"
                          min={minAge}
                          max={65}
                          value={maxAge}
                          onChange={(e) => setMaxAge(Number(e.target.value))}
                          style={{ width: '80px', fontWeight: 600 }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>Tahun</span>
                      </div>
                    </div>

                    {/* Gender Segmented */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                        Jenis Kelamin
                      </label>
                      <div className="segmented-control" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <button
                          type="button"
                          onClick={() => setTargetGender('all')}
                          className={`segmented-control-item ${targetGender === 'all' ? 'active-blue' : ''}`}
                          style={{ flex: 1, padding: '7px 0', fontSize: '12px' }}
                        >
                          Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetGender('male')}
                          className={`segmented-control-item ${targetGender === 'male' ? 'active-blue' : ''}`}
                          style={{ flex: 1, padding: '7px 0', fontSize: '12px' }}
                        >
                          Laki-laki
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetGender('female')}
                          className={`segmented-control-item ${targetGender === 'female' ? 'active-blue' : ''}`}
                          style={{ flex: 1, padding: '7px 0', fontSize: '12px' }}
                        >
                          Perempuan
                        </button>
                      </div>
                    </div>

                    {/* Domicile Target */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                        Wilayah / Domisili
                      </label>
                      <select
                        value={targetCity}
                        onChange={(e) => setTargetCity(e.target.value)}
                      >
                        <option value="Semua Wilayah Indonesia">Semua Wilayah Indonesia</option>
                        <option value="Jabodetabek">Jabodetabek</option>
                        <option value="Pulau Jawa (Luar Jabodetabek)">Pulau Jawa (Luar Jabodetabek)</option>
                        <option value="Luar Pulau Jawa">Luar Pulau Jawa</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. DAFTAR PERTANYAAN NATIVE (TYPEFORM / NOTION STYLE) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-blue-light)',
                          color: 'var(--primary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        3
                      </div>
                      <div>
                        <h2 className="heading-card" style={{ fontSize: '18px' }}>
                          Daftar Pertanyaan Survei ({questions.length} Butir)
                        </h2>
                        <p className="text-meta" style={{ fontSize: '12px' }}>
                          Kuesioner native diisi langsung oleh responden di aplikasi tanpa membuka link eksternal.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      <IconPlus size={16} />
                      <span>Tambah Pertanyaan</span>
                    </button>
                  </div>

                  {/* Loop Question Cards */}
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="card"
                      style={{
                        padding: '24px',
                        borderLeft: '4px solid var(--primary-blue)',
                      }}
                    >
                      {/* Top Header Soal */}
                      <div className="grid-builder-question">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--primary-blue-dark)',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={q.title}
                            onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                            placeholder="Tuliskan pertanyaan riset di sini..."
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              padding: '8px 12px',
                            }}
                          />
                        </div>

                        {/* Tipe Selector */}
                        <div style={{ width: '220px', flexShrink: 0 }} className="mobile-full-width">
                          <select
                            value={q.type}
                            onChange={(e) => handleUpdateQuestionType(q.id, e.target.value as QuestionType)}
                            style={{ fontWeight: 600, fontSize: '13px', padding: '8px 12px', width: '100%' }}
                          >
                            <option value="multiple_choice">Pilihan Ganda (Single Choice)</option>
                            <option value="checkbox">Kotak Centang (Multiple Choice)</option>
                            <option value="likert">Skala Likert (Tingkat Persetujuan 1-5)</option>
                            <option value="text">Jawaban Singkat (Esai Singkat)</option>
                          </select>
                        </div>
                      </div>

                      {/* Area Pilihan Jawaban */}
                      <div className="builder-options-container">
                        {q.type === 'text' && (
                          <div
                            style={{
                              padding: '14px 18px',
                              backgroundColor: 'var(--neutral-bg)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '13px',
                              color: 'var(--neutral-text-muted)',
                              border: '1.5px dashed var(--neutral-border)',
                            }}
                          >
                            Responden akan mengetikkan jawaban teks bebas mereka secara langsung.
                          </div>
                        )}

                        {q.type === 'likert' && (
                          <div
                            className="grid-likert"
                            style={{
                              backgroundColor: 'var(--neutral-bg)',
                              padding: '16px',
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  padding: '10px 8px',
                                  borderRadius: '8px',
                                  textAlign: 'center',
                                  border: '1px solid var(--neutral-border)',
                                }}
                              >
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '4px' }}>
                                  {oIdx + 1}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                                  {opt}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: q.type === 'multiple_choice' ? '50%' : '6px',
                                    border: '2px solid var(--neutral-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--neutral-text-muted)',
                                    fontSize: '11px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {optIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                                  placeholder={`Pilihan ${optIdx + 1}`}
                                  style={{ padding: '8px 12px', fontSize: '13px' }}
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(q.id, optIdx)}
                                    title="Hapus Opsi"
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      background: 'transparent',
                                      border: '1px solid transparent',
                                      color: 'var(--neutral-text-muted)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '14px',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.color = 'var(--danger)';
                                      e.currentTarget.style.backgroundColor = 'var(--danger-light)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.color = 'var(--neutral-text-muted)';
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    aria-label="Hapus opsi"
                                  >
                                    <IconX size={14} />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddOption(q.id)}
                              style={{
                                alignSelf: 'flex-start',
                                background: 'transparent',
                                border: '1px dashed var(--primary-blue)',
                                borderRadius: 'var(--radius-pill)',
                                color: 'var(--primary-blue)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '6px 14px',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--primary-blue-light)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              + Tambah Pilihan Jawaban
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Footer Aksi Soal */}
                      <div className="grid-builder-actions">
                        {/* Urutan Posisi Soal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid var(--neutral-border)',
                              background: '#FFFFFF',
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              opacity: idx === 0 ? 0.4 : 1,
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <IconArrowUp size={13} />
                            <span>Atas</span>
                          </button>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid var(--neutral-border)',
                              background: '#FFFFFF',
                              cursor: idx === questions.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: idx === questions.length - 1 ? 0.4 : 1,
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <IconArrowDown size={13} />
                            <span>Bawah</span>
                          </button>
                        </div>

                        {/* Duplikasi, Hapus, & Wajib */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(q.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--neutral-text-muted)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <IconCopy size={13} />
                            <span>Salin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <IconTrash size={13} />
                            <span>Hapus</span>
                          </button>

                          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--neutral-border)' }} />

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={() => handleToggleRequired(q.id)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-text)' }}>
                              Wajib Dijawab
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tambah Soal Callout */}
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px dashed #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--primary-blue)',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-blue)';
                      e.currentTarget.style.backgroundColor = 'var(--primary-blue-light)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <IconPlus size={18} />
                    <span>Tambah Butir Pertanyaan Baru</span>
                  </button>
                </div>
              </>
            ) : (
              /* ======================================================== */
              /* LIVE PRATINJAU INTERAKTIF SEPERTI RESPONDEN             */
              /* ======================================================== */
              <div className="card" style={{ padding: '36px' }}>
                <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <IconEye size={13} color="var(--accent-green)" /> Live Respondent Interactive Preview
                    </span>
                    <span className="badge badge-cyan">
                      {category}
                    </span>
                  </div>
                  <h1 className="heading-page" style={{ fontSize: '24px', marginBottom: '10px' }}>
                    {title}
                  </h1>
                  <p className="text-body" style={{ color: 'var(--neutral-text-muted)' }}>
                    {description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconClock size={16} color="var(--primary-blue)" />
                      <span>~{estimatedDuration} Menit</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontWeight: 600 }}>
                      <IconCoins size={16} />
                      <span>Reward: Rp{formatNumber(rewardPerRespondentIdr)} ({formatToken(rewardPerRespondentToken)} Token)</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '20px 24px',
                        backgroundColor: 'var(--neutral-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--neutral-border)',
                      }}
                    >
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '16px' }}>
                        {idx + 1}. {q.title} {q.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                      </div>

                      {q.type === 'multiple_choice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                backgroundColor: previewAnswers[q.id] === opt ? 'var(--primary-blue-light)' : '#FFFFFF',
                                border: previewAnswers[q.id] === opt ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={previewAnswers[q.id] === opt}
                                onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                                style={{ accentColor: 'var(--primary-blue)' }}
                              />
                              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--neutral-text)' }}>
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'checkbox' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {q.options.map((opt, oIdx) => {
                            const current = (previewAnswers[q.id] as string[]) || [];
                            const isChecked = current.includes(opt);
                            return (
                              <label
                                key={oIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '10px 14px',
                                  backgroundColor: isChecked ? 'var(--primary-blue-light)' : '#FFFFFF',
                                  border: isChecked ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPreviewAnswers({ ...previewAnswers, [q.id]: [...current, opt] });
                                    } else {
                                      setPreviewAnswers({ ...previewAnswers, [q.id]: current.filter(x => x !== opt) });
                                    }
                                  }}
                                  style={{ accentColor: 'var(--primary-blue)' }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--neutral-text)' }}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'likert' && (
                        <div className="grid-likert">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 6px',
                                backgroundColor: previewAnswers[q.id] === opt ? 'var(--primary-blue-light)' : '#FFFFFF',
                                border: previewAnswers[q.id] === opt ? '1.5px solid var(--primary-blue)' : '1px solid var(--neutral-border)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={previewAnswers[q.id] === opt}
                                onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                                style={{ accentColor: 'var(--primary-blue)' }}
                              />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--neutral-text)' }}>
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'text' && (
                        <textarea
                          rows={3}
                          placeholder="Ketikkan jawaban Anda di sini..."
                          value={(previewAnswers[q.id] as string) || ''}
                          onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => alert('Simulasi sukses! Semua data input tersimpan di memori pratinjau.')}
                      className="btn btn-action"
                      style={{ padding: '12px 28px', fontSize: '14px' }}
                    >
                      Kirim Simulasi Jawaban
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* KOLOM KANAN: STICKY FINTECH RINGKASAN BIAYA & ALOKASI       */}
          {/* ========================================================== */}
          <aside className="builder-aside" style={{ position: 'sticky', top: '92px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <IconShieldCheck size={20} color="var(--primary-blue)" />
                <h3 className="heading-card" style={{ fontSize: '16px' }}>
                  Alokasi Token & Budget
                </h3>
              </div>

              {/* Target Responden */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                  Target Jumlah Responden
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    min={50}
                    value={targetCount}
                    onChange={(e) => setTargetCount(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', whiteSpace: 'nowrap' }}>Orang</span>
                </div>
                {targetCount < 50 && (
                  <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontWeight: 500 }}>
                    <IconAlertTriangle size={13} color="var(--danger)" /> Minimal 50 responden untuk uji signifikansi.
                  </span>
                )}
              </div>

              {/* Batas Waktu */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '6px' }}>
                  Batas Waktu Pengumpulan
                </label>
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                >
                  <option value={3}>3 Hari (Mode Cepat)</option>
                  <option value={7}>7 Hari (Standar Rekomendasi)</option>
                  <option value={14}>14 Hari (Fleksibel)</option>
                </select>
              </div>

              {/* Visual Breakdown Bar (80% Responden / 20% Platform) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--accent-green)' }}>80% Pool Responden</span>
                  <span style={{ color: 'var(--primary-blue)' }}>20% Platform</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', backgroundColor: 'var(--neutral-border)' }}>
                  <div style={{ width: '80%', backgroundColor: 'var(--accent-green)' }} />
                  <div style={{ width: '20%', backgroundColor: 'var(--primary-blue)' }} />
                </div>
              </div>

              {/* Financial Breakdown */}
              <div
                style={{
                  borderTop: '1px solid var(--neutral-border)',
                  paddingTop: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-text-muted)' }}>
                  <span>Total Kebutuhan Token:</span>
                  <strong style={{ color: 'var(--neutral-text)' }}>{calculatedTokens} Token</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-text-muted)' }}>
                  <span>Estimasi Biaya IDR:</span>
                  <strong style={{ color: 'var(--neutral-text)' }}>Rp{formatNumber(calculatedCostIdr)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green)', fontSize: '12px' }}>
                  <span>Pool Reward Responden (80%):</span>
                  <strong>Rp{formatNumber(respondentPoolIdr)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-text-muted)', fontSize: '12px' }}>
                  <span>Biaya Operasional & QC (20%):</span>
                  <span>Rp{formatNumber(platformFeeIdr)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed var(--neutral-border)',
                    paddingTop: '10px',
                    color: 'var(--accent-green)',
                    fontWeight: 700,
                  }}
                >
                  <span>Reward per Responden:</span>
                  <span>Rp{formatNumber(rewardPerRespondentIdr)}</span>
                </div>
              </div>

              {/* Tombol Publikasi Utama */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing || targetCount < 50 || Boolean(detectedKeyword)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  opacity: targetCount < 50 || Boolean(detectedKeyword) ? 0.5 : 1,
                  cursor: targetCount < 50 || Boolean(detectedKeyword) ? 'not-allowed' : 'pointer',
                  justifyContent: 'center',
                }}
              >
                {publishing ? 'Memproses Alokasi Escrow...' : 'Publikasikan Kuesioner'}
              </button>

              <p style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
                Dana token akan diamankan dalam escrow sistem. Kuota yang tidak terpenuhi akan otomatis dikembalikan ke saldo dompet Anda.
              </p>
            </div>

            {/* Quality Shield Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue-dark)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Proteksi Kualitas Riset
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheckCircle size={16} color="var(--accent-green)" />
                  <span>Anti-Speeding & Durasi Minimum</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheckCircle size={16} color="var(--accent-green)" />
                  <span>Deteksi Straight-lining & Pola Bot</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheckCircle size={16} color="var(--accent-green)" />
                  <span>Unduh Dataset CSV Langsung Bersih</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
