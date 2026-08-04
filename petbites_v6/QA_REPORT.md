# PetBites UI Redesign & QA Report

**Tanggal pemeriksaan:** 23 Juli 2026  
**Lingkup:** UI/UX, maintainability, static profiling, responsive runtime profiling, performance safeguards, dan code-quality checks.

## 1. Ringkasan hasil

Project telah direstrukturisasi dan didesain ulang tanpa mengubah sumber data Supabase. Tampilan baru menggunakan identitas visual hijau–krem–coral yang lebih konsisten, ilustrasi burung buatan sendiri berbasis SVG/CSS, hierarchy teks yang lebih jelas, dan interaksi yang lebih natural.

Perubahan utama:

- welcome screen pertama kali per sesi dengan animasi burung melintas dan tombol **Lewati**;
- homepage baru dengan value proposition yang langsung menjelaskan kegunaan aplikasi;
- bagian fitur, cara kerja, pencarian burung, dan kartu spesies yang lebih terstruktur;
- dashboard baru dengan profil burung, tab responsif, Food Finder, Toxic Checker, porsi, dan resep;
- dark mode yang mengikuti preferensi sistem dan dapat disimpan secara lokal;
- loading skeleton dan error/retry state yang lebih informatif;
- animasi ringan berbasis `transform` dan `opacity` serta fallback reduced motion;
- tidak ada font eksternal sehingga first render tidak menunggu request font;
- layout diuji pada desktop dan viewport smartphone.

## 2. Perbaikan arsitektur kode

### Sebelum

- `src/routes/index.tsx`: **747 baris** dan memuat hampir seluruh UI serta logika fitur.
- Komponen halaman, dashboard, loading, error, dan seluruh tools berada pada satu file.
- Pemrosesan hasil Supabase menggunakan beberapa `.filter()` berulang untuk setiap burung.

### Sesudah

- `src/routes/index.tsx`: **sekitar 100 baris**, hanya mengatur state halaman dan routing flow.
- UI dipisah menjadi enam modul di `src/features/petbites/`.
- Service memakai grouping berbasis `Map`, sehingga jumlah pemindaian array berulang pada service berkurang dari **9** menjadi **4** pemanggilan `.filter()`.
- Delapan query Supabase tetap dijalankan paralel menggunakan `Promise.all`.
- Ditambahkan memory cache dan `sessionStorage` cache dengan TTL lima menit.
- Ditambahkan cache invalidation saat pengguna menekan retry.
- Akses `localStorage` dan `sessionStorage` dibungkus dengan fallback agar private browsing atau storage restriction tidak membuat aplikasi crash.
- Pilihan burung disimpan per sesi dan dipulihkan setelah refresh.

## 3. Static profiling

### Pemeriksaan yang dijalankan

| Pemeriksaan                | Hasil                                                  |
| -------------------------- | ------------------------------------------------------ |
| TypeScript `tsc --noEmit`  | Lulus                                                  |
| ESLint                     | Lulus, 0 error                                         |
| Prettier check             | Lulus                                                  |
| Secret scan di source      | Tidak menemukan publishable/secret key nyata di source |
| External font/request scan | Tidak menemukan font eksternal di source UI            |
| Generated route            | Tidak diedit manual                                    |

### Temuan dan tindakan

1. **Monolithic route** — dipecah menjadi modul yang lebih mudah dipahami dan diuji.
2. **Repeated data filtering** — diganti grouping map untuk food, toxic data, porsi, resep, bahan, dan langkah.
3. **Repeated Supabase reads** — dikurangi melalui cache lima menit.
4. **Storage exceptions** — ditangani dengan `try/catch` dan fallback in-memory.
5. **Mobile tab overflow** — ditemukan saat runtime profiling; alignment dan negative margin diperbaiki.
6. **Welcome wing/leaf transform override** — transform dasar sebelumnya berpotensi tertimpa keyframe; diperbaiki menggunakan CSS custom properties.
7. **Indonesian semantics** — root document memakai `lang="id"`; error dan not-found state dilokalkan.
8. **Loading experience** — blank spinner diganti branded skeleton state.
9. **Animation accessibility** — reduced-motion menonaktifkan gerakan berat dan mempersingkat welcome state.
10. **Image rendering** — kartu spesies memakai intrinsic size, lazy loading, dan async decoding.

## 4. Dynamic profiling

Dynamic visual/runtime QA dilakukan dengan merender komponen React yang sama dari source, menggunakan CSS Tailwind hasil compile, lalu menjalankannya di Chromium melalui Playwright. Data mock hanya dipakai untuk menghindari perubahan atau ketergantungan jaringan terhadap database pengguna.

### Viewport yang diperiksa

- Desktop: **1440 × 1000**
- Smartphone emulation: sekitar **390 px** lebar dengan device pixel ratio 3
- Homepage, welcome screen, dashboard, search filtering, dark mode, dan mobile tab strip

### Hasil runtime

| Pemeriksaan                                | Hasil                                  |
| ------------------------------------------ | -------------------------------------- |
| Horizontal overflow homepage desktop       | Tidak ada                              |
| Horizontal overflow homepage mobile        | Tidak ada                              |
| Horizontal overflow dashboard desktop      | Tidak ada                              |
| Horizontal overflow dashboard mobile       | Tidak ada setelah perbaikan            |
| Console error                              | 0                                      |
| Unhandled page error                       | 0                                      |
| Target sentuh aktif di bawah 40 px         | 0 pada harness mobile                  |
| Search `kenari`                            | 1 kartu yang benar tetap terlihat      |
| Dark mode toggle                           | Berhasil mengubah root ke class `dark` |
| Welcome skip                               | Overlay berhasil ditutup               |
| Long task setelah startup/ketika interaksi | 0 pada homepage dan dashboard          |
| DOM node homepage                          | 263 pada data uji                      |
| DOM node dashboard aktif                   | 238 pada data uji                      |

Satu startup long task sekitar 158 ms terlihat pada harness desktop karena seluruh CSS QA yang belum diminifikasi diinjeksi inline dalam satu operasi. Setelah startup selesai, tidak ditemukan long task pada interaksi yang diuji. Production build normal memproses CSS melalui pipeline Vite, bukan melalui metode inline harness tersebut.

## 5. Mobile dan cross-device safeguards

- `min-width: 320px` untuk batas perangkat kecil.
- breakpoint pada 1040 px, 800 px, dan 560 px.
- safe-area digunakan pada elemen welcome untuk perangkat ber-notch.
- tab dashboard memakai internal horizontal scrolling tanpa membuat document melebar.
- komponen utama berubah dari multi-column menjadi single-column pada layar kecil.
- tidak menggunakan `background-attachment: fixed`.
- animasi tidak memakai JavaScript per-frame loop.
- sebagian besar animasi hanya mengubah transform dan opacity.
- `prefers-reduced-motion` menurunkan durasi menjadi hampir instan dan menyembunyikan burung terbang.
- `content-visibility: auto` digunakan pada panel fitur yang berat.
- font menggunakan system stack sehingga konsisten dan cepat di Windows, macOS, Android, dan iOS.

## 6. Batasan pengujian lingkungan

Production build tidak dapat diselesaikan di container pemeriksaan karena ZIP pengguna membawa `node_modules` hasil instalasi Windows, sedangkan Vite 8 membutuhkan native Rolldown binding untuk Linux. Container juga tidak memiliki akses jaringan npm untuk memasang ulang binding Linux.

Ini bukan error source TypeScript. Typecheck, lint, formatting, SSR component rendering, compiled CSS, dan dynamic browser QA berhasil. Final ZIP sengaja **tidak menyertakan `node_modules`**. Pada perangkat pengguna, jalankan instalasi dependency baru agar native package sesuai sistem operasi:

```bash
npm install
npm run build
```

atau:

```bash
bun install
bun run build
```

## 7. Checklist sebelum production deploy

1. Pastikan `.env.local` tidak masuk Git.
2. Jalankan `npm install` pada mesin target.
3. Jalankan `npm run qa`.
4. Uji koneksi ke Supabase dengan RLS aktif.
5. Uji satu record baru pada setiap tabel utama.
6. Periksa gambar burung aktual agar rasio dan ukuran file terkontrol.
7. Uji Safari iOS fisik dan browser Android fisik sebelum publikasi luas.
8. Jalankan Lighthouse pada URL deploy karena network, CDN, dan hosting tidak dapat diukur dari source ZIP.

## 8. Status akhir

**Siap dilanjutkan ke local install, production build, koneksi Supabase, dan device testing fisik.** Tidak ditemukan error TypeScript, ESLint, formatting, console runtime, atau overflow responsif pada viewport yang diuji.
