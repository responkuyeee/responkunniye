# PLAN.md — Roadmap & Fase Development

## Fase 0 — Setup (Minggu 1)
- Setup repo, struktur folder, CI dasar (lint + test on PR).
- Setup database + migration tool.
- Setup `.env` untuk dev/staging.
- Deploy skeleton kosong ke staging (validasi pipeline deploy jalan sebelum fitur ditambah).

## Fase 1 — Akun & Profil (Minggu 2-3)
- Registrasi, OTP email/HP, login, JWT.
- Profil lengkap (termasuk consent agama & data-share, GPS domisili).
- Dashboard toggle mode (boleh masih UI kosong, yang penting mekanisme toggle jalan).

## Fase 2 — Token & Wallet (Minggu 3-4)
- Ledger `token_transactions`, wallet balance calculation.
- Integrasi payment gateway topup (sandbox dulu).
- **Prioritas tinggi:** modul ini paling sensitif, alokasikan waktu testing ekstra (lihat `TESTING.md`).

## Fase 3 — Research & Matching (Minggu 4-6)
- CRUD research, form create dengan validasi minimum 50 responden.
- Auto-publish flow.
- Halaman Research Tersedia dengan auto-filter (rule-based).
- Keyword filter konten otomatis.

## Fase 4 — Screening & Quality Control (Minggu 6-8)
- Screening question + scoring.
- Submission tracking (link eksternal).
- Auto-screening signal (waktu pengerjaan, attention check, dll).
- Admin Review queue + SLA 48 jam.
- Quality Score + auto-recovery.

## Fase 5 — Reward & Withdrawal (Minggu 8-9)
- Reward split 80:20 otomatis.
- Hold 24 jam release logic.
- Withdrawal flow + fee 3% + integrasi disbursement payment gateway.

## Fase 6 — Admin, Notifikasi, Support (Minggu 9-10)
- Admin Panel (Quality & Finance terpisah).
- Notifikasi (email + in-app) sesuai trigger di `skill.md`.
- Customer Support ticketing + jalur banding.

## Fase 7 — QA & Hardening (Minggu 10-11)
- Jalankan seluruh checklist `review_QA.md`.
- Security review (`SECURITY.md`).
- Load testing dasar (cukup untuk skala awal, bukan stress test ekstrem).

## Fase 8 — Soft Launch (Minggu 12)
- Deploy production dengan payment gateway akun pribadi (sementara — lihat catatan legal di `README.md`).
- Onboarding 20-50 researcher pertama secara terbatas (lihat business validation di blueprint).
- Monitor repeat researcher rate sebagai KPI utama.

## Post-MVP (Setelah Validasi Bisnis)
- Survey builder internal.
- Matching berbasis weighted scoring.
- Push notification native.
- Quality score untuk sisi Researcher.
- Migrasi payment gateway ke akun bisnis (PT/CV) setelah selesai.

## Dependency Kritis Antar Fase

Fase 2 (Token & Wallet) **harus selesai dan teruji solid** sebelum Fase 3-5 dimulai secara paralel penuh — semua fase berikutnya bergantung pada ledger yang benar. Jangan terburu-buru lompat ke fitur lain kalau modul token masih rapuh.
