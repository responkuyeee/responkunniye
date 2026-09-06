# GAP_ANALYSIS.md — Analisis Kesenjangan & Risiko Kritis

> **Dibuat:** 2026-09-06  
> **Dibuat oleh:** Analisis otomatis (Antigravity / Claude)  
> **Status:** Aktif — perbarui setiap kali gap ditutup  
> **Referensi:** `PRD.md`, `SECURITY.md`, `todo.md`, `skill.md`, `DATABASE_SCHEMA.md`

---

## Ringkasan Eksekutif

Proyek ini memiliki **fondasi backend yang solid** — semua modul bisnis inti (auth, research, QC, wallet, withdrawal, support) sudah diimplementasi dengan logika yang benar dan tes unit. Namun ada **6 lubang P0** yang akan melumpuhkan sistem di hari pertama production, dan **4 lubang P1** yang wajib ditutup sebelum go-live publik.

> ⚠️ Sistem ini saat ini tidak lebih dari **demo lokal yang fungsional**. Backend dan frontend berjalan di dunia paralel yang tidak terhubung. Payment tidak real. OTP tidak persisten. Email tidak terkirim.

---

## Status Komponen Yang Sudah Solid

Sebelum membahas gap, berikut komponen yang sudah benar dan tidak perlu disentuh kecuali ada bug:

| Komponen | File Utama | Status |
|---|---|---|
| Auth (register, login, JWT, RBAC) | `backend/src/modules/auth/` | ✅ Solid |
| OTP rate limiting logic | `auth/otp.service.ts` | ✅ Logic benar (masalah ada di storage-nya) |
| Token ledger append-only | `token-wallet/wallet.service.ts` | ✅ Solid |
| Research CRUD + keyword filter + auto-publish | `research/research.service.ts` | ✅ Solid |
| Screening + scoring/threshold | `quality-control/quality-control.service.ts` | ✅ Solid |
| Auto-screening (anti-speeding, attention check, straight-lining) | QC service | ✅ Solid |
| Hold 24 jam cron job | `quality-control/hold-release.job.ts` | ✅ Solid |
| Quality Score + auto-recovery (5 berturut-turut) | QC service | ✅ Solid |
| Withdrawal + fee 3% + admin approve flow | `withdrawal/withdrawal.service.ts` | ✅ Solid |
| Token expiry job (H-15, H-5, H-1, hangus) | `token-wallet/token-expiry.job.ts` | ✅ Solid |
| Notification in-app (simpan ke DB) | `notification/notification.service.ts` | ✅ Solid |
| Support ticket + banding | `support/support.service.ts` | ✅ Solid |
| RBAC guard (admin_quality, admin_finance) | `auth/roles.guard.ts` | ✅ Solid |
| Unit tests seluruh service | `*.spec.ts` files | ✅ Ada |

---

## 🔴 GAP P0 — Harus Ditutup Sebelum Beta Launch

> P0 = Sistem tidak bisa beroperasi sama sekali tanpa ini.

---

### GAP-01 · OTP Disimpan In-Memory (`Map`) — Auth Lumpuh Saat Scale

**File terdampak:** [`backend/src/modules/auth/otp.service.ts`](./backend/src/modules/auth/otp.service.ts)

**Kode bermasalah (baris 17–18):**
```typescript
private readonly otpStore = new Map<string, OtpRecord>();
private readonly rateLimitStore = new Map<string, RateLimitRecord>();
```

**Mengapa ini berbahaya:**
1. **Server restart → semua OTP hilang.** User yang sedang di tengah proses verifikasi tidak bisa melanjutkan.
2. **Horizontal scaling (2+ pod)** → OTP dikirim ke pod A, user verify ke pod B → selalu gagal karena `Map` tidak dishare antar proses.
3. **Rate limit juga hilang saat restart** → serangan OTP spam bisa diulang setelah restart.
4. Di production dengan PM2 cluster mode atau container orchestration, ini sudah pasti bermasalah.

**Solusi yang direkomendasikan:**
- **Primary:** Integrasi Redis (`ioredis` atau `@nestjs/cache-manager` dengan Redis adapter) — simpan OTP dengan TTL 10 menit.
- **Fallback sementara:** Tabel database `otp_codes` dengan kolom `expires_at` + cron cleanup — lebih lambat tapi tidak kehilangan data.

**Prioritas:** 🔴 P0 — tanpa ini, auth production tidak bisa diandalkan.

---

### GAP-02 · Payment Gateway Masih Mock — Revenue = Rp 0

**File terdampak:**
- [`backend/src/modules/token-wallet/wallet.service.ts`](./backend/src/modules/token-wallet/wallet.service.ts) — fungsi `initTopup`
- [`backend/src/modules/withdrawal/withdrawal.service.ts`](./backend/src/modules/withdrawal/withdrawal.service.ts) — fungsi approve disbursement

**Kondisi saat ini:**
- Flow topup membuat record `payment` di database dan menunggu webhook masuk.
- Tidak ada kode yang memanggil Midtrans/Xendit untuk membuat payment link / QRIS / VA.
- Webhook signature verification kemungkinan besar masih placeholder (perlu diverifikasi).
- Disbursement (withdrawal yang diapprove admin) tidak memanggil API payout gateway.

**Dampak konkret:**
- User klik "Top Up" → tidak ada redirect ke halaman pembayaran → transaksi tidak terjadi.
- Admin approve withdrawal → saldo token dipotong dari ledger, tapi uang tidak pernah cair ke rekening respondent.
- **Platform tidak menghasilkan revenue sama sekali.**

**Solusi:**
- Pilih satu gateway: **Midtrans** (lebih mudah integrasi QRIS/VA) atau **Xendit** (disbursement lebih fleksibel).
- Implementasi `initTopup` → panggil `POST /v2/charge` (Midtrans) atau buat invoice (Xendit) → kembalikan `payment_url` ke frontend.
- Verifikasi webhook signature dengan secret key dari provider.
- Implementasi disbursement API untuk approval withdrawal.

**Prioritas:** 🔴 P0 — tanpa ini platform tidak bisa menghasilkan uang.

---

### GAP-03 · Email Notifikasi Hanya `logger.log` — Tidak Ada Yang Terkirim

**File terdampak:** [`backend/src/modules/notification/notification.service.ts`](./backend/src/modules/notification/notification.service.ts)

**Kode bermasalah (baris 30):**
```typescript
this.logger.log(`[Notification: In-App & Email] user=${userId}, type=${type}, msg="${message}"`);
// ↑ Hanya mencetak ke console/log file. Tidak ada email yang dikirim.
```

**Juga terdampak:** [`backend/src/modules/auth/otp.service.ts`](./backend/src/modules/auth/otp.service.ts) baris 39:
```typescript
this.logger.log(`[OTP Provider: ${type.toUpperCase()}] Mengirim kode OTP ${code} ke ${target}`);
// ↑ OTP tidak benar-benar dikirim via email/SMS.
```

**Dampak konkret:**
- User mendaftar → tidak mendapat email OTP → tidak bisa verifikasi akun.
- Reward cair → user tidak tahu → engagement rendah.
- Token mau hangus → user tidak dapat peringatan → mengeluh setelah kehilangan saldo.
- Withdrawal diproses → user tidak tahu statusnya.

**Solusi:**
- **Email:** Integrasi `nodemailer` dengan provider SMTP (SendGrid / AWS SES / Mailgun).
- **SMS OTP:** Integrasi Zenziva, Twilio, atau Vonage untuk SMS.
- Pisahkan `NotificationService.send()` menjadi dua channel: in-app (sudah ada ke DB) + email (perlu ditambah).

**Prioritas:** 🔴 P0 — tanpa ini user tidak bisa registrasi (OTP tidak terkirim).

---

### GAP-04 · Frontend Masih 100% Dummy Data — Backend Tidak Pernah Dipanggil

**File terdampak:** Hampir semua halaman frontend:
- [`frontend/src/app/research/[id]/page.tsx`](./frontend/src/app/research/%5Bid%5D/page.tsx) — data research hardcoded
- [`frontend/src/app/feed/page.tsx`](./frontend/src/app/feed/page.tsx) — daftar riset hardcoded
- [`frontend/src/app/dashboard/page.tsx`](./frontend/src/app/dashboard/page.tsx) — statistik hardcoded
- [`frontend/src/app/wallet/page.tsx`](./frontend/src/app/wallet/page.tsx) — saldo dan riwayat hardcoded

**Contoh kode bermasalah di research detail (baris 58–71):**
```typescript
const [research, setResearch] = useState<ResearchDetail>({
  id: researchId,
  title: 'Evaluasi Dampak Regulasi AI pada Pengambilan Keputusan Klinis', // ← hardcoded
  rewardToken: 15,
  surveyUrl: 'https://forms.gle/demo-survey-responku', // ← demo URL tidak nyata
  ...
});
// Tidak ada useEffect yang memanggil fetch() ke backend API
```

**Dampak konkret:**
- Semua logika bisnis yang sudah diimplementasi di backend (filter research, saldo wallet, quality score, screening) tidak pernah dipakai.
- Yang terlihat "berfungsi" di browser adalah ilusi — datanya dari `useState` lokal.
- Backend dan frontend **berjalan di dunia paralel yang tidak terhubung**.

**Solusi:**
- Buat centralized API client (lihat GAP-05).
- Ganti semua `useState` dengan dummy data menjadi `useEffect` + `fetch()` ke backend.
- Implementasi loading state dan error state yang proper.

**Prioritas:** 🔴 P0 — tanpa ini platform tidak bisa diuji end-to-end sama sekali.

---

### GAP-05 · Tidak Ada API Client / Auth Token Handling di Frontend

**Kondisi saat ini:**
Setiap halaman frontend mengambil token JWT secara manual:
```typescript
const token = localStorage.getItem('access_token'); // ada di setiap page
```

Tidak ada:
- Axios/fetch wrapper terpusat dengan auto-inject `Authorization: Bearer <token>` header
- Interceptor untuk menangani response `401 Unauthorized` (token expired → redirect ke login)
- Centralized error handling untuk response error dari API
- Refresh token flow (saat ini user harus login ulang setiap 7 hari)

**Dampak konkret:**
- Token expired → user mendapat error JSON mentah di layar, bukan redirect ke `/login`.
- Setiap developer yang menambah halaman baru hampir pasti lupa attach `Authorization` header.
- Race condition: token dihapus di tengah request → silent failure tanpa penanganan.

**Solusi:**
```typescript
// Contoh: frontend/src/utils/api.ts
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

**Prioritas:** 🔴 P0 — prasyarat untuk GAP-04.

---

### GAP-06 · Tidak Ada HTTP Rate Limiting di Level Server

**File terdampak:** [`backend/src/main.ts`](./backend/src/main.ts)

**Kondisi saat ini:**
```typescript
// Tidak ada ThrottlerModule
// Tidak ada helmet
// Tidak ada global rate limiter
```

`SECURITY.md` menyebutkan rate limiting wajib:
- Login: maks 5 percobaan/15 menit per IP+email
- OTP request: maks 3 kali/10 menit per nomor
- Submit survey: rate limit per user

Namun saat ini rate limit **hanya ada di level OTP (in-memory yang hilang saat restart)**, tidak di level HTTP.

**Dampak konkret:**
- Endpoint `POST /auth/login` bisa di-brute force tanpa batas.
- `POST /payment/webhook` bisa di-spam → ledger bisa dikacaukan.
- Serangan DDoS sederhana (curl loop) bisa melumpuhkan server.

**Solusi:**
```typescript
// app.module.ts — tambahkan:
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

ThrottlerModule.forRoot([{
  name: 'global',
  ttl: 60_000,
  limit: 30,
}]),

// main.ts — tambahkan:
import helmet from 'helmet';
app.use(helmet());
```

**Prioritas:** 🔴 P0 — wajib sebelum expose ke internet.

---

## 🟠 GAP P1 — Harus Ditutup Sebelum Go-Live

> P1 = Fitur inti yang tidak bisa digunakan, tapi sistem masih bisa berjalan secara teknis.

---

### GAP-07 · `ScheduleModule` Kemungkinan Belum Diregister

**File terdampak:** [`backend/src/app.module.ts`](./backend/src/app.module.ts)

**Kondisi saat ini — `app.module.ts` imports:**
```typescript
// PrismaModule, AuthModule, ProfileModule, ResearchModule,
// WalletModule, QualityControlModule, WithdrawalModule,
// NotificationModule, SupportModule
// ↑ TIDAK ADA ScheduleModule.forRoot() !
```

Tanpa `ScheduleModule.forRoot()`, semua decorator `@Cron()` tidak akan pernah dipanggil oleh NestJS scheduler.

**Cron job yang terdampak:**
- `HoldReleaseJob.handleHoldReleaseCron()` — setiap 1 menit, release partisipasi dari hold 24 jam
- `TokenExpiryJob.handleDailyCron()` — setiap tengah malam, proses token hangus & warning

**Dampak:**
- Semua reward respondent tertahan di status `hold` selamanya — tidak pernah cair otomatis.
- Token idle tidak pernah hangus, peringatan tidak pernah terkirim.

**Solusi:**
```typescript
// app.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ← TAMBAHKAN INI
    // ... modul lainnya
  ],
})
```

**Prioritas:** 🟠 P1 — setelah P0 selesai, ini yang pertama dicek.

---

### GAP-08 · Export CSV Hasil Riset Belum Diimplementasi

**Referensi PRD:** §3.2 — "Export hasil (CSV) termasuk data respondent (nama, kontak)"

**Kondisi saat ini:**
Tidak ditemukan endpoint `GET /research/:id/export` di [`research.controller.ts`](./backend/src/modules/research/research.controller.ts).

**Dampak:**
- Researcher tidak bisa mendapatkan data responden setelah riset selesai.
- Ini adalah **nilai utama platform** bagi researcher — mereka bayar token untuk mendapat data ini.
- Tanpa export, researcher tidak punya alasan untuk repeat purchase.

**Syarat implementasi (sesuai SECURITY.md):**
- Hanya researcher pemilik riset yang bisa export.
- Riset harus berstatus `completed`.
- Hanya respondent yang telah memberikan `data_share_consent_at` yang datanya boleh masuk CSV.
- Audit log ke `admin_reviews` setiap kali export dilakukan.

**Prioritas:** 🟠 P1 — KPI utama platform (`repeat researcher rate`) bergantung pada ini.

---

### GAP-09 · Form Create Research Belum Terhubung ke Backend

**File terdampak:** [`frontend/src/app/research/create/`](./frontend/src/app/research/create/)

**Kondisi saat ini:**
Form create research mungkin sudah ada di UI, tapi berdasarkan analisis pola frontend (semua halaman masih dummy data), form ini kemungkinan belum memanggil `POST /research` ke backend.

**Dampak:**
- Core researcher journey — satu-satunya alur yang menghasilkan revenue — tidak bisa dijalankan end-to-end.
- Kalkulator biaya real-time (token × jumlah responden) belum tervalidasi dengan saldo aktual.

**Yang harus diverifikasi dan diimplementasi:**
1. Form submit → `POST /api/research` dengan JWT
2. Validasi saldo sebelum submit (di frontend: tampilkan estimasi biaya; di backend: sudah ada)
3. Handle error dari backend (keyword terlarang, saldo tidak cukup, dll)
4. Redirect ke detail riset setelah berhasil publish

**Prioritas:** 🟠 P1.

---

### GAP-10 · Tidak Ada Guard `isVerified` untuk Endpoint Inti

**Kondisi saat ini:**
OTP endpoint sudah ada (`POST /auth/verify-otp`), dan kolom `email_verified_at` / `phone_verified_at` tersimpan di DB. Tapi tidak ada guard/middleware yang memeriksa apakah user sudah terverifikasi sebelum mengakses endpoint inti.

**Dampak:**
- User bisa daftar → langsung `POST /research` → buat riset tanpa verifikasi email/HP sama sekali.
- User tanpa verifikasi bisa melakukan topup dan withdrawal.
- Celah anti-fraud: nomor HP tidak terverifikasi bisa dipakai berulang.

**Solusi:**
```typescript
// Buat guard baru: verified-user.guard.ts
@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user.emailVerifiedAt || !user.phoneVerifiedAt) {
      throw new ForbiddenException('Akun belum diverifikasi. Selesaikan verifikasi OTP terlebih dahulu.');
    }
    return true;
  }
}
// Terapkan di endpoint: POST /research, POST /wallet/topup, POST /withdrawals
```

**Prioritas:** 🟠 P1.

---

## 📊 Tabel Ringkasan Semua Gap

| ID | Judul | File Utama | Dampak | Priority | Status |
|---|---|---|---|---|---|
| GAP-01 | OTP in-memory (Redis missing) | `auth/otp.service.ts` | Auth lumpuh saat scale/restart | 🔴 P0 | ❌ Belum |
| GAP-02 | Payment gateway masih mock | `wallet.service.ts` | Revenue = Rp 0 | 🔴 P0 | ❌ Belum |
| GAP-03 | Email tidak terkirim | `notification.service.ts` | User tidak dapat OTP / notifikasi kritis | 🔴 P0 | ❌ Belum |
| GAP-04 | Frontend dummy data | semua `page.tsx` | Backend tidak dipakai sama sekali | 🔴 P0 | ❌ Belum |
| GAP-05 | Tidak ada API client/auth wrapper | `frontend/src/utils/` | Token expired → error mentah | 🔴 P0 | ❌ Belum |
| GAP-06 | Tidak ada HTTP rate limiting | `main.ts` | Rentan brute force & DDoS | 🔴 P0 | ❌ Belum |
| GAP-07 | `ScheduleModule` belum diregister | `app.module.ts` | Cron job tidak jalan | 🟠 P1 | ❌ Belum |
| GAP-08 | Export CSV belum ada | `research.controller.ts` | Researcher tidak dapat output riset | 🟠 P1 | ❌ Belum |
| GAP-09 | Form create research belum connect API | `research/create/page.tsx` | Core researcher journey broken | 🟠 P1 | ❌ Belum |
| GAP-10 | Tidak ada guard `isVerified` | perlu dibuat baru | User bisa bypass OTP verification | 🟠 P1 | ❌ Belum |

---

## 🗺️ Urutan Pengerjaan yang Direkomendasikan

```
SPRINT 1 — Koneksi & Infrastruktur Dasar (P0)
───────────────────────────────────────────────
[ ] GAP-07: Daftarkan ScheduleModule.forRoot() di app.module.ts  ← 5 menit, wajib pertama
[ ] GAP-06: Pasang @nestjs/throttler + helmet di main.ts          ← ~1 jam
[ ] GAP-01: Migrasi OTP ke Redis (atau tabel DB sementara)        ← ~1 hari
[ ] GAP-03: Integrasi email SMTP (Nodemailer + SendGrid)          ← ~1 hari
[ ] GAP-03: Integrasi SMS OTP (Zenziva / Twilio)                  ← ~1 hari

SPRINT 2 — Koneksi Frontend ↔ Backend (P0)
────────────────────────────────────────────
[ ] GAP-05: Buat frontend/src/utils/api.ts (axios wrapper)        ← ~2 jam
[ ] GAP-04: Sambungkan /feed → GET /research (dengan filter)      ← ~1 hari
[ ] GAP-04: Sambungkan /wallet → GET /wallet + GET /wallet/transactions ← ~4 jam
[ ] GAP-04: Sambungkan /dashboard → semua statistik dari API      ← ~1 hari
[ ] GAP-09: Sambungkan form /research/create → POST /research     ← ~1 hari
[ ] GAP-04: Sambungkan /research/[id] → GET /research/:id         ← ~4 jam

SPRINT 3 — Payment & Go-Live Readiness (P0 + P1)
──────────────────────────────────────────────────
[ ] GAP-02: Integrasi Midtrans/Xendit untuk topup (payment link)  ← ~2 hari
[ ] GAP-02: Integrasi disbursement API untuk withdrawal           ← ~1 hari
[ ] GAP-02: Verifikasi webhook signature dengan secret provider   ← ~4 jam
[ ] GAP-10: Buat VerifiedUserGuard + terapkan ke endpoint inti    ← ~4 jam
[ ] GAP-08: Implementasi GET /research/:id/export (CSV)           ← ~1 hari
```

---

## Cara Update Dokumen Ini

Setiap kali sebuah gap ditutup:
1. Ubah kolom **Status** di tabel ringkasan dari `❌ Belum` → `✅ Selesai`
2. Tambahkan baris ke changelog di bawah dengan tanggal dan nama implementer
3. Update `todo.md` dengan menandai task terkait sebagai `[x]`

---

## Changelog

| Tanggal | Gap | Perubahan | Oleh |
|---|---|---|---|
| 2026-09-06 | — | Dokumen dibuat dari hasil analisis kode | Antigravity |
