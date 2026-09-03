# design.md — Design System & Information Architecture (ResponKu)

> ⚠️ **DOKUMEN INI ADALAH SUMBER KEBENARAN TUNGGAL (SINGLE SOURCE OF TRUTH) UNTUK DESAIN.**
> Jika kamu adalah AI coding agent yang membaca file ini: implementasikan **persis** seperti yang tertulis di sini. Lihat §0 sebelum menulis satu baris kode pun.

---

## 0. Guardrail Wajib untuk AI / Coding Agent

Riwayat proyek ini: brief awal minta gaya **LinkedIn (feed 3 kolom, card-based, profesional, biru-hijau sesuai logo)**. Versi revisi terakhir malah berubah total jadi tema *glassmorphism* indigo/violet/amber/rose yang tidak diminta. Ini **tidak boleh terulang**. Aturan berikut sifatnya keras, bukan saran:

1. **Jangan pernah menambah palet warna baru** di luar tabel §1 (dilarang: indigo, violet/ungu, amber/gold, rose, cyan terpisah, dsb). Kalau butuh warna tambahan (mis. untuk chart), turunkan dari token yang sudah ada atau tanyakan dulu — jangan putuskan sendiri.
2. **Jangan pakai glassmorphism** (blur/transparansi kaca), **gradient dekoratif di background**, `::before` specular shine, atau efek "premium SaaS landing page" generik. Lihat §5 daftar larangan.
3. **Jangan mengganti information architecture** (urutan kolom, struktur nav, struktur card) di §2 tanpa alasan teknis yang dijelaskan eksplisit ke user — bukan preferensi estetik agent.
4. **Kalau ragu atau ingin improvisasi**, defaultnya adalah: **lebih minim, lebih polos, lebih dekat ke LinkedIn/Stripe/Linear** — bukan lebih ramai/dekoratif.
5. Setiap kali sebuah PR/perubahan menyentuh warna, tipografi, atau layout inti, agent wajib menyebutkan secara eksplisit di walkthrough: *"Tidak ada penyimpangan dari design.md"* atau *"Ada penyimpangan di X, alasannya Y — mohon konfirmasi user"*. **Diam-diam mengganti arah desain tidak diperbolehkan.**

---

## 1. Referensi Gaya — Kenapa LinkedIn, dan Apa Lagi yang Relevan

Brief awal: gaya ala LinkedIn. Ini keputusan yang tepat untuk alasan produk (bukan cuma selera), karena ResponKu itu **feed berbasis card + ada uang/reward** — butuh kesan *trustworthy data platform*, bukan *marketing landing page*.

| Referensi | Apa yang diambil | Apa yang **tidak** diambil |
|---|---|---|
| **LinkedIn** (utama) | IA: top nav + feed 3 kolom, card list vertikal, left-aligned content, border tipis bukan shadow tebal | Warna LinkedIn sendiri (biru LinkedIn diganti biru logo kita) |
| **Stripe Dashboard** (pelengkap) | Karena ada uang/reward: angka besar & presisi, tabel dense di panel admin, whitespace disiplin, tidak ada dekorasi di sekitar angka finansial | Dark mode default, warna ungu Stripe |
| **Linear.app** (pelengkap) | Ketegasan spacing, border-radius kecil konsisten, mikro-interaksi halus (bukan animasi besar), satu warna aksen dominan | Tema gelap default, font monospace-heavy |

**Keputusan final:** IA & feel dari LinkedIn, presisi angka & ketenangan visual dari Stripe/Linear. Ini **lebih modern** daripada LinkedIn asli (yang mulai terasa dated) tanpa jatuh ke tema "AI generic SaaS" (glow, gradient, glassmorphism) yang sudah terlalu umum dan justru terasa kurang tepercaya untuk platform yang mengelola uang.

Jika agent (atau kamu) menemukan referensi lain yang menurutmu lebih pas, itu didiskusikan dulu di sini — bukan langsung dieksekusi ke kode.

---

## 2. Design Token System

### 2.1 Warna (diambil dari logo — lihat file logo asli untuk presisi pixel-perfect)

Estimasi dari file logo yang diberikan. **Sebelum dipakai di kode, ambil hex persis dari file sumber (SVG/AI/Figma) logo**, bukan dari estimasi visual ini.

| Token | Hex (estimasi dari logo) | Peran |
|---|---|---|
| `primary-blue` | `#1B6FE0` | Warna dominan — top nav, tombol utama, link, bagian biru wordmark "K" |
| `primary-blue-dark` | `#0B2E63` | Wordmark "Respon" (navy tua), hover state, teks di atas latar terang |
| `accent-green` | `#1C9A5B` | Aksi positif/uang — reward cair, tombol "Kerjakan Survey", badge saldo, bagian "u" pada logo |
| `accent-green-light` | `#E4F5EC` | Background badge/notifikasi sukses |
| `neutral-white` | `#FFFFFF` | Background utama, card |
| `neutral-bg` | `#F4F5F6` | Background halaman (di belakang card) — sesuai bg logo |
| `neutral-border` | `#E0E4E9` | Border card, divider |
| `neutral-text` | `#12203A` | Teks utama (dekat warna navy wordmark) |
| `neutral-text-muted` | `#6B7785` | Teks sekunder, meta info, tagline ("Temukan Responden yang Tepat") |
| `danger` | `#C23B3B` | Rejected, suspend, error |
| `warning` | `#B8860B` | Pending review, deadline mendekat |

**Prinsip pemakaian (wajib):**
- Biru = navigasi, identitas, trust, aksi netral.
- Hijau = **khusus** uang/reward/aksi positif. Konsisten di seluruh produk — begitu user lihat hijau, otomatis asosiasi "uang masuk". Jangan pakai hijau untuk dekorasi acak.
- Navy tua (`primary-blue-dark`) dipakai untuk teks/wordmark berat, bukan sebagai warna aksen tombol.
- **Tidak ada warna kelima.** Kalau butuh varian, turunkan tint/shade dari 2 warna brand ini, bukan warna baru.

### 2.2 Tipografi

Satu keluarga font sans-serif (Inter atau Söhne) untuk semua elemen — pendekatan LinkedIn, terasa profesional tanpa font kedua.

| Peran | Ukuran | Weight |
|---|---|---|
| Judul halaman | 24px | Semi-bold |
| Judul card (mis. judul research) | 16px | Semi-bold |
| Body text | 14px | Regular |
| Meta text (tanggal, lokasi, reward) | 13px | Regular, `neutral-text-muted` |
| Label tombol | 14px | Medium |

Line length body: di bawah 80 karakter — card sempit ala feed sudah otomatis memenuhi ini.

### 2.3 Layout Concept

Top nav fixed + 3 kolom di halaman feed utama (Research Tersedia), 2 kolom di halaman lain.

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]   Cari research...      [Toggle Mode] [Notif] [Foto] │  <- Top Nav, bg primary-blue
├───────────┬──────────────────────────────┬────────────────┤
│  Kartu    │   FEED: Research Tersedia    │  Panel Kanan   │
│  Profil   │   ┌──────────────────────┐   │  - Ringkasan   │
│  Ringkas  │   │ Card Research 1      │   │    saldo token │
│  (kiri)   │   │ Judul, reward Rp800  │   │  - Tips/CTA    │
│           │   │ tombol Kerjakan      │   │  - Deadline    │
│  Quality  │   └──────────────────────┘   │    mendekat    │
│  Score    │   ┌──────────────────────┐   │                │
│  badge    │   │ Card Research 2      │   │                │
│           │   └──────────────────────┘   │                │
└───────────┴──────────────────────────────┴────────────────┘
```

Alignment: konten **left-aligned** di dalam card — pola feed/list, bukan pola landing page marketing (center-aligned, hero besar, dsb).

### 2.4 Prinsip Structural Card

Setiap **Research Card** di feed berisi (urutan tetap, konsisten di semua card):
1. Judul research
2. Reward per jawaban (angka hijau, paling menonjol setelah judul — elemen yang bikin user klik)
3. Meta: estimasi durasi, sisa kuota (mis. "32/50 terisi"), deadline
4. Tombol aksi: "Kerjakan Survey" (bg `accent-green`)

Border-radius konsisten kecil (4–6px, bukan card sangat membulat) — kesan profesional/data-driven.
Border: garis tipis `neutral-border` 1px. **Bukan shadow tebal, bukan glow.**

---

## 3. Struktur Halaman (Information Architecture)

### Top Navigation (selalu tampil setelah login)
- Logo (kiri)
- Search bar (cari research — opsional MVP)
- **Toggle Mode: Researcher ↔ Respondent** — elemen paling penting, tempatkan menonjol di nav, bukan di dropdown
- Ikon notifikasi
- Avatar/profil (dropdown: pengaturan, logout)

### Mode Respondent — Halaman Utama: "Research Tersedia" (Feed 3 Kolom)
- **Kolom kiri:** kartu profil ringkas (nama, foto, domisili) + badge Quality Score kualitatif (Baik/Cukup/Perlu Diperbaiki) + ringkasan saldo token
- **Kolom tengah (feed utama):** daftar Research Card, auto-filtered sesuai profil — scroll vertikal ala feed
- **Kolom kanan:** widget kecil (deadline research yang sedang dikerjakan, tips meningkatkan Quality Score, shortcut ke Wallet)

### Mode Respondent — Halaman Lain
- Detail Research → Screening → Survey (linear, 2 kolom: konten utama + sidebar info reward/durasi)
- Riwayat pekerjaan (list, format tabel/card ringkas)
- Wallet: saldo besar di atas (hijau, mencolok), riwayat transaksi di bawah (list)

### Mode Researcher — Halaman Utama: Dashboard
- **Kolom kiri:** profil ringkas + saldo token (tombol Top Up menonjol, biru)
- **Kolom tengah:** daftar research milik saya, tiap item mirip Research Card tapi dengan progress bar (X dari Y responden) alih-alih tombol "Kerjakan"
- **Kolom kanan:** shortcut "Buat Research Baru" (tombol besar, biru, posisi paling atas kolom kanan)

### Create Research (Form)
- Layout 2 kolom: form di kiri, **ringkasan biaya live-update** di kanan (sticky, selalu terlihat saat scroll) — prinsip "biaya harus terlihat sebelum submit" (§4) harus benar-benar terasa, bukan cuma di teks.

### Admin Panel (Quality & Finance terpisah)
- Layout dense/tabel (bukan card besar seperti sisi user) — admin butuh scan cepat banyak data.
- Warna nav berbeda dari sisi user (mis. neutral dark) supaya admin sadar sedang di lingkungan berbeda — mencegah salah klik/aksi.

### Customer Support
- Form tiket sederhana, 1 kolom. Bukan halaman yang sering dibuka, prioritaskan kejelasan atas estetik.

---

## 4. Prinsip UX Kunci (wajib dipatuhi FE)

1. **Toggle mode instan** — state tersimpan di client, tidak reload penuh halaman. Nilai jual utama produk, harus mulus seperti pindah tab.
2. **Biaya research terlihat sebelum submit** — panel ringkasan biaya di form create research sticky & live-update.
3. **Reward per jawaban tampil di card feed**, bukan disembunyikan di detail page — elemen paling menonjol setelah judul (hijau, bold).
4. **Status "sedang direview admin" komunikatif** — tampilkan estimasi waktu eksplisit ("Direview, estimasi maks 48 jam"), warna `warning`, bukan abu-abu generik "pending".
5. **Consent checkbox (agama, data-share) terpisah** dari checkbox "Setuju Syarat & Ketentuan" — dua checkbox berbeda, dua baris berbeda, tidak digabung.
6. **Quality Score tidak ditampilkan sebagai angka mentah** — badge kualitatif (Baik/Cukup/Perlu Diperbaiki), angka asli hanya tersimpan di database untuk matching.

---

## 5. Daftar Larangan Eksplisit (supaya tidak generic/AI-template & tidak menyimpang lagi)

- ❌ Glassmorphism, blur kaca, `::before` specular shine
- ❌ Gradient dekoratif di background section
- ❌ Palet warna tambahan: indigo, ungu/violet, amber/gold, rose — **tidak ada di brand ini**
- ❌ Shadow abu-abu tebal/seragam di semua elemen — pakai border tipis `neutral-border`
- ❌ Label ALL CAPS untuk badge/status — pakai sentence case ("Sedang direview", bukan "SEDANG DIREVIEW")
- ❌ Eyebrow label di atas tiap heading kecuali benar-benar perlu (mis. tag kategori research)
- ❌ Hero landing page besar center-aligned dengan headline marketing raksasa — ini produk feed/dashboard, bukan landing page SaaS generik
- ❌ Custom scrollbar warna-warni, animasi `pulseGlow`, atau efek dekoratif lain yang tidak tercantum di §2

---

## 6. Langkah Berikutnya

1. Ambil hex biru & hijau **persis** dari file sumber logo (bukan estimasi di §2.1) sebelum dipakai di kode.
2. Bangun token system (`globals.css` atau setara) hanya dari tabel §2 — tidak menambah token warna baru.
3. High-fidelity mockup / build langsung mengikuti IA di §3.
4. Setiap walkthrough perubahan desain wajib mencantumkan konfirmasi kepatuhan terhadap §0.
