# TESTING.md

## Prioritas Testing

Modul yang menyentuh **uang/token wajib punya test coverage tertinggi**. Urutan prioritas:

1. `token-wallet` module (ledger, reserve, consume, refund) — **kritis, tidak boleh ada bug**
2. `quality-control` & `participation` state machine — kritis untuk mencegah double reward
3. `withdrawal` — kritis, menyangkut uang keluar
4. Modul lain — standar

## Unit Test Wajib (minimum)

### Token Wallet
- [ ] Reserve token gagal kalau saldo tidak cukup.
- [ ] Reserve token minimum 50 (tidak bisa publish research dengan target < 50 responden).
- [ ] Consume token split tepat 80:20 (0.8 dan 0.2 token, bukan pembulatan yang salah).
- [ ] Refund mengembalikan **hanya** sisa yang belum ter-consume, bukan seluruh reserved.
- [ ] Dua request reserve simultan pada saldo pas-pasan tidak boleh membuat saldo negatif (race condition test).
- [ ] Topup dengan idempotency key yang sama dipanggil 2x → hanya 1 transaksi tercatat.

### Participation & Quality Control
- [ ] Reward tidak pernah dibuat sebelum status `Approved`.
- [ ] Reward tidak bisa dibuat dua kali untuk participation yang sama (constraint UNIQUE ter-trigger).
- [ ] Submit dua kali oleh respondent yang sama untuk research yang sama → ditolak (constraint UNIQUE research+respondent).
- [ ] Jawaban bersih (tidak flagged) → hold 24 jam sebelum reward cair, tidak bisa cair lebih cepat.
- [ ] Jawaban flagged → tidak cair otomatis, wajib menunggu keputusan admin.
- [ ] Admin reject → token kembali ke pool research (reserved bertambah balik), bukan hilang.

### Withdrawal
- [ ] Withdrawal fee tepat 3%, dihitung dari nilai token yang ditarik.
- [ ] Withdrawal request kedua dengan saldo yang sama (setelah request pertama) harus gagal karena saldo sudah ter-deduct saat request dibuat, bukan saat selesai.
- [ ] Withdrawal gagal di payment gateway → status `failed`, saldo dikembalikan.

### Quality Score
- [ ] Skor turun saat participation `Rejected`.
- [ ] Skor naik & `consecutive_good_answers` bertambah saat `Approved`.
- [ ] Skor di bawah threshold → `throttled = true`, memengaruhi hasil query matching.
- [ ] Setelah N jawaban bagus berturut-turut (config `CONSECUTIVE_GOOD_ANSWERS_FOR_RECOVERY`) → `throttled = false` otomatis.

## Integration Test

- Full flow: create research → topup → publish → respondent screening → submit → auto-screening bersih → hold 24 jam (mock waktu) → reward cair → withdrawal.
- Full flow jalur admin: submit → flagged → masuk antrian admin → admin approve/reject → efek ke saldo & research pool sesuai.

## E2E Test (Playwright/Cypress — pilih salah satu, konsisten di seluruh repo)

- Registrasi lengkap (termasuk consent checkbox agama & data-share).
- Toggle dashboard Researcher ↔ Respondent tanpa logout.
- Create research dengan target < 50 → error ditampilkan di UI sebelum submit ke API.

## Sebelum Merge ke `main`

Checklist singkat — detail lengkap ada di `review_QA.md`:
- [ ] Semua unit test di atas hijau.
- [ ] Tidak ada perubahan pada logika split 80:20 / fee 3% tanpa persetujuan eksplisit (ini keputusan bisnis).
- [ ] Migration database sudah di-test di environment staging, bukan langsung production.

## Test Data / Seed

Buat seed data yang mencakup: 1 researcher dengan saldo cukup, 1 research published dengan kriteria spesifik, beberapa respondent dengan profil berbeda-beda (untuk test auto-filter matching), 1 respondent dengan quality score rendah (untuk test throttle).
