# LogIntern — Notulensi Catatan Harian Magang

LogIntern adalah platform berbasis web modern yang dirancang untuk membantu peserta magang mendokumentasikan aktivitas harian secara rapi, terstruktur, dan elegan. Dilengkapi dengan autentikasi Google OAuth, penyimpanan cloud database Turso, filter riwayat interaktif, serta fitur ekspor recap langsung ke format berkas Spreadsheet Excel (.xlsx).

---

## Fitur Utama

- Autentikasi Google OAuth (NextAuth v5 / Auth.js): Log masuk instan dan aman menggunakan akun Google dengan proteksi Edge Middleware & Kadaluarsa Sesi otomatis 24 Jam.
- Pencatatan Notulensi Harian: Catat tanggal, mode kerja (WFO / WFA), jam operasional, rincian aktivitas, serta bukti foto dokumentasi (dari kamera perangkat atau unggah file).
- Auto-Populasi Data Profil & Onboarding: Mengunci nama perusahaan dan mentor dari pengaturan awal profil pengguna sehingga tidak perlu diisi berulang kali saat membuat notulensi baru.
- Filter Kombinasi & Pencarian Riwayat: Filter data catatan harian berdasarkan Bulan, Tahun, dan Mode Kerja (WFO/WFA/Semua) serta pencarian kata kunci secara real-time.
- Ekspor Recap Spreadsheet (.xlsx): Unduh data notulensi harian ke format Excel .xlsx dengan opsi unduhan Semua Data atau Sesuai Filter yang dipilih.
- Unduh Foto Dokumentasi: Fitur pratinjau lightbox dan unduh foto dokumentasi kegiatan harian langsung dari halaman detail notulensi.
- Client-Side Data Caching: Optimasi performa memori lokal (TTL 30s) untuk mencegah pemanggilan HTTP GET berulang saat navigasi antar tab.
- Serverless Cloud Database (Turso libSQL): Integrasi penuh Prisma ORM 7 dengan Turso Cloud Database untuk persistensi data berkecepatan tinggi.

---

## Teknologi yang Digunakan (Tech Stack)

- Framework: Next.js 16 (App Router & Turbopack)
- Bahasa: TypeScript
- Autentikasi: NextAuth v5 (next-auth@beta)
- Database & ORM: Prisma ORM 7 (@prisma/adapter-libsql) & Turso Cloud
- Styling & UI: Tailwind CSS v4, Geist Font, Sonner Toast
- Pengolahan Berkas & Waktu: SheetJS (xlsx), date-fns (Bahasa Indonesia)

---

## Panduan Memulai (Local Setup Guide)

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

### 1. Prasyarat
- Node.js versi 18.x atau lebih baru
- npm, yarn, atau pnpm
- Akun Turso Database (Opsional jika ingin terhubung ke cloud) atau SQLite lokal

### 2. Kloning Repositori
```bash
git clone https://github.com/keychainbalee/logintern_web.git
cd logintern_web
```

### 3. Install Dependensi
```bash
npm install --legacy-peer-deps
```

### 4. Konfigurasi Environment Variables (.env)
Salin berkas templat .env.example menjadi .env:
```bash
cp .env.example .env
```
Buka berkas .env dan isi variabel berikut:
```ini
# Database SQLite Lokal / Turso Cloud
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="libsql://your-turso-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"

# NextAuth / Auth.js Configuration
AUTH_SECRET="your-32-character-random-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

# Google OAuth Credentials (Dapatkan dari Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Migrasi & Push Schema Database
Jalankan perintah Prisma untuk membuat tabel di database Anda:
```bash
npx prisma db push
```

### 6. Jalankan Server Pengembang
```bash
npm run dev
```
Buka http://localhost:3000 di browser Anda.

---

## Panduan Deployment di Vercel

1. Push Kode ke GitHub: Pastikan seluruh perubahan kode telah berada di repositori GitHub Anda.
2. Import ke Vercel:
   - Buka Vercel Dashboard -> Add New Project -> Pilih repositori logintern_web.
   - Framework Preset: Next.js.
   - Build Command: npx prisma generate && next build
3. Environment Variables di Vercel:
   Masukkan variabel TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, NEXTAUTH_URL (Domain Vercel Anda), GOOGLE_CLIENT_ID, dan GOOGLE_CLIENT_SECRET.
4. Google OAuth Callback Redirect URIs:
   Di Google Cloud Console, tambahkan URL callback Vercel Anda di bagian Authorized redirect URIs:
   ```
   https://domain-vercel-anda.vercel.app/api/auth/callback/google
   ```

---

## Struktur Direktori Proyek

```
logintern/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── api/              # Endpoint REST API (auth, logs, profile)
│   ├── input/            # Halaman Form Input Notulensi
│   ├── logs/             # Halaman Riwayat Notulensi & Export
│   ├── onboarding/       # Halaman Pengisian Profil Awal
│   ├── overview/         # Halaman Dashboard Overview Statistik
│   ├── settings/         # Halaman Pengaturan Profil Akun
│   └── page.tsx          # Landing Page & Loading OAuth Screen
├── components/           # Komponen React Reusable (Sidebar, LogList, LogForm, dsb.)
├── lib/                  # Utilitas (prisma client, client-side cache)
├── prisma/               # Schema Prisma Database (User, Log, Account, Session)
├── public/               # Asset Statis & Logo Vector LogIntern (/logo/LogIntern.svg)
├── .env.example          # Templat Environment Variables
├── .npmrc                # Konfigurasi npm legacy-peer-deps
└── README.md             # Dokumen Petunjuk Proyek
```

---

## Lisensi

Proyek ini dibuat untuk kebutuhan pencatatan dan pengelolaan KPI harian peserta magang. Silakan pelajari, gunakan, dan kembangkan lebih lanjut.
