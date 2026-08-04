# PetBites v6 — Database-backed bilingual content

Versi ini menyimpan konten Indonesia dan English pada kolom Supabase yang berbeda.
Konten dari database tidak lagi diterjemahkan memakai penggantian kata di browser.
AI hanya membuat draft English; admin tetap harus memeriksa dan menyimpan hasilnya.

## Yang sudah diubah

- Kolom `*_en` untuk burung, pakan, Safety/Toxic Checker, porsi, resep, bahan, dan langkah.
- Backfill English untuk konten lama yang dikenali oleh proyek.
- Dashboard admin memiliki field Indonesia dan English.
- Aksi AI **Buat versi Inggris** mengisi field English pada draft.
- Record berstatus `published` ditolak bila field English wajib belum lengkap.
- Burung baru tidak dapat dipublikasikan sebelum Food, Safety, Portion, dan Recipe siap.
- Frontend pengguna membaca langsung kolom English dan tidak mencampur bahasa Indonesia.
- Angka ditampilkan maksimal dua digit desimal, termasuk angka yang tertanam di teks porsi.
- Data porsi lama dengan nol berlebih dibersihkan oleh migration v6.
- Trigger database menormalisasi angka pada porsi baru secara otomatis.
- Cache konten menggunakan `petbites:content:v6`.

## File penting

- Migrations:
  - `supabase/migrations/20260803000000_bilingual_content.sql`
  - `supabase/migrations/20260804000000_normalize_portion_decimals.sql`
- Audit database: `supabase/verify_bilingual_content.sql`
- Edge Function: `supabase/functions/petbites-ai/index.ts`
- Hasil QA: `QA_BILINGUAL_V5.md` dan `QA_DECIMAL_FIX_V6.md`

## Urutan deployment wajib

Jangan push frontend v6 ke branch production sebelum migration selesai.

### 1. Backup proyek lama

```bat
robocopy "D:\PetBites\petbites-lama" "D:\PetBites\backup-sebelum-v6" /E /XD node_modules .git dist build .next
```

### 2. Salin source v6

Gunakan folder hasil ekstrak yang langsung berisi `package.json`.
Jangan memakai `/XO` karena file v6 dapat dilewati hanya karena timestamp tujuan lebih baru.

```bat
robocopy "D:\PetBites\petbites_v6" "D:\PetBites\petbites-lama" /E /XD node_modules .git dist build .next /XF .env .env.local
```

### 3. Instal dependency bersih

```bat
cd /d "D:\PetBites\petbites-lama"
rmdir /s /q node_modules
npm ci
npm run typecheck
npm run lint
```

Jangan hapus `.env.local` proyek lama. Pastikan hanya berisi konfigurasi browser Supabase yang memang public.

### 4. Hubungkan Supabase CLI

```bat
npx supabase login
npx supabase link --project-ref PROJECT_REF_KAMU
```

### 5. Tinjau lalu jalankan migration

```bat
npx supabase db push --dry-run
npx supabase db push
```

Cek di Supabase Table Editor bahwa kolom seperti `name_en`, `description_en`, dan `benefits_en` sudah ada.

### 6. Atur secret AI dan deploy Edge Function

Jangan masukkan API key ke source code atau `.env.local`.

```bat
npx supabase secrets list
npx supabase secrets set GEMINI_API_KEY=API_KEY_KAMU
npx supabase functions deploy petbites-ai
```

`GEMINI_MODEL` bersifat opsional. Bila tidak diatur, function menggunakan default yang ada di source.

### 7. Jalankan admin v6 secara lokal

```bat
npm run dev
```

Buka alamat lokal yang ditampilkan Vite, lalu masuk ke `/admin`.

Untuk setiap konten yang belum memiliki English:

1. Buka record.
2. Pilih **Buat versi Inggris**.
3. Klik untuk menerapkan hasil AI ke draft.
4. Periksa nama, kalimat, manfaat, bahan, dan langkah secara manual.
5. Simpan sebagai Draft/Review bila belum lengkap.
6. Ubah menjadi Published hanya setelah kedua bahasa lengkap.

Untuk burung baru, buat burung sebagai Draft terlebih dahulu. Tambahkan Food, Portion, Safety, dan Recipe beserta English-nya. Publikasikan profil burung paling akhir.

### 8. Audit database

Buka Supabase SQL Editor dan jalankan seluruh isi:

```text
supabase/verify_bilingual_content.sql
```

Tiga hasil audit harus menghasilkan nol baris:

- record Published yang kehilangan English;
- bahan/langkah resep Published yang kehilangan English;
- burung Published yang belum mempunyai semua bagian dashboard.

Setelah semuanya nol, jalankan lima perintah `VALIDATE CONSTRAINT` yang tersedia di bagian bawah file audit.

### 9. Jalankan QA dan build lokal

```bat
npm run qa
```

Perintah harus selesai tanpa error sebelum commit.

### 10. Commit dan deploy ke Vercel

```bat
git status
git diff --stat
git add .
git commit -m "Add bilingual content and decimal normalization"
git push origin main
```

Bila production branch bukan `main`, push ke branch production yang digunakan proyek Vercel.

### 11. Uji setelah deployment

- Buka bahasa Indonesia dan English.
- Uji Food, Safety, Portion, dan Recipes pada beberapa jenis burung.
- Pastikan tidak ada kalimat campuran.
- Pastikan angka seperti `5.432343` tampil `5,43` dalam Indonesia dan `5.43` dalam English.
- Masuk ke `/admin`.
- Buat satu burung percobaan sebagai Draft.
- Pastikan publish ditolak ketika English atau salah satu bagian dashboard belum lengkap.
- Hapus draft percobaan setelah pengujian.

## Rollback aman

Migration v5 hanya menambahkan kolom, fungsi, constraint, dan trigger. Bila frontend bermasalah, revert commit atau gunakan rollback deployment Vercel. Jangan langsung menghapus kolom Supabase karena versi frontend lama tetap dapat berjalan meskipun kolom tambahan masih ada.
