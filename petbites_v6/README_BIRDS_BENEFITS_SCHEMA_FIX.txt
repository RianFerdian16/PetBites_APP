PetBites CMS - birds benefits schema fix

Masalah:
CMS menyisipkan field virtual `benefits` ke record Burung, padahal kolom
`benefits` hanya ada pada tabel `bird_foods`. Supabase lalu menolak tombol
Simpan dengan pesan schema cache.

Perbaikan:
- Field benefits hanya dibentuk untuk data Pakan.
- Payload sebelum upsert juga disanitasi sebagai perlindungan tambahan.
- Tidak perlu menambah kolom benefits ke tabel birds.
- Tidak mengubah data, desain homepage, Gemini, atau skema Supabase.
