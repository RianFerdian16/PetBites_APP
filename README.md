# PetBites

PetBites adalah web app panduan nutrisi burung yang membantu pemilik burung:

- mencari pakan utama dan pakan tambahan;
- memeriksa bahan aman, terbatas, atau berbahaya;
- melihat perkiraan porsi berdasarkan ukuran dan kondisi;
- mengikuti resep sederhana yang tersimpan di Supabase.

Aplikasi saat ini fokus pada burung dan dirancang agar jenis burung baru dapat ditambahkan melalui database tanpa menulis ulang halaman utama.

## Stack

- React 19 + TypeScript
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS
- Supabase
- Radix UI + komponen shadcn/ui

## Struktur utama

```text
src/
├── features/petbites/
│   ├── dashboard.tsx
│   ├── home.tsx
│   ├── illustrations.tsx
│   ├── site-chrome.tsx
│   ├── use-petbites-content.ts
│   └── welcome-screen.tsx
├── lib/
│   ├── bird-service.ts
│   ├── birds-data.ts
│   └── supabase.ts
├── routes/
│   ├── __root.tsx
│   └── index.tsx
└── styles.css
```

`src/routes/index.tsx` hanya mengatur alur halaman. UI, state data, ilustrasi, dan fitur dipisahkan ke modul masing-masing agar lebih mudah dirawat.

## Menjalankan secara lokal

### 1. Instal dependency

Gunakan salah satu package manager secara konsisten.

```bash
npm install
```

atau:

```bash
bun install
```

Jangan menyalin `node_modules` dari komputer lain karena dependency native berbeda antara Windows, macOS, dan Linux.

### 2. Buat `.env.local`

Salin `.env.example` menjadi `.env.local`, lalu masukkan Project URL dan publishable key dari Supabase.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Jangan menggunakan `service_role` key di frontend dan jangan commit `.env.local`.

### 3. Jalankan aplikasi

```bash
npm run dev
```

## Script kualitas

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run qa
```

`npm run qa` menjalankan typecheck, lint, dan production build secara berurutan.

## Database Supabase

Struktur dan seed database berada di folder:

```text
supabase/
```

Panduan lengkap tersedia di:

```text
SUPABASE_SETUP.md
```

Data berikut dibaca langsung dari Supabase:

- fitur aplikasi;
- profil burung;
- daftar pakan;
- Toxic Checker;
- aturan porsi;
- resep, bahan, dan langkah.

Data dimuat paralel, kemudian dikelompokkan di sisi aplikasi. Hasilnya disimpan sementara selama lima menit di memory dan `sessionStorage` untuk mengurangi pembacaan berulang saat pengguna berpindah halaman.

## Responsiveness dan aksesibilitas

- layout mobile-first untuk Android dan iOS;
- tab dashboard dapat digeser horizontal pada layar kecil;
- target sentuh berukuran nyaman;
- dukungan dark mode;
- dukungan `prefers-reduced-motion`;
- gambar menggunakan lazy loading dan asynchronous decoding;
- tidak bergantung pada font eksternal;
- status aman, hati-hati, dan berbahaya tidak hanya dibedakan melalui warna.

Detail perubahan dan hasil pengujian tersedia di [QA_REPORT.md](./QA_REPORT.md).
