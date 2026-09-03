# Backend Context & Guidelines

Konteks khusus untuk modul backend NestJS di platform Marketplace Responden.

## Tech Stack
- **Framework:** NestJS 10.x
- **ORM & Migrations:** Prisma ORM
- **Database:** PostgreSQL
- **Validation:** class-validator, class-transformer
- **Testing:** Jest

## Aturan Arsitektur & Koding Backend
1. **Modular Monolith:** Setiap domain berada di bawah `src/modules/<nama-domain>`.
2. **Ledger Append-Only:** Tabel `token_transactions` TIDAK PERNAH di-UPDATE atau di-DELETE. Hanya INSERT baru. Saldo dihitung dari SUM(amount).
3. **Idempotency:** Operasi topup, consume, reserve, withdrawal wajib menggunakan idempotency key.
4. **Validasi:** Selalu gunakan DTO dengan `class-validator` untuk input validation.
5. **Konvensi Bahasa:** Penjelasan bisnis dan komentar dalam Bahasa Indonesia, nama fungsi, variabel, class dalam Bahasa Inggris.
