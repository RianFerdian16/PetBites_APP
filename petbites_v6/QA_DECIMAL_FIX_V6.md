# PetBites v6 — Decimal text fix

Perubahan ini menutup kasus angka desimal yang tersimpan sebagai teks panjang, misalnya:

- `5.5000000000000000` → `5,5` pada bahasa Indonesia
- `5.5000000000000000` → `5.5` pada bahasa Inggris
- `5.432343` → `5,43` pada bahasa Indonesia
- `5.432343` → `5.43` pada bahasa Inggris
- `5.000000` → `5`

Perlindungan diterapkan pada dua lapisan:

1. Frontend memformat angka yang terdapat di dalam konten Supabase sebelum ditampilkan.
2. Migration database membersihkan data `portion_rules` lama dan memasang trigger agar data baru otomatis dinormalisasi maksimal dua desimal.

Cache konten dinaikkan dari `v5` ke `v6` supaya browser tidak memakai data lama.
