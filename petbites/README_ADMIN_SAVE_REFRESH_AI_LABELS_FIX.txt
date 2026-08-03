PetBites CMS - Save, refresh, and AI label feedback fix

Yang diperbaiki:
- Tombol Simpan menampilkan pemberitahuan berhasil/gagal tepat di dekat tombol.
- Tombol Muat ulang benar-benar mengambil ulang record aktif dari Supabase.
- Isi form termasuk deskripsi kembali ke versi terakhir yang tersimpan.
- Tombol Muat ulang memiliki loading state dan hasil yang jelas.
- Label AI dibuat lebih mudah dipahami:
  - Buat versi Inggris dari isi ini
  - Cek bagian isi yang perlu diperbaiki
- Ditambahkan penjelasan singkat mengenai fungsi setiap pilihan AI.

Cara pasang:
1. Extract zip ini ke folder petbites_admin_feedback_fix.
2. Jalankan:
   robocopy "D:\data C\Download\petbites_admin_feedback_fix" "D:\data C\Download\petbites" /E /R:1 /W:1
3. cd "D:\data C\Download\petbites"
4. npm run qa
5. git add -A
6. git commit -m "Improve CMS save refresh and AI feedback"
7. git push
