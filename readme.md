# Platform Marketplace Responden

Marketplace dua sisi yang mempertemukan pembuat kuesioner (Researcher) dengan pengisi kuesioner berbayar (Respondent) — satu akun bisa berperan sebagai keduanya lewat satu dashboard.

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [PRD.md](./PRD.md) | Requirement produk lengkap |
| [architecture.md](./architecture.md) | Desain teknis, tech stack, diagram sistem |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Skema database (DDL) |
| [openapi.yaml](./openapi.yaml) | Kontrak API |
| [skill.md](./skill.md) | Aturan bisnis kritis (angka & formula) — rujukan cepat |
| [design.md](./design.md) | Information architecture & prinsip desain |
| [workflow.md](./workflow.md) | Git workflow, branching, PR process |
| [TESTING.md](./TESTING.md) | Strategi & standar testing |
| [SECURITY.md](./SECURITY.md) | Kebijakan keamanan & privasi data |
| [review_QA.md](./review_QA.md) | Checklist QA sebelum rilis |
| [PLAN.md](./PLAN.md) | Roadmap & fase development |
| [todo.md](./todo.md) | Task breakdown aktif |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat perubahan versi |
| [CLAUDE.md](./CLAUDE.md) | Instruksi khusus untuk Claude Code |

## Tech Stack Singkat

- **Backend:** Node.js (NestJS)
- **Frontend:** Next.js (React)
- **Database:** PostgreSQL
- **Payment Gateway:** Midtrans / Xendit (QRIS, e-wallet, Virtual Account)
- **Auth:** JWT + OTP (email & SMS)

Detail lengkap & alasan pemilihan ada di `architecture.md`.

## Model Bisnis Singkat

- Researcher membeli token (1 Token = Rp1.000), minimum 50 token per research.
- Respondent menjawab kuesioner, reward otomatis terpotong dari token dengan split **80% Respondent : 20% Platform**.
- Reward baru cair setelah lolos quality control (hold 24 jam / admin review maks 48 jam).
- Withdrawal ke uang cash kena potongan 3%.

Detail lengkap ada di `PRD.md` dan `skill.md`.

## Quick Start

```bash
git clone <repo-url>
cd <project-folder>
cp .env.example .env   # isi kredensial sesuai lingkungan Anda
npm install
npm run db:migrate
npm run dev
```

## Status Proyek

Tahap: **Pre-development** — dokumentasi selesai, development belum dimulai. Lihat `PLAN.md` untuk fase berikutnya.

## Catatan Legal (Non-Teknis, Paralel)

Badan usaha (PT/CV), pendaftaran PSE ke Kominfo, draft Terms of Service/Privacy Policy resmi, dan kewajiban pajak masih dalam proses di luar scope teknis repo ini — lihat blueprint bisnis lengkap untuk detail.