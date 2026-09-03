# todo.md — Task Aktif

> Ini adalah source of truth task yang sedang/akan dikerjakan. Update status di sini setiap ada perubahan — jangan biarkan basi. Detail requirement per task ada di `PRD.md`, aturan angka ada di `skill.md`.

## Fase 0 — Setup
- [x] Init repo (backend NestJS + frontend Next.js, monorepo atau terpisah — putuskan & dokumentasikan di `architecture.md`)
- [x] Setup PostgreSQL + migration tool (mis. Prisma/TypeORM)
- [x] Jalankan DDL dari `DATABASE_SCHEMA.md` sebagai migration awal
- [x] Setup CI (lint + test on PR)
- [x] Copy `.env.example` → `.env`, isi kredensial dev

## Fase 1 — Akun & Profil
- [x] Endpoint `POST /auth/register` + validasi age_declared_18plus wajib true
- [x] Integrasi OTP provider (email + SMS)
- [x] Endpoint `POST /auth/verify-otp`
- [x] Endpoint `POST /auth/login` + JWT
- [x] Endpoint `GET/PUT /profile` + consent checkbox agama & data-share (timestamp wajib tersimpan)
- [x] Endpoint `POST /profile/domicile-verify` (GPS)
- [x] UI: dashboard dengan toggle mode Researcher/Respondent

## Fase 2 — Token & Wallet (PRIORITAS TINGGI)
- [x] Tabel `token_wallets` + `token_transactions` (append-only, lihat `DATABASE_SCHEMA.md`)
- [x] Fungsi hitung saldo dari SUM ledger
- [x] Endpoint `POST /wallet/topup` + idempotency key
- [x] Webhook payment gateway (`POST /payment/webhook`) + verifikasi signature
- [x] Unit test: race condition reserve token (lihat `TESTING.md`)
- [x] Unit test: idempotency topup


## Fase 3 — Research & Matching
- [x] Endpoint `POST /research` + validasi `target_respondent_count >= 50`
- [x] Kalkulasi biaya real-time di form (FE)
- [x] Keyword filter otomatis saat submit research
- [x] Endpoint `POST /research/{id}/publish` (auto, cek saldo saja, tanpa review admin)
- [x] Endpoint `GET /research` dengan auto-filter (umur, gender, domisili, quality score)
- [x] Endpoint `POST /research/{id}/cancel` + refund logic


## Fase 4 — Screening & Quality Control
- [x] Screening question CRUD + scoring/threshold
- [x] Endpoint `POST /research/{id}/screening`
- [x] Endpoint `POST /research/{id}/participate`
- [x] Endpoint `POST /research/{id}/submit` + trigger auto-screening
- [x] Logic auto-screening signal (waktu, attention check, straight-lining, duplicate)
- [x] Hold 24 jam release job (scheduled task)
- [x] Admin Review queue endpoint + UI
- [x] Quality Score update logic (naik/turun) + auto-recovery setelah N jawaban baik


## Fase 5 — Reward & Withdrawal
- [x] Reward creation logic (hanya dari status `Approved`, split 80:20)
- [x] Unit test: cegah double reward (constraint UNIQUE)
- [x] Endpoint `POST /withdrawals` + fee 3%
- [x] Endpoint `POST /admin/withdrawals/{id}/approve`
- [x] Integrasi disbursement payment gateway


## Fase 6 — Admin, Notifikasi, Support
- [x] Role `admin_quality` & `admin_finance` (RBAC)
- [x] Admin panel UI (dua sub-area terpisah)
- [x] Notification triggers (lihat tabel di `skill.md`/PRD.md)
- [x] Endpoint `POST /support/tickets` + UI banding


## Fase 7 — QA & Hardening
- [x] Jalankan seluruh checklist `review_QA.md`
- [x] Security review sesuai `SECURITY.md`
- [x] Cek scheduled job untuk expiry token (idle 3 bulan) + notifikasi bertahap H-15/H-5/H-1


## Keputusan Final PRD.md §6 (Selesai Dikonfirmasi)
- [x] Jumlah "jawaban bagus berturut-turut" untuk pemulihan Quality Score: Ditetapkan **5 kali** berturut-turut (diimplementasikan di `QualityControlService`).
- [x] Lama suspend pelanggaran ke-2 kebijakan konten: Ditetapkan **1 x 24 jam (24 jam)** (diimplementasikan di `ResearchService`).
- [x] Pencairan token oleh Researcher: Diperbolehkan via alur **penukaran / withdrawal satu-satunya cara dengan potongan fee platform 3%** (diimplementasikan di `WithdrawalService`).

## Fase 8 — Revisi Tampilan & UI/UX Revamp (Rujuk `design.md`)
- [ ] Update desain token CSS & tema dark glassmorphism di `frontend/src/app/globals.css`
- [ ] Polish komponen interaktif Navbar & Mode Switcher (Researcher ↔ Respondent)
- [ ] Revamp Landing Page (`/`): Bento grid, hero glowing mesh, dual CTA & live simulation
- [ ] Revamp Dashboard (`/dashboard`): Form create research wizard + kalkulator real-time, feed riset transparan & quality meter
- [ ] Revamp Wallet (`/wallet`): Fintech virtual balance card, paket top-up, & withdrawal fee 3% breakdown
- [ ] Revamp Admin & Support Panel: High-density tables, quick-audit modal, tiket banding UI
- [ ] Validasi respon visual & responsive layout (< 768px)


