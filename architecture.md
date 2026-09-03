# architecture.md — Desain Teknis

## 1. Prinsip Desain

**Modular monolith** untuk MVP — bukan microservices. Alasan: tim kecil, kecepatan development lebih penting daripada scalability ekstrem di tahap validasi bisnis. Modul dipisah jelas secara kode (folder per domain) supaya mudah dipecah jadi microservices nanti kalau memang perlu.

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | Next.js (React) | Ekosistem besar, banyak developer tersedia |
| Backend | Node.js (NestJS) | Modular by design, cocok untuk domain-driven folder structure |
| Database | PostgreSQL | Constraint ketat untuk ledger token, transaksi ACID |
| ORM & Migration | Prisma ORM | Type-safe schema generator, migration engine, mendukung DDL custom PostgreSQL |
| Auth | JWT + OTP provider (email/SMS) | Standar, murah untuk MVP |
| Payment | Midtrans / Xendit | Satu integrasi cover QRIS + e-wallet + VA |
| File/GPS storage | S3-compatible (mis. Cloudflare R2) | Murah |
| Notification | SMTP + in-app | Push native menyusul Post-MVP |
| Hosting | VPS/managed cloud (DigitalOcean/AWS Lightsail) | Cukup untuk tahap validasi |

### Struktur Repository: Monorepo (npm workspaces)
Repository menggunakan pendekatan **monorepo** berbasis npm workspaces:
- `/backend`: Aplikasi NestJS (API, modul domain, Prisma ORM, migrations).
- `/frontend`: Aplikasi Next.js (App Router, UI dual-role Researcher ↔ Respondent).
- Root `package.json` menyediakan script terpadu: `npm run dev`, `npm run build`, `npm run lint`, `npm run test`, `npm run db:migrate`.

## 3. Modul Backend (domain boundary)

```
/modules
  /auth              - registrasi, login, OTP, KYC checkbox
  /profile           - data profil, consent agama, GPS domisili
  /research          - CRUD research, form, auto-publish
  /token-wallet      - ledger, reserve, consume, refund (INTI SISTEM — paling sensitif)
  /matching          - auto-filter research berdasar profil + quality score
  /screening         - screening question + scoring
  /participation     - state machine partisipasi respondent
  /quality-control   - auto-screening signal, admin review queue
  /reputation        - quality score, recovery logic
  /withdrawal        - request, approval, payment disbursement
  /payment           - integrasi gateway, webhook handler, idempotency
  /notification      - trigger & kirim notifikasi
  /admin             - panel admin (quality & finance terpisah)
  /content-moderation - keyword filter, report, eskalasi penalti
  /support           - tiket customer support & banding
```

## 4. Alur Data Kritis (ringkas — detail di PRD.md & skill.md)

### Token Lifecycle
```
TOPUP (payment gateway) → wallet balance +
RESERVE (saat publish research) → wallet balance -, research.reserved +
CONSUME (saat participation Approved) → split 80/20, reward.status = paid
REFUND (cancel/expired/takedown) → wallet balance +, research.reserved -
```
Semua langkah di atas **satu baris baru** di tabel `token_transactions` (append-only). Saldo wallet = SUM semua transaksi terkait, bukan kolom yang di-update langsung (atau kolom cache yang selalu direkonsiliasi terhadap ledger).

### Participation Lifecycle
Lihat diagram state machine lengkap di `PRD.md` §3.5 dan `skill.md`.

## 5. Keamanan Data Sensitif

- Data agama, lokasi GPS, kontak yang dibagikan ke Researcher → enkripsi at-rest, akses dibatasi role-based.
- Lihat `SECURITY.md` untuk detail lengkap.

## 6. Deployment Topology (MVP)

```
[Next.js Frontend] --> [NestJS API] --> [PostgreSQL]
                              |
                              +--> [Payment Gateway Webhook]
                              +--> [S3-compatible Storage]
                              +--> [SMTP/OTP Provider]
```

Single-region deployment cukup untuk MVP. Tidak perlu read-replica atau sharding di tahap ini — lihat `PLAN.md` untuk kapan ini relevan (Post-MVP, setelah traksi terbukti).

## 7. Yang Sengaja TIDAK Dibangun di MVP (dan kenapa)

| Item | Alasan ditunda |
|---|---|
| Survey builder internal | Scope besar, link eksternal (Google Form) cukup untuk validasi |
| Matching berbasis AI/scoring | Overengineering sebelum data cukup untuk melatih model apa pun |
| Microservices | Tim kecil, modular monolith lebih cepat dibangun & di-maintain |
| Push notification native | Email+in-app cukup untuk MVP, butuh app store submission yang menambah waktu |
