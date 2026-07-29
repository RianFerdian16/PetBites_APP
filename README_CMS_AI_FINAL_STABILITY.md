# PetBites CMS + AI Final Stability Patch

Patch konsolidasi untuk CMS private dan Gemini AI PetBites.

## Yang dibenahi

- Save memakai allowlist kolom berbeda untuk setiap tabel Supabase.
- Mencegah field salah seperti `benefits` masuk ke `birds` dan `source_urls` masuk ke `bird_requests`.
- Semua area CMS tetap didukung: Burung, Pakan, Toxic Checker, Aturan porsi, Resep, Request pengguna.
- Resep tetap menyimpan tabel resep, ingredients, dan steps.
- Pesan berhasil/gagal tampil setelah Simpan, Hapus, Upload, Muat ulang, Jalankan AI, Terapkan draft, dan Salin terjemahan.
- Muat ulang benar-benar mengambil data terakhir dari Supabase.
- AI hanya boleh mengubah field yang aman dan relevan untuk jenis konten aktif.
- AI tidak dapat mengubah ID, bird_id, sumber, kontak, gambar, urutan, atau status publikasi.
- Role reviewer hanya boleh menjalankan pemeriksaan isi, dipaksa di UI dan Edge Function.
- Buat draft dan Perbaiki isi dapat diterapkan ke form.
- Buat versi Inggris menjadi preview yang dapat disalin dan tidak menimpa bahasa Indonesia.
- Cek bagian isi menjadi catatan review dan tidak mengubah form.
- Error Edge Function menampilkan pesan sebenarnya dari server.
- Default model fallback: `gemini-3.5-flash-lite`.

## Instalasi

1. Extract ZIP ke:

   `D:\data C\Download\petbites_cms_ai_final`

2. Matikan localhost dengan `Ctrl + C`.

3. Salin patch:

```powershell
robocopy "D:\data C\Download\petbites_cms_ai_final" "D:\data C\Download\petbites" /E /R:1 /W:1
```

4. QA di Windows:

```powershell
cd "D:\data C\Download\petbites"
npx prettier --write "src/features/admin/admin-app.tsx" "src/lib/admin-service.ts" "src/styles.css" "supabase/functions/petbites-ai/index.ts"
npm run qa
```

5. Deploy Edge Function karena source Gemini ikut berubah:

```powershell
npx supabase@latest functions deploy petbites-ai --no-verify-jwt
```

6. Push frontend ke Vercel:

```powershell
git add -A
git commit -m "Finalize CMS and Gemini AI stability"
git push
```

7. Setelah Vercel Ready, logout/login `/admin`, lalu hard refresh `Ctrl + F5`.

## Tidak perlu

- Tidak perlu menjalankan SQL baru.
- Tidak perlu memasukkan ulang Gemini API key.
- Tidak perlu mengubah Supabase database.

## Tes final

Untuk setiap tab, edit satu field kecil, klik Simpan, klik Muat ulang, lalu pastikan perubahan tetap ada.

AI:

1. Buat draft → Jalankan AI → Terapkan ke draft → Simpan → Muat ulang.
2. Perbaiki isi → Jalankan AI → Terapkan ke draft → Simpan → Muat ulang.
3. Buat versi Inggris → Jalankan AI → Salin versi Inggris.
4. Cek bagian isi → Jalankan AI → baca hasil; mode ini memang tidak mengubah form.

Lakukan setidaknya satu tes AI pada Burung dan Request pengguna.
