# CLAUDE.md

Instruksi operasional untuk Claude Code saat bekerja di repo ini. File ini dibaca otomatis di setiap sesi — **jaga tetap ringkas**. Detail panjang ada di file lain, rujuk saja, jangan salin ulang di sini.

## Ringkasan Proyek

Marketplace dua sisi (Researcher ↔ Respondent) untuk jual-beli jasa isi survei, berbasis token. Satu akun bisa jadi kedua peran lewat satu dashboard toggle. Lihat `PRD.md` untuk requirement lengkap, `architecture.md` untuk desain teknis.

## Aturan Bisnis Kritis (jangan pernah dilanggar saat coding)

Rujuk `skill.md` untuk daftar lengkap. Yang paling sering relevan:
- 1 Token = Rp1.000, split reward **80% Respondent : 20% Platform**, otomatis — jangan pernah hardcode reward manual dari input researcher.
- Minimum 50 token per research (validasi di level create, bukan cuma di UI).
- Reward **hanya** boleh dibuat setelah `RespondentParticipation.status = Approved`. Tidak ada pengecualian.
- `TokenTransaction` bersifat **append-only** — tidak pernah di-UPDATE atau DELETE, hanya INSERT baru.
- Semua operasi yang menyentuh saldo token wajib idempotent (pakai idempotency key) dan pakai row-level lock saat reserve/consume.

## Tech Stack

Backend: Node.js (NestJS). Frontend: Next.js (React). DB: PostgreSQL. Payment: Midtrans/Xendit. Auth: JWT + OTP. Lihat `architecture.md` untuk detail lengkap dan alasan pemilihan.

## Command Penting

```bash
# Setup awal
cp .env.example .env
npm install

# Development
npm run dev              # jalankan backend + frontend (jika monorepo)
npm run db:migrate       # jalankan migrasi database
npm run db:seed          # isi data dummy untuk testing

# Testing
npm run test             # unit test
npm run test:e2e         # end-to-end test
npm run lint             # cek code style

# Build & Deploy
npm run build
npm run deploy:staging
```
*(Sesuaikan command di atas begitu struktur proyek nyata dibuat — ini placeholder awal.)*

## Struktur Folder (target)

```
/backend
  /src
    /modules
      /auth
      /research
      /wallet
      /matching
      /quality-control
      /withdrawal
      /admin
    CLAUDE.md         <- konteks khusus backend
/frontend
  /src
    /app              (Next.js app router)
    /components
    CLAUDE.md         <- konteks khusus frontend
/docs                 <- semua .md yang sudah dibuat (PRD, architecture, dst)
```

## Dokumen Rujukan (baca sesuai kebutuhan, jangan dimuat semua sekaligus)

| Butuh tahu... | Baca |
|---|---|
| Requirement fitur lengkap | `PRD.md` |
| Desain teknis & tech stack | `architecture.md` |
| Skema database | `DATABASE_SCHEMA.md` |
| Kontrak API | `openapi.yaml` |
| Aturan bisnis kritis (angka, formula) | `skill.md` |
| Task yang sedang dikerjakan | `todo.md` |
| Cara commit/branch/PR | `workflow.md` |
| Standar testing sebelum merge | `TESTING.md` |
| Kebijakan keamanan & secrets | `SECURITY.md` |
| Halaman & IA produk | `design.md` |
| Checklist QA sebelum rilis | `review_QA.md` |
| Roadmap/fase development | `PLAN.md` |

## Konvensi Kode
- Bahasa komentar/dokumentasi kode: Bahasa Indonesia untuk penjelasan bisnis, Bahasa Inggris untuk nama variabel/fungsi (standar industri).
- Setiap fitur yang menyentuh token/reward **wajib** ada unit test (lihat `TESTING.md`).
- Jangan generate migration yang mengubah tipe kolom `TokenTransaction` — tabel ini append-only by design.

## Yang TIDAK boleh dilakukan AI tanpa konfirmasi eksplisit dari user
- Push langsung ke branch `main`/`production`.
- Mengubah `.env` produksi atau kredensial payment gateway.
- Menjalankan migrasi database di lingkungan produksi.
- Mengubah logika perhitungan token/split reward tanpa konfirmasi (ini keputusan bisnis, bukan teknis).
