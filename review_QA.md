# review_QA.md — Checklist QA Sebelum Rilis

## QA per Pull Request

- [ ] Unit test relevan ditambahkan/diupdate (lihat `TESTING.md` untuk modul wajib-test).
- [ ] Tidak ada `console.log`/debug code tertinggal.
- [ ] Tidak ada secrets/kredensial hardcoded di kode.
- [ ] Kalau menyentuh `token_transactions` — pastikan tidak ada UPDATE/DELETE, hanya INSERT.
- [ ] Kalau menyentuh perhitungan reward/fee — angka dicek ulang terhadap `skill.md`.
- [ ] Lint & type-check lolos (`npm run lint`).

## QA Sebelum Rilis ke Staging

- [ ] Semua acceptance criteria user story terkait terpenuhi (lihat `PRD.md`).
- [ ] Test flow end-to-end kritis dijalankan manual sekali (create research → submit → reward → withdrawal).
- [ ] Cek notifikasi terkirim sesuai trigger di `skill.md` (reward cair, deadline mendekat, dll).
- [ ] Cek halaman Research Tersedia benar-benar hanya menampilkan research yang cocok kriteria (test dengan minimal 2 profil respondent berbeda).

## QA Sebelum Rilis ke Production

- [ ] Migration database sudah dijalankan & diverifikasi di staging tanpa error.
- [ ] `.env` production sudah diisi lengkap (bukan copy dari staging/dev) — cek `.env.example` sebagai referensi.
- [ ] Payment gateway di mode production (bukan sandbox), webhook URL sudah diarahkan ke domain production.
- [ ] Rate limiting & security header aktif (lihat `SECURITY.md`).
- [ ] Backup database berjalan otomatis dan sudah dites restore minimal sekali.
- [ ] Monitoring/error tracking aktif (Sentry atau setara).

## Skenario Uji Kritis (Manual, Sebelum Setiap Rilis Besar)

| Skenario | Expected Result |
|---|---|
| Researcher buat research dengan 49 responden | Ditolak, error jelas "minimum 50" |
| Saldo token pas-pasan, dua research dipublish bersamaan | Salah satu gagal karena saldo tidak cukup, tidak ada saldo negatif |
| Respondent submit jawaban sangat cepat (di bawah estimasi durasi) | Auto-flagged, masuk antrian admin, tidak langsung cair |
| Admin approve jawaban yang di-flag | Token cair ke respondent, quality score naik |
| Admin reject jawaban yang di-flag | Token kembali ke pool research, quality score turun |
| Respondent request withdrawal dua kali cepat berturut-turut dengan saldo sama | Request kedua gagal (saldo sudah ter-deduct di request pertama) |
| Akun idle > 3 bulan | Token hangus, notifikasi sudah terkirim H-15/H-5/H-1 sebelumnya |
| Research di-report karena melanggar kebijakan konten | Masuk antrian Admin Quality, SLA 48 jam terhitung sejak report masuk |

## Definition of Done (Fitur)

Sebuah fitur dianggap selesai kalau: kode di-review, unit test lolos, QA manual di atas (yang relevan) sudah dicek, dan dokumentasi terkait (`PRD.md`/`skill.md`) diupdate kalau ada perubahan aturan bisnis.
