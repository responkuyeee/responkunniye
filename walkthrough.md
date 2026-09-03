# Walkthrough Lengkap: Fase 0 s.d. Fase 7 & Finalisasi Kebijakan Bisnis

Dokumen ini adalah ringkasan komprehensif implementasi dan pengujian sistem **Marketplace Responden (ResponKu)** sesuai seluruh panduan di `PRD.md`, `skill.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`, `TESTING.md`, dan `review_QA.md`.

---

## 1. Fase 0 & 1 — Setup & Akun / Profil
- **Struktur Monorepo**: Backend NestJS 10 + Frontend Next.js 14 App Router.
- **Database & Prisma**: Skema PostgreSQL dengan relasi model lengkap, constraint UNIQUE, dan seed data 3 persona (Researcher, Respondent Baik, Respondent Throttled).
- **UU PDP Consent**: Checkbox terpisah untuk data sensitif agama (`religion_consent_at`) dan pembagian data ke peneliti (`data_share_consent_at`) tercatat dengan timestamp.
- **Autentikasi & OTP**: Flow OTP email/SMS mock, JWT auth guard, dan verifikasi deklarasi umur 18+.

---

## 2. Fase 2 — Token & Wallet
- **Append-Only Ledger**: Dibuat [wallet.service.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/token-wallet/wallet.service.ts) di mana saldo **selalu dihitung dari `SUM(amount)` transaksi**, tidak pernah dari kolom cache yang dimutasi langsung.
- **Konkurensi & Anti-Race-Condition**: Menggunakan query row-level lock `FOR UPDATE` saat reservasi token riset.
- **Idempotency Key**: Diterapkan pada top-up, webhook payment gateway, consume token, dan refund.
- **Split Reward 80:20**: 80% (0.8 token / Rp800) untuk responden dan 20% (0.2 token / Rp200) untuk fee platform.
- **Frontend Wallet**: Halaman [wallet/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/wallet/page.tsx) dengan visualisasi saldo real-time dan modal top-up.

---

## 3. Fase 3 — Research & Matching
- **Endpoint `POST /research`**: Validasi `target_respondent_count >= 50` di DTO & service.
- **Keyword Filter Otomatis (Moderasi Konten)**: Deteksi otomatis kata terlarang (`judi`, `slot`, `gacor`, `taruhan`, `porn`, `penipuan`, dll).
- **Auto-Publish (`POST /research/{id}/publish`)**: Auto-publish tanpa approval manual admin, reserve token otomatis.
- **Cancel & Partial Refund (`POST /research/{id}/cancel`)**: Me-refund sisa token yang belum ter-consume.
- **Listing Responden Terfilter (`GET /research`)**: Otomatis menyaring survei berdasarkan kecocokan profil dan status `throttled`.
- **Form Kalkulasi Biaya Real-time (FE)**: [dashboard/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/dashboard/page.tsx) menghitung biaya token, alokasi 80:20, serta live alert kata terlarang.

---

## 4. Fase 4 — Screening & Quality Control
- **Screening Evaluation (`POST /research/:id/screening`)**: Evaluasi skor jawaban terhadap `pass_threshold` dan constraint `UNIQUE(research_id, respondent_id)`.
- **Partisipasi Survei (`POST /research/:id/participate`)**: Status pengerjaan `in_progress`.
- **Auto-Screening Signals (`POST /research/:id/submit`)**:
  - `too_fast`: Durasi pengerjaan < 30% dari estimasi durasi riset.
  - `attention_check_failed`: Pertanyaan jebakan dijawab keliru.
  - `straight_lining`: >= 5 jawaban berturut-turut bernilai sama.
  - `duplicate_submission`: Deteksi duplikasi respon/device.
- **Jalur Respon (State Machine)**:
  - Clean: Masuk status `hold`, jadwal pencairan diset 24 jam ke depan (`hold_release_at = now + 24h`).
  - Flagged: Masuk status `pending_admin_review`, antrian admin (SLA 48 jam).
- **Scheduled Job Hold Release ([hold-release.job.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/quality-control/hold-release.job.ts))**: Berjalan via `@Cron(CronExpression.EVERY_MINUTE)` untuk mentransisikan jawaban hold ke `approved`.
- **Admin Review Queue & UI**: Endpoint `GET /admin/quality-review` & `POST /admin/quality-review/:id/decision` serta UI [admin/quality/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/admin/quality/page.tsx).
- **Quality Score & Auto-Recovery**: Penyesuaian skor otomatis (+2 approve, -10 reject) dan unthrottle otomatis setelah tepat **5 kali jawaban baik beruntun**.

---

## 5. Fase 5 — Reward & Withdrawal
- **Status Guard**: Reward **hanya dapat dibuat jika partisipasi berstatus `Approved`**.
- **Anti Double Reward**: Penegakan constraint `UNIQUE(participation_id)` di tabel `rewards` dan transaksi DB atomik.
- **Split 80:20 Otomatis**: `respondentTokenAmount: 0.8` (Rp800) dan `platformTokenAmount: 0.2` (Rp200).
- **Pencairan Token (Respondent & Researcher)**:
  - Penarikan token menjadi cash **hanya dapat dilakukan melalui alur penukaran resmi (`POST /withdrawals`)**.
  - **Potongan Fee Tetap 3%**: Berlaku adil baik bagi penarikan oleh responden maupun researcher yang mencairkan kembali sisa token miliknya.
- **Pencegahan Double Request**: Saldo token dipotong langsung di ledger seketika saat permohonan dibuat.
- **Admin Finance Approval & Gateway Disbursement (`POST /admin/withdrawals/:id/approve`)**:
  - Jika disbursement gateway berhasil: status menjadi `completed`.
  - Jika disbursement gateway gagal: status menjadi `failed` dan saldo token **otomatis di-refund ke dompet pengguna di ledger**.
- **Frontend Withdrawal Modal UI**: Modal penarikan dana di [wallet/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/wallet/page.tsx).

---

## 6. Fase 6 — Admin, Notifikasi, Support
- **Role-Based Access Control (RBAC)**: Role `admin_quality` dan `admin_finance` ditegakkan dengan `@Roles()` dan [roles.guard.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/auth/roles.guard.ts).
- **Dua Sub-Area Admin Panel UI**:
  - Sub-area 1: Admin Quality ([admin/quality/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/admin/quality/page.tsx))
  - Sub-area 2: Admin Finance ([admin/finance/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/admin/finance/page.tsx))
- **Notification Service ([notification.service.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/notification/notification.service.ts))**: Trigger untuk reward cair, riset published, review survei, penarikan dana, token expiry warning, dan tiket banding.
- **Customer Support & Dispute Appeal UI ([support/page.tsx](file:///d:/data%20at/kerja/bukaweb/responkunniye/frontend/src/app/support/page.tsx))**: Jalur banding responden atas penolakan survei (`dispute_answer`), takedown riset (`takedown_appeal`), dan kendala penarikan.

---

## 7. Fase 7 — QA & Hardening & Finalisasi Aturan Bisnis (PRD §6)
- **Eskalasi Penalti Pelanggaran Konten Riset ([research.service.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/research/research.service.ts))**:
  - Pelanggaran ke-1: Peringatan (*Warning*) + Takedown riset (refund sisa token yang belum dipakai).
  - Pelanggaran ke-2: **Suspend sementara tepat 1 x 24 jam (24 jam)**.
  - Pelanggaran ke-3: **Ban permanen**.
  - Setiap tindakan dicatat dalam audit trail `admin_reviews`.
- **Token Expiry Scheduled Job ([token-expiry.job.ts](file:///d:/data%20at/kerja/bukaweb/responkunniye/backend/src/modules/token-wallet/token-expiry.job.ts))**:
  - Memeriksa akun tidak aktif (idle $\ge$ 90 hari / 3 bulan): saldo token hangus dicatat di append-only ledger (`amount: -currentBalance`, `type: 'expire'`).
  - **Pembersihan GPS Otomatis**: Data lokasi GPS domicile (`domicileLat`, `domicileLng`, `domicileVerifiedAt`) dihapus otomatis saat akun mencapai 90 hari idle sesuai mandat privasi `SECURITY.md`.
  - **Peringatan Bertahap**: Notifikasi peringatan otomatis terkirim pada H-15 (75 hari idle), H-5 (85 hari idle), dan H-1 (89 hari idle).
- **Audit Invariant Append-Only**: Dipastikan 0 query UPDATE atau DELETE pada tabel `token_transactions`.
- **Audit Secrets & Security**: File `.env` terlindungi di `.gitignore`, verifikasi RBAC untuk seluruh endpoint admin, hashing kata sandi aman.

---

## 8. Ringkasan Pengujian & Build Status

```
================================================================================
Test Suites: 13 passed, 13 total
Tests:       73 passed, 73 total
Snapshots:   0 total
Time:        13.784 s
================================================================================
```

| Modul Test Suite | Jumlah Test | Status |
|---|:---:|:---:|
| `research.service.spec.ts` | 12 | ✅ PASS (mencakup 3 tingkat eskalasi penalti takedown) |
| `token-expiry.job.spec.ts` | 2 | ✅ PASS (90d expiry & GPS clear) |
| `withdrawal.service.spec.ts` | 4 | ✅ PASS (fee 3% & instant deduct) |
| `reward.service.spec.ts` | 3 | ✅ PASS (split 80:20 & UNIQUE check) |
| `roles.guard.spec.ts` | 5 | ✅ PASS (RBAC isolation) |
| `notification.service.spec.ts` | 4 | ✅ PASS (all business triggers) |
| `support.service.spec.ts` | 3 | ✅ PASS (dispute tickets & resolution) |
| `quality-control.service.spec.ts` | 13 | ✅ PASS (signals, hold 24h, recovery) |
| `wallet.service.spec.ts` | 14 | ✅ PASS (append-only ledger, FOR UPDATE) |
| `auth.service.spec.ts` | 7 | ✅ PASS |
| `otp.service.spec.ts` | 6 | ✅ PASS |
| `profile.service.spec.ts` | 2 | ✅ PASS |
| `app.controller.spec.ts` | 1 | ✅ PASS |

- **Backend NestJS**: `nest build` -> **0 Error (PASS)**
- **Frontend Next.js**: `next build` -> **9 Static Routes Prerendered (PASS)**
