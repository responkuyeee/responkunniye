# PRD.md — Product Requirements Document

## 1. Ringkasan

Marketplace dua sisi (Researcher ↔ Respondent) berbasis token untuk jasa pengisian kuesioner. Satu akun, dua peran, satu dashboard toggle. Detail bisnis lengkap ada di dokumen blueprint (referensi eksternal); dokumen ini fokus pada requirement yang perlu diimplementasi.

## 2. Target User

- **Researcher:** mahasiswa, peneliti, dosen, UMKM, perusahaan. Minimum umur 18 tahun.
- **Respondent:** masyarakat umum pencari micro-income. Minimum umur 18 tahun.

## 3. Functional Requirements (MVP)

### 3.1 Akun & Autentikasi
- Registrasi dengan email + nomor HP (OTP masing-masing).
- Field wajib: nama, email, HP, jenis kelamin, agama (+ consent checkbox terpisah), umur ≥18 (self-declaration checkbox), domisili (+ GPS tracking).
- Satu akun, dashboard dengan toggle mode Researcher/Respondent.

### 3.2 Research Management (sisi Researcher)
- Form create research: judul, deskripsi, link survey eksternal, jumlah responden (min. 50), kriteria target (umur/gender/domisili/dll), screening questions (skor/threshold), estimasi durasi, deadline.
- Validasi saldo token ≥ jumlah responden sebelum submit.
- **Auto-publish** setelah token ter-reserve — tidak ada review admin manual untuk konten.
- Keyword filter otomatis saat submit untuk deteksi konten terlarang.
- Researcher bisa cancel research; sisa slot ter-refund otomatis (dalam bentuk token).
- Export hasil (CSV) termasuk data respondent (nama, kontak) — lihat SECURITY.md untuk syarat consent terkait.

### 3.3 Halaman Research Tersedia (sisi Respondent)
- Auto-filter research berdasarkan kecocokan profil (umur, gender, domisili) DAN status Quality Score respondent.
- Research yang tidak cocok kriteria tidak ditampilkan sama sekali (bukan disembunyikan via UI saja).

### 3.4 Screening & Survey
- Screening question berbasis skor/threshold — gagal skor = tidak lanjut ke survey utama.
- Survey utama tidak punya jawaban benar/salah (data mengikuti kenyataan/opini responden).
- Submission tracking via link eksternal (redirect + callback status selesai).

### 3.5 Quality Control
- Auto-screening setelah submit: cek waktu pengerjaan vs estimasi, attention check, straight-lining, duplicate response.
- Jalur bersih: hold 24 jam → reward otomatis cair.
- Jalur di-flag: masuk antrian Admin Review, SLA maksimal 48 jam → admin approve (reward cair) atau reject (dibatalkan, token kembali ke pool).

### 3.6 Token & Wallet
- 1 Token = Rp1.000. Top-up via payment gateway (QRIS/e-wallet/VA).
- Reward split otomatis 80:20 saat status participation `Approved`.
- Ledger append-only untuk semua transaksi token.

### 3.7 Withdrawal
- Request withdrawal dari saldo token → dikonversi ke Rupiah dikurangi fee 3%.
- Admin Finance approve sebelum dana diproses via payment gateway.

### 3.8 Reputasi / Quality Score
- Dinilai oleh System + Admin (bukan peer-to-peer).
- Skor turun jika jawaban ditolak; naik jika disetujui.
- Skor rendah → akses research baru dibatasi.
- Pemulihan otomatis setelah beberapa jawaban bagus berturut-turut (jumlah pastinya: config, lihat `skill.md`).

### 3.9 Notifikasi
Lihat tabel trigger lengkap di `skill.md`/blueprint. Channel MVP: email + in-app.

### 3.10 Admin Panel
- Role terpisah: **Admin Quality** (review jawaban/konten/dispute) dan **Admin Finance** (withdrawal/refund/rekonsiliasi).

### 3.11 Customer Support
- Channel tiket in-app/email. Jalur banding untuk Respondent (jawaban ditolak) dan Researcher (research di-takedown).

### 3.12 Penghapusan Akun & Data
- Akun bisa dihapus/dinonaktifkan.
- Data jawaban survei yang sudah tersalur ke Researcher **tidak bisa dihapus** (sudah bagian dari transaksi selesai).

## 4. Non-Goals (Eksplisit di Luar Scope MVP)

- Survey builder internal (pakai link eksternal dulu).
- Matching dengan weighted scoring/AI (rule-based filter saja).
- Push notification native app.
- Quality score untuk sisi Researcher (anti-spam) — Post-MVP.
- Reputasi peer-to-peer.

## 5. Success Metrics

- **Repeat researcher rate** (KPI validasi bisnis utama).
- Response completion rate, rejection rate, fraud rate lolos deteksi.
- GMV, platform revenue (20% split + 3% withdrawal fee).

## 6. Open Items / ASSUMPTION (perlu dikonfirmasi sebelum hardcode)

- Jumlah "jawaban bagus berturut-turut" untuk pemulihan Quality Score.
- Lama suspend sementara pelanggaran ke-2 (kebijakan konten).
- Apakah Researcher boleh withdrawal token ke cash, atau hanya bisa dipakai ulang.

Semua item di atas **wajib** diimplementasikan sebagai config yang mudah diubah, bukan hardcoded value.
