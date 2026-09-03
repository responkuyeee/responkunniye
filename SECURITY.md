# SECURITY.md

## Data Sensitif yang Dikelola Platform

| Data | Sensitivitas | Perlakuan Khusus |
|---|---|---|
| Agama | Data pribadi spesifik (UU PDP) | Wajib consent checkbox terpisah, timestamp tersimpan, tidak boleh jadi kriteria matching default tanpa alasan jelas |
| Lokasi GPS | Sensitif | Terhapus otomatis jika akun idle 3 bulan; hanya dipakai untuk matching & anti-fraud |
| Nama & kontak (dibagikan ke Researcher via export) | Sensitif | Wajib consent eksplisit saat registrasi; Respondent harus tahu datanya bisa dilihat Researcher |
| Password | Kredensial | Hash dengan bcrypt/argon2, tidak pernah disimpan plaintext atau di-log |
| Token payment gateway (server key, dll) | Kredensial | Hanya di `.env`, tidak pernah commit ke repo, akses dibatasi |

## Autentikasi & Otorisasi

- JWT dengan expiry wajar (rekomendasi 7 hari, refresh token untuk Post-MVP).
- Role-based access: `user`, `admin_quality`, `admin_finance`. Endpoint admin **wajib** cek role, bukan cuma cek "is authenticated".
- OTP wajib untuk email dan nomor HP saat registrasi.

## Rate Limiting (MVP minimum)

- Login: maks 5 percobaan/15 menit per IP+email.
- OTP request: maks 3 kali/10 menit per nomor.
- Endpoint submit survey: rate limit per user untuk cegah spam submission.

## Anti-Fraud

Lihat `skill.md` §Anti-Fraud. Kombinasi nomor HP unik (hard constraint DB) + device fingerprint + IP address.

## Secrets Management

- Semua secrets di `.env`, **tidak pernah** di-commit. Pastikan `.env` ada di `.gitignore`.
- Gunakan secrets manager (mis. AWS Secrets Manager / Doppler) begitu tim/infra membesar — Post-MVP, `.env` file cukup untuk MVP dengan akses server terbatas.
- Rotasi `JWT_SECRET` dan API key payment gateway kalau ada indikasi bocor.

## Payment & Transaksi

- Semua callback/webhook payment gateway **wajib** verifikasi signature dari provider (jangan percaya payload begitu saja).
- Idempotency key wajib untuk topup & withdrawal — cegah proses ganda kalau webhook retry.

## Kebijakan Penghapusan Data

- Akun bisa dihapus/dinonaktifkan atas permintaan user.
- Data jawaban survei yang **sudah tersalur ke Researcher** tidak dihapus (bagian dari transaksi selesai) — kebijakan ini harus tertulis eksplisit di Privacy Policy user-facing (dokumen legal terpisah, bukan bagian dari repo ini).
- Data yang *belum* terpakai transaksi apa pun (profil dasar, saldo yang sudah nol) boleh dihapus/dianonimkan penuh.

## Audit Trail

- Semua tindakan Admin (approve/reject withdrawal, quality review decision, content moderation) dicatat di tabel `admin_reviews` — tidak boleh ada aksi admin tanpa jejak.

## Pelaporan Kerentanan (Responsible Disclosure)

*(Isi kontak/proses resmi begitu tersedia — placeholder untuk sekarang.)*
Kalau menemukan celah keamanan, laporkan ke: `security@[domain-perusahaan].com` (ganti sesuai domain resmi setelah tersedia).

## Catatan Status Legal (Terkait Keamanan Data)

Pendaftaran PSE ke Kominfo dan draft Privacy Policy resmi masih dalam proses (lihat README.md). Sampai keduanya selesai, hindari mengklaim kepatuhan penuh terhadap regulasi di komunikasi publik/marketing.
