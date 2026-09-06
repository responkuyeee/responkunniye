'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  IconSettings,
  IconArrowLeft,
  IconBell,
  IconShieldCheck,
  IconUser,
  IconCheckCircle,
  IconMail,
  IconLogOut,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconActivity,
  IconLock,
} from '@/components/Icons';

/* ─── Inject animations ─── */
if (typeof document !== 'undefined' && !document.getElementById('settings-anims')) {
  const s = document.createElement('style');
  s.id = 'settings-anims';
  s.textContent = `
    @keyframes settFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .sett-fade-up { animation: settFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    .sett-nav-item { transition: all 0.15s ease; border-radius: var(--radius-sm); }
    .sett-nav-item:hover { background: var(--neutral-bg) !important; }
    .sett-nav-item.active { background: var(--primary-blue-light) !important; color: var(--primary-blue) !important; }
    .sett-toggle { width:44px; height:24px; border-radius:12px; border:none; cursor:pointer; position:relative; transition:background-color 0.2s ease; }
    .sett-toggle::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#FFFFFF; transition:transform 0.2s cubic-bezier(0.16,1,0.3,1); box-shadow:0 1px 3px rgba(0,0,0,0.15); }
    .sett-toggle.on { background-color: var(--accent-green); }
    .sett-toggle.on::after { transform: translateX(20px); }
    .sett-toggle.off { background-color: #CBD5E1; }
    .sett-toggle.off::after { transform: translateX(0); }
    .sett-row { transition: all 0.15s ease; }
    .sett-row:hover { background: var(--neutral-bg) !important; }
    .sett-toast { animation: settFadeUp 0.3s ease both; }
  `;
  document.head.appendChild(s);
}

type SettingsTab = 'general' | 'notifications' | 'privacy' | 'sessions';

const TABS: { id: SettingsTab; icon: React.ReactNode; label: string }[] = [
  { id: 'general', icon: <IconSettings size={15} />, label: 'Umum' },
  { id: 'notifications', icon: <IconBell size={15} />, label: 'Notifikasi' },
  { id: 'privacy', icon: <IconShieldCheck size={15} />, label: 'Privasi & Keamanan' },
  { id: 'sessions', icon: <IconActivity size={15} />, label: 'Sesi Aktif' },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`sett-toggle ${on ? 'on' : 'off'}`}
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
    />
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // General settings
  const [language, setLanguage] = useState('id');
  const [theme, setTheme] = useState('light');
  const [compactMode, setCompactMode] = useState(false);

  // Notification settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [surveyReminder, setSurveyReminder] = useState(true);
  const [rewardNotif, setRewardNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // User info
  const [userName, setUserName] = useState('Budi Santoso');
  const [userEmail, setUserEmail] = useState('budi.santoso@example.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login?redirect=/settings');
        return;
      }
      setIsAuthenticated(true);
      const n = localStorage.getItem('user_name');
      const e = localStorage.getItem('user_email');
      if (n) setUserName(n);
      if (e) setUserEmail(e);
    }
    setMounted(true);
  }, [router]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Mock sessions
  const sessions = [
    { device: 'Chrome · Windows 11', location: 'Jakarta, Indonesia', lastActive: 'Saat ini aktif', current: true },
    { device: 'Safari · iPhone 15', location: 'Jakarta, Indonesia', lastActive: '2 jam lalu', current: false },
    { device: 'Firefox · macOS', location: 'Bandung, Indonesia', lastActive: '3 hari lalu', current: false },
  ];

  const sectionTitle: React.CSSProperties = {
    fontSize: '17px', fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '4px',
  };
  const sectionDesc: React.CSSProperties = {
    fontSize: '13px', color: 'var(--neutral-text-muted)', marginBottom: '24px',
  };

  if (isAuthenticated === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <IconLock size={26} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '8px' }}>
            Pengaturan Terkunci
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--neutral-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Pengaturan akun dan preferensi sistem hanya dapat diakses setelah masuk ke akun Anda.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/login?redirect=/settings" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
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
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--neutral-border)', backgroundColor: '#FFFFFF', position: 'sticky', top: 0, zIndex: 40, boxShadow: 'var(--shadow-xs)' }}>
        <div className="container" style={{ maxWidth: '1080px', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/" style={{ display: 'flex' }}><Logo height={28} /></Link>
            <span style={{ height: '16px', width: '1px', backgroundColor: 'var(--neutral-border)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)' }}>
              <IconSettings size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
              Pengaturan
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/profile" className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', gap: '5px' }}>
              <IconUser size={14} /> <span className="hide-on-mobile">Profil</span>
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', gap: '5px' }}>
              <IconArrowLeft size={14} /> <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ maxWidth: '1080px', padding: '24px 16px', flex: 1 }}>
        {/* Toast */}
        {toastMsg && (
          <div className="sett-toast" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
            borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-green-light)',
            border: '1px solid #C3EAD5', color: 'var(--accent-green)', fontSize: '13px',
            fontWeight: 600, marginBottom: '16px',
          }}>
            <IconCheckCircle size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '24px' }} className="grid-layout-sidebar">
          {/* Sidebar */}
          <nav className={mounted ? 'sett-fade-up' : ''}>
            {/* User info card */}
            <div className="card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--primary-blue)', color: '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 800,
                }}>
                  {userName.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--neutral-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
                </div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="card" style={{ padding: '10px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`sett-nav-item ${activeTab === tab.id ? 'active' : ''}`}
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

          {/* Content */}
          <div className={mounted ? 'sett-fade-up' : ''} style={{ animationDelay: '0.08s' }}>

            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={sectionTitle}>Pengaturan Umum</h2>
                <p style={sectionDesc}>Sesuaikan preferensi tampilan dan bahasa.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <SettingRow
                    label="Bahasa Aplikasi"
                    description="Pilih bahasa untuk antarmuka pengguna"
                    action={
                      <select value={language} onChange={(e) => { setLanguage(e.target.value); showToast('Bahasa berhasil diubah.'); }}
                        style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', width: '160px' }}>
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    }
                  />
                  <SettingRow
                    label="Tema Tampilan"
                    description="Pilih mode tampilan yang nyaman di mata"
                    action={
                      <select value={theme} onChange={(e) => { setTheme(e.target.value); showToast('Tema berhasil diubah.'); }}
                        style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', width: '160px' }}>
                        <option value="light">Terang</option>
                        <option value="dark">Gelap (Coming Soon)</option>
                        <option value="system">Ikuti Sistem</option>
                      </select>
                    }
                  />
                  <SettingRow
                    label="Mode Ringkas"
                    description="Tampilkan lebih banyak konten dengan jarak antar elemen lebih kecil"
                    action={<Toggle on={compactMode} onChange={(v) => { setCompactMode(v); showToast(v ? 'Mode ringkas diaktifkan.' : 'Mode ringkas dinonaktifkan.'); }} />}
                    noBorder
                  />
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={sectionTitle}>Preferensi Notifikasi</h2>
                <p style={sectionDesc}>Kontrol jenis notifikasi yang ingin Anda terima.</p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0 10px', marginBottom: '4px' }}>
                    Channel Notifikasi
                  </div>
                  <SettingRow
                    label="Notifikasi Email"
                    description="Terima update melalui email terdaftar"
                    action={<Toggle on={emailNotif} onChange={setEmailNotif} />}
                  />
                  <SettingRow
                    label="Push Notification"
                    description="Notifikasi langsung di browser"
                    action={<Toggle on={pushNotif} onChange={setPushNotif} />}
                  />

                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 0 10px', marginBottom: '4px', borderTop: '1px solid var(--neutral-border)', marginTop: '8px' }}>
                    Jenis Notifikasi
                  </div>
                  <SettingRow
                    label="Pengingat Survei"
                    description="Reminder untuk survei yang belum dikerjakan"
                    action={<Toggle on={surveyReminder} onChange={setSurveyReminder} />}
                  />
                  <SettingRow
                    label="Reward & Pencairan"
                    description="Notifikasi saat token reward masuk atau dicairkan"
                    action={<Toggle on={rewardNotif} onChange={setRewardNotif} />}
                  />
                  <SettingRow
                    label="Ringkasan Mingguan"
                    description="Email digest mingguan aktivitas akun"
                    action={<Toggle on={weeklyDigest} onChange={setWeeklyDigest} />}
                  />
                  <SettingRow
                    label="Info & Promo"
                    description="Update produk, tips, dan penawaran khusus"
                    action={<Toggle on={marketingNotif} onChange={setMarketingNotif} />}
                    noBorder
                  />
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--neutral-border)', marginTop: '8px' }}>
                  <button type="button" className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}
                    onClick={() => showToast('Preferensi notifikasi berhasil disimpan.')}>
                    Simpan Preferensi
                  </button>
                </div>
              </div>
            )}

            {/* PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={sectionTitle}>Privasi & Keamanan</h2>
                <p style={sectionDesc}>Kelola siapa yang bisa melihat data Anda dan tingkatkan keamanan akun.</p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0 10px', marginBottom: '4px' }}>
                    Visibilitas
                  </div>
                  <SettingRow
                    label="Profil Publik"
                    description="Izinkan peneliti melihat nama dan badge Anda (tanpa data sensitif)"
                    action={<Toggle on={profileVisible} onChange={setProfileVisible} />}
                  />
                  <SettingRow
                    label="Status Online"
                    description="Tampilkan status aktif Anda kepada pengguna lain"
                    action={<Toggle on={showOnlineStatus} onChange={setShowOnlineStatus} />}
                  />

                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neutral-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 0 10px', marginBottom: '4px', borderTop: '1px solid var(--neutral-border)', marginTop: '8px' }}>
                    Keamanan
                  </div>
                  <SettingRow
                    label="Autentikasi Dua Faktor (2FA)"
                    description="Tambahkan lapisan keamanan dengan OTP saat login"
                    action={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {twoFactor && <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Aktif</span>}
                        <Toggle on={twoFactor} onChange={(v) => { setTwoFactor(v); showToast(v ? '2FA berhasil diaktifkan.' : '2FA dinonaktifkan.'); }} />
                      </div>
                    }
                  />
                  <SettingRow
                    label="Bagikan Data Analitik"
                    description="Bantu kami meningkatkan produk dengan data penggunaan anonim"
                    action={<Toggle on={shareAnalytics} onChange={setShareAnalytics} />}
                    noBorder
                  />
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--neutral-border)', marginTop: '8px' }}>
                  <button type="button" className="btn btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}
                    onClick={() => showToast('Pengaturan privasi berhasil disimpan.')}>
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}

            {/* SESSIONS */}
            {activeTab === 'sessions' && (
              <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={sectionTitle}>Sesi Aktif</h2>
                <p style={sectionDesc}>Perangkat yang sedang login ke akun Anda.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sessions.map((session, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 18px', borderRadius: 'var(--radius-lg)',
                        border: `1px solid ${session.current ? '#D1E3FC' : 'var(--neutral-border)'}`,
                        backgroundColor: session.current ? 'var(--primary-blue-light)' : '#FFFFFF',
                        flexWrap: 'wrap', gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                          backgroundColor: session.current ? '#FFFFFF' : 'var(--neutral-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: session.current ? 'var(--shadow-xs)' : 'none',
                        }}>
                          <IconActivity size={16} color={session.current ? 'var(--primary-blue)' : 'var(--neutral-text-muted)'} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neutral-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {session.device}
                            {session.current && <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '2px 8px' }}>Sesi ini</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)' }}>
                            {session.location} · {session.lastActive}
                          </div>
                        </div>
                      </div>

                      {!session.current && (
                        <button type="button" className="btn btn-secondary"
                          onClick={() => showToast(`Sesi ${session.device} berhasil dikeluarkan.`)}
                          style={{ fontSize: '11px', padding: '6px 12px', gap: '5px', flexShrink: 0, color: 'var(--danger)' }}>
                          <IconLogOut size={13} />
                          <span>Keluarkan</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--neutral-border)', marginTop: '16px' }}>
                  <button type="button" className="btn"
                    style={{ fontSize: '12px', padding: '8px 18px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderColor: '#FECACA' }}
                    onClick={() => showToast('Semua sesi selain sesi ini berhasil dikeluarkan.')}>
                    <IconLogOut size={14} />
                    Keluarkan Semua Sesi Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Setting Row Component ─── */
function SettingRow({ label, description, action, noBorder }: {
  label: string;
  description: string;
  action: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className="sett-row"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 8px', gap: '16px',
        borderBottom: noBorder ? 'none' : '1px solid var(--neutral-border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--neutral-text)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--neutral-text-muted)', lineHeight: 1.4 }}>{description}</div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {action}
      </div>
    </div>
  );
}
