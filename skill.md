# skill.md — Aturan Bisnis Kritis (Cheat Sheet untuk AI)

File ini adalah rujukan cepat angka dan formula bisnis yang sering dipakai di banyak modul kode. Kalau ragu soal angka, cek di sini dulu sebelum menebak. Sumber lengkap: `PRD.md` bagian terkait.

## Token & Reward

| Item | Nilai | Catatan |
|---|---|---|
| Harga token | Rp1.000 / token | Fixed, tidak berubah per research |
| Nilai 1 token | 1 jawaban valid | — |
| Split reward | 80% Respondent : 20% Platform | Otomatis, tidak ada input manual dari Researcher |
| Reward per jawaban (default) | 0.8 token = Rp800 ke Respondent | Dihitung dari 1 token yang di-consume |
| Fee platform per jawaban | 0.2 token = Rp200 | Masuk sebagai platform revenue |
| Minimum jumlah responden/research | 50 | = minimum 50 token harus ter-reserve sebelum publish |

## Withdrawal & Expiry

| Item | Nilai |
|---|---|
| Withdrawal fee | 3% dari nilai pencairan |
| Expiry saldo token | Hangus jika akun idle 3 bulan berturut-turut |
| Expiry data lokasi (GPS) | Terhapus otomatis bersamaan dengan expiry token (idle 3 bulan) |
| Notifikasi sebelum hangus | H-15, H-5, H-1 |
| Refund | Selalu dalam bentuk **token** (masuk wallet), tidak pernah cash langsung |

## Quality Control & Timing

| Item | Nilai |
|---|---|
| Hold period jawaban bersih (tidak di-flag) | Minimal 24 jam sebelum token cair |
| SLA maksimal admin review (jawaban di-flag) | 48 jam |
| SLA maksimal admin review (report konten) | 48 jam |
| SLA Customer Support (asumsi, disamakan) | 48 jam |

## Status yang Menentukan Reward

**Reward HANYA boleh dibuat ketika** `RespondentParticipation.status = Approved`. Alur status:
```
Submitted → AutoScreening → [Clean → HoldRelease → Rewarded]
                           → [Flagged → PendingAdminReview → Approved → HoldRelease → Rewarded]
                                                            → Rejected (tidak ada reward)
```

## Eskalasi Penalti Konten (Researcher)

| Pelanggaran ke- | Tindakan |
|---|---|
| 1 | Warning + takedown research |
| 2 | Suspend sementara (7-30 hari — ASSUMPTION, konfirmasi ke stakeholder sebelum hardcode) |
| 3 | Ban permanen |

## Anti-Fraud

Deteksi duplikat/multi-akun: kombinasi **nomor HP unik + device fingerprint + IP address**. Satu nomor HP = satu akun (hard constraint di level database).

## Aturan yang Tidak Boleh Dilanggar di Level Kode

1. `TokenTransaction` append-only — tidak pernah UPDATE/DELETE record lama.
2. Semua operasi reserve/consume token pakai row-level lock (`SELECT ... FOR UPDATE`) untuk cegah race condition.
3. Idempotency key wajib untuk semua callback payment gateway (topup & withdrawal).
4. Umur minimum registrasi: 18 tahun (self-declaration checkbox, bukan validasi dokumen di MVP).
5. Data agama & data lokasi/kontak yang dibagikan ke Researcher via export CSV — wajib ada consent checkbox terpisah saat registrasi, dicatat timestamp persetujuannya.
6. Data jawaban survei yang sudah tersalur ke Researcher **tidak boleh dihapus** meski akun Respondent dihapus/dinonaktifkan.

## Kalau Menemukan Angka yang Bertentangan

Kalau ada dokumen lain (draft lama, komentar kode, dsb) yang menyebut angka berbeda dari tabel di atas (misal masih nyebut "Rp2.000/token" atau "reward manual dari researcher") — **file ini yang benar**, dokumen lain itu kadaluarsa. Tanyakan ke user kalau ragu, jangan menebak.
