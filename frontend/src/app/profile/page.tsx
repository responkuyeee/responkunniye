'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  IconUser,
  IconShieldCheck,
  IconCheckCircle,
  IconLock,
  IconBuilding,
  IconMail,
  IconPhone,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconFileSpreadsheet,
  IconCamera,
  IconSettings,
  IconChevronRight,
} from '@/components/Icons';

/* ─── Inject animations ─── */
if (typeof document !== 'undefined' && !document.getElementById('profile-anims')) {
  const s = document.createElement('style');
  s.id = 'profile-anims';
  s.textContent = `
    @keyframes profFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .prof-fade-up { animation: profFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    .prof-tab-btn { position:relative; transition: color 0.2s ease; }
    .prof-tab-btn::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px; border-radius:2px; background:var(--primary-blue); transform:scaleX(0); transition:transform 0.2s cubic-bezier(0.16,1,0.3,1); }
    .prof-tab-btn.active::after { transform:scaleX(1); }
    .prof-tab-btn:hover { color: var(--neutral-text) !important; }
    .prof-nav-item { transition: all 0.15s ease; border-radius: var(--radius-sm); }
    .prof-nav-item:hover { background: var(--neutral-bg) !important; }
    .prof-nav-item.active { background: var(--primary-blue-light) !important; color: var(--primary-blue) !important; }
    .prof-field-group { transition: border-color 0.2s ease; }
    .prof-field-group:focus-within { border-color: var(--primary-blue) !important; }
    .prof-privacy-row { transition: all 0.15s ease; }
    .prof-privacy-row:hover { box-shadow: var(--shadow-card); transform: translateY(-1px); }
    .prof-toast { animation: profFadeUp 0.3s ease both; }
  `;
  document.head.appendChild(s);
}

type TabId = 'profile' | 'demographics' | 'security' | 'privacy';

const TABS: { id: TabId; icon: React.ReactNode; label: string; shortLabel: string }[] = [
  { id: 'profile', icon: <IconUser size={15} />, label: 'Data Identitas', shortLabel: 'Identitas' },
  { id: 'demographics', icon: <IconBuilding size={15} />, label: 'Demografi & UU PDP', shortLabel: 'Demografi' },
  { id: 'security', icon: <IconLock size={15} />, label: 'Keamanan & Sandi', shortLabel: 'Keamanan' },
  { id: 'privacy', icon: <IconShieldCheck size={15} />, label: 'Hak Privasi Data', shortLabel: 'Privasi' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [mounted, setMounted] = useState(false);

  // User state
  const [name, setName] = useState('Budi Santoso');
  const [email, setEmail] = useState('budi.santoso@example.com');
  const [phone, setPhone] = useState('081234567890');
  const [role, setRole] = useState<'respondent' | 'researcher'>('respondent');

  // Demographics
  const [gender, setGender] = useState('Laki-laki');
  const [province, setProvince] = useState('DKI Jakarta');
  const [city, setCity] = useState('Jakarta Selatan');
  const [education, setEducation] = useState('S1 / Sarjana');
  const [occupation, setOccupation] = useState('Karyawan Swasta');
  const [religion, setReligion] = useState('Islam');
  const [religionConsent, setReligionConsent] = useState(true);

  // Security
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login?redirect=/profile');
        return;
      }
      setIsAuthenticated(true);
      const storedName = localStorage.getItem('user_name');
      const storedRole = localStorage.getItem('user_role');
      const storedEmail = localStorage.getItem('user_email');
      const storedAvatar = localStorage.getItem('user_avatar');
      if (storedName) setName(storedName);
      if (storedRole === 'researcher') setRole('researcher');
      if (storedEmail) setEmail(storedEmail);
      if (storedAvatar) setAvatar(storedAvatar);
    }
    setMounted(true);
  }, [router]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        localStorage.setItem('user_avatar', base64);
        showToast('Foto profil berhasil diperbarui.');
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('user_name', name);
      setSaving(false);
      showToast('Profil berhasil diperbarui.');
    }, 600);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Kata sandi baru tidak cocok dengan konfirmasi.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setSaving(false);
      showToast('Kata sandi berhasil diubah.');
    }, 600);
  };

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--neutral-text-muted)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  if (isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <IconLock size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
            Profil Terkunci
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Halaman profil dan data privasi hanya dapat diakses setelah masuk ke akun Anda.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/login?redirect=/profile" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Header ─── */}
      <header style={{ borderBottom: '1px solid var(--neutral-border)', backgroundColor: '#FFFFFF', position: 'sticky', top: 0, zIndex: 40, boxShadow: 'var(--shadow-xs)' }}>
        <div className="container" style={{ maxWidth: '1080px', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/" style={{ display: 'flex' }}><Logo height={28} /></Link>
            <span style={{ height: '16px', width: '1px', backgroundColor: 'var(--neutral-border)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>Profil & Akun</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/settings" className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', gap: '5px' }}>
              <IconSettings size={14} /> <span className="hide-on-mobile">Pengaturan</span>
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', gap: '5px' }}>
              <IconArrowLeft size={14} /> <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1080px', padding: '24px 16px', flex: 1 }}>
        {/* ─── Profile Hero Card ─── */}
        <div
          className={`card ${mounted ? 'prof-fade-up' : ''}`}
          style={{ padding: '28px', marginBottom: '24px', borderRadius: 'var(--radius-xl)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: role === 'researcher' ? 'var(--primary-blue)' : 'var(--accent-green)',
                color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: 800, overflow: 'hidden',
                border: '3px solid #FFFFFF',
                boxShadow: `0 0 0 2px ${role === 'researcher' ? 'rgba(27,111,224,0.3)' : 'rgba(28,154,91,0.3)'}, var(--shadow-card)`,
              }}>
                {avatar ? (
                  <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name.split(' ').map(n => n[0]).slice(0, 2).join('')
                )}
              </div>
              <label
                htmlFor="profile-avatar-input"
                title="Ganti Foto Profil"
                style={{
                  position: 'absolute', bottom: '0', right: '-2px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: 'var(--primary-blue)', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2.5px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <IconCamera size={13} color="#FFFFFF" />
              </label>
              <input id="profile-avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', letterSpacing: '-0.02em', margin: 0 }}>
                  {name}
                </h1>
                <span className={`badge ${role === 'researcher' ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '10px' }}>
                  {role === 'researcher' ? 'Peneliti Aktif' : 'Responden Terverifikasi'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  <IconCheckCircle size={13} color="var(--accent-green)" />
                  Terverifikasi 18+
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconMail size={13} /> {email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconPhone size={13} /> {phone}
                </span>
              </div>
            </div>

            {/* Quality Score Widget */}
            <div style={{
              backgroundColor: 'var(--accent-green-light)', border: '1px solid #C3EAD5',
              borderRadius: 'var(--radius-lg)', padding: '14px 20px', textAlign: 'center', minWidth: '140px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Skor Kualitas
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1.2 }}>
                98%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 600, marginTop: '2px' }}>
                Sangat Baik
              </div>
            </div>
          </div>
        </div>

        {/* ─── Layout: Sidebar + Content ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '24px' }} className="grid-layout-sidebar">
          {/* Sidebar Navigation */}
          <nav className={mounted ? 'prof-fade-up' : ''} style={{ animationDelay: '0.05s' }}>
            <div className="card" style={{ padding: '10px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`prof-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', fontSize: '13px', fontWeight: 600,
                      border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                      color: activeTab === tab.id ? 'var(--primary-blue)' : 'var(--neutral-text)',
                      background: activeTab === tab.id ? 'var(--primary-blue-light)' : 'transparent',
                    }}
                  >
                    <span style={{ color: activeTab === tab.id ? 'var(--primary-blue)' : 'var(--neutral-text-muted)' }}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <IconChevronRight size={13} style={{ marginLeft: 'auto', color: 'var(--primary-blue)' }} />}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Content Area */}
          <div className={mounted ? 'prof-fade-up' : ''} style={{ animationDelay: '0.1s' }}>
            {/* Toast */}
            {toastMsg && (
              <div className="prof-toast" style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-green-light)',
                border: '1px solid #C3EAD5', color: 'var(--accent-green)', fontSize: '13px',
                fontWeight: 600, marginBottom: '16px',
              }}>
                <IconCheckCircle size={16} />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* TAB 1: IDENTITAS */}
            {activeTab === 'profile' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px' }}>
                    Informasi Dasar
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    Kelola nama, email, dan kontak akun Anda.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={fieldLabel}>Nama Lengkap</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }} />
                  </div>

                  <div>
                    <label style={fieldLabel}>Alamat Email</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-text-muted)', display: 'flex' }}>
                        <IconMail size={15} />
                      </span>
                      <input type="email" value={email} disabled
                        style={{ width: '100%', paddingLeft: '40px', backgroundColor: 'var(--neutral-bg)', color: 'var(--neutral-text-muted)', borderRadius: 'var(--radius-md)' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', marginTop: '4px', display: 'block' }}>
                      Email telah diverifikasi. Hubungi bantuan jika perlu mengganti.
                    </span>
                  </div>

                  <div>
                    <label style={fieldLabel}>Nomor WhatsApp / Telepon</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-text-muted)', display: 'flex' }}>
                        <IconPhone size={15} />
                      </span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px', borderRadius: 'var(--radius-md)' }} />
                    </div>
                  </div>

                  <div style={{ paddingTop: '4px' }}>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: DEMOGRAFI */}
            {activeTab === 'demographics' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px' }}>
                    Profil Demografi
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    Data digunakan untuk mencocokkan survei secara anonim tanpa membuka identitas ke peneliti.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mobile-stack">
                    <div>
                      <label style={fieldLabel}>Jenis Kelamin</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label style={fieldLabel}>Pendidikan Terakhir</label>
                      <select value={education} onChange={(e) => setEducation(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                        <option value="SMA / SMK">SMA / SMK</option>
                        <option value="Diploma (D3)">Diploma (D3)</option>
                        <option value="S1 / Sarjana">S1 / Sarjana</option>
                        <option value="S2 / Magister">S2 / Magister</option>
                        <option value="S3 / Doktoral">S3 / Doktoral</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mobile-stack">
                    <div>
                      <label style={fieldLabel}>Provinsi Domisili</label>
                      <input type="text" value={province} onChange={(e) => setProvince(e.target.value)}
                        style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Kota / Kabupaten</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={fieldLabel}>Pekerjaan / Bidang</label>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)}
                      style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                  </div>

                  {/* UU PDP Section */}
                  <div style={{
                    background: 'var(--primary-blue-light)', border: '1px solid #D1E3FC',
                    borderRadius: 'var(--radius-lg)', padding: '20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <IconShieldCheck size={16} color="var(--primary-blue)" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue-dark)' }}>
                        Data Sensitif (UU PDP)
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      Data agama bersifat opsional. Hanya digunakan untuk algoritma matching riset keagamaan.
                    </p>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={fieldLabel}>Agama (Opsional)</label>
                      <select value={religion} onChange={(e) => setReligion(e.target.value)}
                        disabled={!religionConsent}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', opacity: religionConsent ? 1 : 0.5 }}>
                        {['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: 'var(--neutral-text)', cursor: 'pointer', lineHeight: 1.5 }}>
                      <input type="checkbox" checked={religionConsent} onChange={(e) => setReligionConsent(e.target.checked)}
                        style={{ marginTop: '3px', accentColor: 'var(--primary-blue)' }} />
                      <span>Saya memberikan persetujuan eksplisit untuk pemrosesan data agama dalam penapisan riset ilmiah.</span>
                    </label>
                  </div>

                  <div style={{ paddingTop: '4px' }}>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>
                      {saving ? 'Menyimpan...' : 'Simpan Demografi'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: KEAMANAN */}
            {activeTab === 'security' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px' }}>
                    Ubah Kata Sandi
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    Pastikan menggunakan kata sandi kuat dan unik untuk keamanan akun.
                  </p>
                </div>

                <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                  <div>
                    <label style={fieldLabel}>Kata Sandi Saat Ini</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                      required placeholder="Masukkan kata sandi lama"
                      style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                  </div>

                  <div>
                    <label style={fieldLabel}>Kata Sandi Baru</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required minLength={6} placeholder="Minimal 6 karakter"
                        style={{ width: '100%', paddingRight: '42px', borderRadius: 'var(--radius-md)' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--neutral-text-muted)', cursor: 'pointer', display: 'flex',
                        }}>
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                              flex: 1, height: '3px', borderRadius: '2px',
                              backgroundColor: newPassword.length >= i * 3
                                ? (newPassword.length >= 12 ? 'var(--accent-green)' : newPassword.length >= 8 ? 'var(--warning)' : 'var(--danger)')
                                : 'var(--neutral-border)',
                              transition: 'background-color 0.2s ease',
                            }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--neutral-text-muted)' }}>
                          {newPassword.length < 6 ? 'Terlalu pendek' : newPassword.length < 8 ? 'Lemah' : newPassword.length < 12 ? 'Cukup kuat' : 'Sangat kuat'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={fieldLabel}>Ulangi Kata Sandi Baru</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      required placeholder="Ulangi kata sandi baru"
                      style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        Kata sandi tidak cocok
                      </span>
                    )}
                  </div>

                  <div style={{ paddingTop: '4px' }}>
                    <button type="submit" disabled={saving} className="btn btn-action" style={{ fontSize: '13px', padding: '10px 24px' }}>
                      {saving ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: PRIVASI */}
            {activeTab === 'privacy' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px' }}>
                    Hak Pemilik Data Pribadi
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)' }}>
                    Sesuai UU PDP No. 27/2022, Anda memiliki kendali penuh atas data.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Export */}
                  <div className="prof-privacy-row" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 20px', border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neutral-text)', marginBottom: '3px' }}>
                        Ekspor Salinan Data
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                        Unduh arsip lengkap profil, riwayat riset, dan mutasi token.
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => alert('Arsip data terenkripsi sedang disiapkan. Tautan unduh akan dikirim ke email.')}
                      className="btn btn-secondary" style={{ fontSize: '12px', gap: '6px', flexShrink: 0 }}>
                      <IconFileSpreadsheet size={14} /> Ekspor Data
                    </button>
                  </div>

                  {/* Withdraw consent */}
                  <div className="prof-privacy-row" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 20px', border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neutral-text)', marginBottom: '3px' }}>
                        Tarik Persetujuan Pemrosesan
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                        Membatasi sistem agar tidak menggunakan data untuk pencocokan riset baru.
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => alert('Persetujuan berhasil ditarik. Akun tidak akan diikutsertakan dalam riset baru.')}
                      className="btn btn-secondary" style={{ fontSize: '12px', flexShrink: 0 }}>
                      Tarik Persetujuan
                    </button>
                  </div>

                  {/* Delete account */}
                  <div className="prof-privacy-row" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 20px', border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--danger-light)',
                    gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--danger)', marginBottom: '3px' }}>
                        Hapus Akun Permanen
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.5 }}>
                        Data dihapus permanen. Transaksi finansial dianonimkan untuk audit.
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => {
                        if (confirm('Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.')) {
                          localStorage.clear();
                          window.location.href = '/login';
                        }
                      }}
                      className="btn" style={{
                        fontSize: '12px', gap: '6px', flexShrink: 0,
                        backgroundColor: 'var(--danger)', color: '#FFFFFF', borderColor: 'var(--danger)',
                      }}>
                      <IconTrash size={14} /> Hapus Akun
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
