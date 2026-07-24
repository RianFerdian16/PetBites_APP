PETBITES — FINAL PRODUCTION FINISH

Patch ini menyelesaikan tahap finishing UI/UX, responsive, aksesibilitas, dan optimasi rendering tanpa mengubah Supabase atau file environment.

PERUBAHAN UTAMA
- Tipografi diperbesar dan dibuat lebih proporsional di desktop, tablet, dan ponsel.
- Spacing, ukuran tombol, kartu, form, tab, hasil porsi, resep, footer, loading, dan error state dirapikan.
- Target sentuh minimum dibuat sekitar 44 px.
- Header tetap berfungsi saat pengguna sedang membuka dashboard burung.
- Fitur EN/ID dan dark mode tetap aktif; dark mode diterapkan sebelum halaman tampil untuk mengurangi flash.
- Teks teknis Supabase tidak lagi tampil ke pengguna produksi.
- Ditambahkan skip link untuk pengguna keyboard/screen reader.
- Search field dioptimalkan sebagai input pencarian.
- Gambar dashboard mendapat prioritas render; kartu burung tetap lazy-load.
- Background hutan dan welcome screen dipreload.
- Repeated card tidak lagi memakai banyak backdrop blur yang berat.
- Section di bawah layar memakai content-visibility untuk mengurangi pekerjaan render awal.
- Dukungan reduced motion, high contrast, dan reduced data tetap tersedia.

CARA PASANG
1. Extract ZIP ini ke:
   D:\data C\Download\petbites_final_production

2. Pastikan folder hasil extract langsung berisi:
   src
   README_FINAL_PRODUCTION.txt

3. Stop server di terminal VS Code:
   Ctrl + C

4. Copy patch ke project:
   robocopy "D:\data C\Download\petbites_final_production" "D:\data C\Download\petbites" /E /R:1 /W:1

5. Masuk ke project:
   cd "D:\data C\Download\petbites"

6. Jalankan pemeriksaan final:
   npm run qa

7. Jalankan web:
   npm run dev

8. Buka:
   http://localhost:8080/

9. Hard refresh browser:
   Ctrl + F5

WELCOME SCREEN
Versi welcome screen dinaikkan ke:
petbites:welcome-seen:v6-production
Karena key baru, welcome screen seharusnya tampil otomatis satu kali.

PUSH KE GITHUB / VERCEL
git add src
 git commit -m "Finish PetBites production UI and performance"
 git push

CATATAN
- Patch ini tidak menyentuh .env.local.
- Patch ini tidak menyentuh Supabase/database.
- Patch ini tidak menghapus foto burung atau background hutan.
- Preferensi bahasa dan tema pengguna tetap tersimpan.
