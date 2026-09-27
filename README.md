<div align="center">
  <img src="public/logo/LogIntern.svg" alt="LogIntern Logo" width="110" height="110" />
  
  # LogIntern
  **Platform Pencatatan & Notulensi Catatan Harian Magang Modern**

  *Kelola jurnal harian magang, dokumentasi kerja, dan KPI dengan mudah, rapi, dan elegan.*

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
    <a href="https://turso.tech"><img src="https://img.shields.io/badge/Database-Turso_libSQL-4FF8D2?style=flat-square&logo=sqlite" alt="Turso" /></a>
    <a href="https://authjs.dev"><img src="https://img.shields.io/badge/Auth-NextAuth_v5-purple?style=flat-square" alt="NextAuth" /></a>
  </p>
</div>

---

## 📌 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan-tech-stack)
- [Panduan Konfigurasi Lengkap](#-panduan-konfigurasi-lengkap-step-by-step)
  - [1. Konfigurasi Database (SQLite Lokal vs Turso Cloud)](#1-konfigurasi-database)
  - [2. Konfigurasi Google OAuth 2.0](#2-konfigurasi-google-oauth-20)
  - [3. Konfigurasi Auth Secret & URL](#3-konfigurasi-auth-secret--url)
  - [4. Konfigurasi Cloudinary & SMTP (Opsional)](#4-konfigurasi-cloudinary--smtp-opsional)
- [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi-local)
- [Panduan Deployment ke Vercel](#-panduan-deployment-ke-vercel)
- [Struktur Direktori](#-struktur-direktori)
- [Troubleshooting & Solusi](#-troubleshooting--solusi)
- [Lisensi](#-lisensi)

---

## 📖 Tentang Proyek

**LogIntern** adalah web application yang dibuat untuk mempermudah peserta magang (intern) dalam menyusun jurnal aktivitas harian secara real-time. Dengan tampilan antarmuka yang minimalis dan responsif, LogIntern memastikan notulensi harian, bukti foto dokumentasi, serta data pembimbing/perusahaan tersimpan rapi untuk kebutuhan evaluasi magang dan pelaporan berkala.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi Google OAuth (Auth.js / NextAuth v5)**: Masuk cepat dan aman tanpa password tambahan. Dilengkapi proteksi Edge Middleware dan sesi aman.
- 🚀 **Onboarding & Profil Terkunci**: Pengisian data universitas/sekolah, perusahaan, dan nama mentor otomatis terisi pada formulir jurnal tanpa perlu mengetik ulang setiap hari.
- 📝 **Pencatatan Notulensi Interaktif**: Dukungan penentuan mode kerja (**WFO** / **WFA**), jam operasional, uraian tugas, serta lampiran bukti dokumentasi.
- 📷 **Dokumentasi Terintegrasi**: Unggah berkas gambar langsung dari galeri atau potret langsung menggunakan kamera perangkat (*in-app camera capture*).
- 🔍 **Filter & Pencarian Pintar**: Jelajahi catatan harian berdasarkan rentang bulan, tahun, mode kerja, atau pencarian kata kunci aktivitas secara instan.
- 📊 **Dashboard Overview & Statistik**: Ringkasan total kehadiran, jam magang, dan statistik distribusi WFO vs WFA.
- 📑 **Ekspor Laporan Spreadsheet (.xlsx)**: Unduh rekapitulasi data magang ke dalam format Excel (.xlsx), baik keseluruhan log maupun log yang tersaring (*filtered*).
- ⚡ **Optimasi Kecepatan & Caching**: Menggunakan *Client-Side TTL Caching* untuk navigasi instan antar-halaman tanpa membebani kuota API.
- ☁️ **Dual-Database Support**: Fleksibel berjalan dengan SQLite lokal untuk pengembangan cepat atau Turso Cloud Database (libSQL) untuk skala produksi.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, Turbopack, & Server Actions |
| **Bahasa** | TypeScript | Type-safety penuh di seluruh modul |
| **Styling** | Tailwind CSS v4 | Utilitas styling terkini dengan performa ultra cepat |
| **Autentikasi** | NextAuth.js v5 (Beta) | Google OAuth Provider dengan Edge Middleware |
| **Database** | Turso (libSQL) / SQLite | Serverless distributed database berlatensi rendah |
| **ORM** | Prisma 7 | Database toolkit & schema management (`@prisma/adapter-libsql`) |
| **Komponen UI** | Lucide Icons, Sonner | Icon pack modern dan Toast notifications interaktif |
| **Export & Date** | SheetJS (`xlsx`), `date-fns` | Manipulasi file Excel dan penanggalan berbahasa Indonesia |

---

## ⚙️ Panduan Konfigurasi Lengkap (Step-by-Step)

Sebelum menjalankan aplikasi, Anda perlu menyiapkan berkas konfigurasi `.env`. Salin berkas templat yang telah disediakan:

```bash
cp .env.example .env
```

Berikut adalah panduan detail cara mengisi masing-masing nilai variabel pada `.env`:

### 1. Konfigurasi Database

LogIntern mendukung dua opsi database:

#### Opsi A: SQLite Lokal (Paling Mudah untuk Pengembangan Lokal)
Jika hanya ingin menjalankan proyek di komputer lokal tanpa mendaftar cloud:
```ini
DATABASE_URL="file:./dev.db"
# Kosongkan atau beri tanda komentar (#) pada TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN
```

#### Opsi B: Turso Cloud Database (Direkomendasikan untuk Production / Deployment)
1. Buat akun di [Turso.tech](https://turso.tech/).
2. Buat database baru melalui dashboard Turso atau via Turso CLI:
   ```bash
   turso db create logintern-db
   ```
3. Dapatkan database URL dan token otentikasi:
   ```bash
   turso db show logintern-db --url
   turso db tokens create logintern-db
   ```
4. Masukkan ke `.env`:
   ```ini
   DATABASE_URL="file:./dev.db"
   TURSO_DATABASE_URL="libsql://logintern-db-[username].turso.io"
   TURSO_AUTH_TOKEN="ey..."
   ```

---

### 2. Konfigurasi Google OAuth 2.0

Agar fitur *Sign in with Google* berfungsi:

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru (misalnya: `LogIntern`).
3. Buka menu **APIs & Services** > **OAuth consent screen**:
   - Pilih User Type: **External** > Klik **Create**.
   - Isi App name (`LogIntern`), User support email, dan Developer contact information.
   - Klik **Save and Continue** hingga selesai.
4. Buka menu **APIs & Services** > **Credentials**:
   - Klik **+ Create Credentials** > pilih **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `LogIntern Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (untuk lokal)
     - `https://domain-anda.vercel.app` (jika sudah di-deploy)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (untuk lokal)
     - `https://domain-anda.vercel.app/api/auth/callback/google` (untuk deployment)
   - Klik **Create**.
5. Salin **Client ID** dan **Client Secret** yang muncul, lalu tempelkan ke `.env`:
   ```ini
   GOOGLE_CLIENT_ID="xxxx-xxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"
   ```

---

### 3. Konfigurasi Auth Secret & URL

1. **AUTH_SECRET**: Kunci enkripsi sesi untuk Auth.js. Buat token acak 32 karakter menggunakan terminal:
   ```bash
   openssl rand -base64 32
   ```
   *Atau buat string acak sepanjang 32 karakter.*
2. **NEXTAUTH_URL**: URL dasar aplikasi:
   - Untuk lokal: `http://localhost:3000`
   - Untuk production: `https://domain-anda.vercel.app`
3. Masukkan ke `.env`:
   ```ini
   AUTH_SECRET="hasil-generate-openssl-anda"
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_TRUST_HOST="true"
   ```

---

### 4. Konfigurasi Cloudinary & SMTP (Opsional)

Jika ingin mengaktifkan upload CDN cloud eksternal atau notifikasi email:

```ini
# Cloudinary (Opsional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

# SMTP Email (Opsional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="LogIntern <noreply@logintern.com>"
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi (Local)

Pastikan di perangkat Anda telah terpasang **Node.js (v18.x atau lebih baru)** dan **npm**.

### 1. Kloning Repositori
```bash
git clone https://github.com/keychainbalee/logintern_web.git
cd logintern_web
```

### 2. Instalasi Dependensi
```bash
npm install --legacy-peer-deps
```
> [!NOTE]
> Flag `--legacy-peer-deps` direkomendasikan untuk menghindari konflik peer dependency pada React 19.

### 3. Generate & Sinkronisasi Skema Database
Generate Prisma client dan dorong schema tabel ke database:
```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🌐 Panduan Deployment ke Vercel

1. **Push ke GitHub**: Pastikan repository Anda telah diperbarui ke GitHub.
2. **Buat Proyek di Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New** > **Project**.
   - Pilih repository `logintern_web`.
3. **Pengaturan Build**:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npx prisma generate && next build`
4. **Environment Variables**:
   Tambahkan semua variabel berikut di pengaturan Environment Variables Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` *(masukkan URL Vercel produksi Anda, misal: `https://logintern.vercel.app`)*
   - `AUTH_TRUST_HOST` = `true`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. **Update Google Console**:
   Setelah mendapatkan domain Vercel, jangan lupa untuk menambahkan `https://domain-anda.vercel.app/api/auth/callback/google` pada Authorized redirect URIs di Google Cloud Console.

---

## 📁 Struktur Direktori

```text
logintern/
├── app/                      # Next.js App Router (Pages, Layouts, & API Routes)
│   ├── api/                  # API Endpoints (Auth, Logs, User Profile)
│   │   ├── auth/             # Handler Route NextAuth.js
│   │   ├── logs/             # CRUD Notulensi Harian
│   │   └── user/             # Update & Fetch Profil Pengguna
│   ├── input/                # Halaman Form Tambah Notulensi
│   ├── logs/                 # Halaman Riwayat, Detail, & Edit Log
│   │   ├── [id]/             # Detail & Lightbox Foto Dokumentasi
│   │   │   └── edit/         # Edit Log Notulensi
│   │   └── export/           # Halaman Ekspor Rekap (.xlsx)
│   ├── onboarding/           # Halaman Setup Profil Pertama Kali
│   ├── overview/             # Dashboard Analisis & Statistik Harian
│   ├── settings/             # Halaman Pengaturan & Edit Profil
│   └── page.tsx              # Landing Page & Handler Sesi OAuth
├── components/               # Komponen Antarmuka Reusable
│   ├── DocumentationPicker.tsx  # Komponen Kamera & Unggah Gambar
│   ├── LogForm.tsx           # Formulir Input & Validasi Notulensi
│   ├── LogList.tsx           # Daftar & Filter Pencarian Catatan
│   ├── Sidebar.tsx           # Navigasi Menu Responsif
│   └── ui/                   # Primitive UI components
├── lib/                      # Helper & Konfigurasi Eksternal
│   ├── cache.ts              # In-memory Client Cache (TTL 30 detik)
│   └── prisma.ts             # Inisialisasi Prisma Client & Turso Adapter
├── prisma/                   # Schema ORM Database
│   └── schema.prisma         # Definisi Model User, Account, Session, InternshipLog
├── public/                   # Asset Statis
│   └── logo/LogIntern.svg    # Identitas Visual Logo LogIntern
├── .env.example              # Contoh Templat Environment Variable
├── middleware.ts             # Route Protection & Session Interceptor
└── package.json              # Dependensi & Script Proyek
```

---

## ❓ Troubleshooting & Solusi

<details>
<summary><b>1. Error: "redirect_uri_mismatch" saat login Google</b></summary>
<br>
Pastikan URL redirect di Google Cloud Console sama persis dengan yang diakses:
- Jika di lokal: <code>http://localhost:3000/api/auth/callback/google</code> (perhatikan port dan HTTP, bukan HTTPS).
- Jika di Vercel: <code>https://domain-anda.vercel.app/api/auth/callback/google</code>.
</details>

<details>
<summary><b>2. Error saat menjalankan npm install (peer dependencies)</b></summary>
<br>
Gunakan perintah dengan flag:
<pre><code>npm install --legacy-peer-deps</code></pre>
Hal ini disebabkan versi library tertentu masih dalam penyesuaian terhadap React 19.
</details>

<details>
<summary><b>3. Tabel database belum terbaca / Prisma error</b></summary>
<br>
Pastikan Anda telah menjalankan perintah sinkronisasi schema:
<pre><code>npx prisma generate
npx prisma db push</code></pre>
</details>

---

## 📄 Lisensi

Didistribusikan di bawah lisensi terbuka untuk keperluan edukasi, pencatatan magang, dan pengembangan portofolio. Bebas digunakan dan dimodifikasi sesuai kebutuhan tim Anda.

<div align="center">
  <sub>Dibuat dengan ❤️ untuk kemudahan dan keteraturan dokumentasi magang.</sub>
</div>
