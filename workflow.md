# workflow.md — Git Workflow & Development Process

## Branching

```
main            <- production, selalu deployable
staging         <- pre-production, tempat QA sebelum ke main
feature/*        <- kerja fitur baru, dari staging
fix/*             <- bugfix
```

Contoh: `feature/token-wallet-ledger`, `fix/withdrawal-double-deduct`.

## Commit Convention

Pakai [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: tambah endpoint withdrawal request
fix: cegah reward double-payout saat admin approve
docs: update skill.md dengan aturan expiry token
test: tambah unit test untuk split reward 80:20
chore: update dependency NestJS
```

## Pull Request

1. Branch dari `staging`, bukan `main`.
2. PR wajib deskripsi singkat: apa yang berubah + kenapa (link ke `todo.md` item kalau ada).
3. Kalau mengubah logika bisnis (angka/formula dari `skill.md`) — tandai jelas di deskripsi PR, minta review manusia, jangan auto-merge.
4. Checklist `review_QA.md` bagian "QA per Pull Request" wajib dicentang sebelum merge.
5. Minimal 1 approval sebelum merge ke `staging`. Merge `staging` → `main` hanya lewat rilis terjadwal, bukan per-PR.

## Environment

| Environment | Branch | Tujuan |
|---|---|---|
| Development | lokal / `feature/*` | Kerja harian |
| Staging | `staging` | QA, uji integrasi payment gateway (sandbox) |
| Production | `main` | Live, payment gateway mode production |

## Rilis

1. Merge `staging` → `main` setelah checklist `review_QA.md` bagian "Sebelum Rilis ke Production" lengkap.
2. Tag versi mengikuti [Semantic Versioning](https://semver.org/): `v0.1.0` untuk MVP awal.
3. Update `CHANGELOG.md` di setiap rilis.

## Kapan Harus Tanya User Dulu (Jangan Auto-Proceed)

- Perubahan pada angka bisnis kritis (harga token, split reward, fee, minimum responden) — ini keputusan bisnis, bukan teknis.
- Migration yang mengubah struktur `token_transactions` atau `rewards`.
- Mengubah kredensial/koneksi payment gateway production.
- Deploy ke production di luar jadwal rilis terjadwal.

## Task Tracking

Gunakan `todo.md` sebagai source of truth task aktif. Update status task di sana setiap task selesai/berubah — jangan biarkan `todo.md` basi sementara kerja jalan terus di tempat lain.
