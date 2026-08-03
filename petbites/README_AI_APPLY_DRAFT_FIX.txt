PetBites AI "Terapkan ke draft" UX Fix

Yang diperbaiki:
- Tombol sekarang hanya menerapkan field yang benar-benar berubah.
- Hasil AI dengan field yang tidak ada di CMS akan diabaikan dengan aman.
- Sesudah tombol ditekan, muncul pemberitahuan tepat di panel AI.
- Pemberitahuan menyebut field apa saja yang berubah.
- Jika tidak ada perubahan baru, CMS menjelaskan bahwa draft sudah sama.
- Perubahan AI belum masuk database sebelum tombol Simpan ditekan.

Catatan:
- Aksi Review risiko/kekurangan biasanya hanya mengubah Status konten atau Status review.
- Untuk mengubah Deskripsi, pilih Perbaiki isi atau Buat draft.

Pasang:
robocopy "D:\data C\Download\petbites_ai_apply_draft_fix" "D:\data C\Download\petbites" /E /R:1 /W:1

Lalu:
npm run qa
git add -A
git commit -m "Fix AI apply-to-draft feedback"
git push
