# Setup Supabase untuk PetBites

Project ini sudah diubah agar seluruh kartu burung, data Food Finder, Toxic Checker, aturan porsi, resep, dan metadata empat fitur dibaca dari Supabase. Data statis lama sudah dipindahkan ke `supabase/seed.sql`.

## 1. Data yang Disimpan

| Tabel                | Fungsi                                                   |    Data awal |
| -------------------- | -------------------------------------------------------- | -----------: |
| `app_features`       | Nama, deskripsi, urutan, dan status tab fitur            |      4 fitur |
| `birds`              | Profil jenis burung                                      |     4 burung |
| `bird_foods`         | Makanan utama dan extra fooding per burung               |      32 item |
| `toxic_entries`      | Data aman, hati-hati, atau berbahaya untuk Toxic Checker | 12 data umum |
| `portion_rules`      | Porsi berdasarkan ukuran dan kondisi                     |    36 aturan |
| `recipes`            | Judul dan tujuan resep per burung                        |      8 resep |
| `recipe_ingredients` | Bahan setiap resep                                       |     32 bahan |
| `recipe_steps`       | Tahapan setiap resep                                     |   40 langkah |

Kolom penting untuk pengembangan:

- `sort_order`: mengatur urutan tampilan tanpa mengubah kode.
- `is_active`: menyembunyikan fitur atau burung tanpa menghapus data.
- `image_url`: URL foto burung. Jika kosong, website memakai emoji.
- `review_status`: `needs_review`, `reviewed`, atau `archived`.
- `source_urls`: daftar sumber referensi untuk proses validasi konten.
- `bird_id`: menghubungkan makanan, porsi, dan resep ke jenis burung.

## 2. Buat Project Supabase

1. Masuk ke Supabase dan buat project baru.
2. Tunggu database selesai dibuat.
3. Buka **SQL Editor**.

## 3. Cara Paling Cepat: Setup Sekali Jalan

Buka file berikut:

```text
supabase/full_setup.sql
```

Salin seluruh isinya ke SQL Editor, lalu tekan **Run**. File ini sekaligus membuat struktur database dan memasukkan seluruh data awal website.

Untuk workflow migration yang lebih rapi, jalankan dua file ini secara berurutan:

```text
supabase/migrations/20260722000000_petbites_schema.sql
supabase/seed.sql
```

Migration akan:

- Membuat seluruh tabel dan relasi.
- Membuat index.
- Mengaktifkan Row Level Security.
- Memberikan akses baca publik kepada website.
- Tidak memberikan akses tulis dari browser.

Dengan konfigurasi ini, pengunjung website hanya dapat membaca data. Penambahan dan perubahan data dilakukan melalui Supabase Dashboard, SQL migration, atau backend aman.

Seed pada `supabase/seed.sql` bersifat idempotent. File dapat dijalankan lagi karena menggunakan `ON CONFLICT ... DO UPDATE`.

## 4. Hubungkan Website ke Supabase

Di Supabase Dashboard, buka panel **Connect** dan salin:

- Project URL.
- Publishable key.

Buat file `.env.local` di root project:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=PASTE_PUBLISHABLE_KEY
```

Jangan menggunakan `service_role` key di frontend. Publishable key memang dipakai oleh browser dan keamanannya dibatasi oleh RLS.

## 5. Install dan Jalankan

```bash
npm install
npm run dev
```

Website akan mengambil data melalui file:

```text
src/lib/bird-service.ts
```

Client Supabase berada di:

```text
src/lib/supabase.ts
```

Tidak ada lagi array `birdsData` sebagai sumber konten utama. File `src/lib/birds-data.ts` hanya menyimpan TypeScript interface.

## 6. Verifikasi Database

Jalankan file berikut di SQL Editor:

```text
supabase/verify.sql
```

Hasil awal yang diharapkan:

```text
app_features       4
birds              4
bird_foods         32
toxic_entries      12
portion_rules      36
recipes            8
recipe_ingredients 32
recipe_steps       40
```

## 7. Menambah Jenis Burung Baru

Gunakan file:

```text
supabase/add-bird-template.sql
```

Alur penambahan:

1. Tambahkan satu baris di `birds`.
2. Tambahkan makanan di `bird_foods`.
3. Data Toxic Checker umum otomatis berlaku untuk burung baru.
4. Tambahkan `toxic_entries` dengan `bird_id` tertentu hanya untuk pengecualian khusus.
5. Tambahkan seluruh kombinasi yang dibutuhkan ke `portion_rules`.
6. Tambahkan resep ke `recipes`.
7. Tambahkan bahan dan langkah ke tabel turunannya.

Setelah query dijalankan dan halaman direfresh, kartu burung baru akan muncul otomatis. Tidak perlu menambah objek baru ke kode React.

## 8. Mengubah Data Lewat Table Editor

### Mengubah profil burung

Buka `Table Editor > birds`, lalu ubah:

- `name`
- `scientific_name`
- `description`
- `emoji`
- `image_url`
- `sort_order`
- `is_active`

### Menambah Food Finder

Buka `bird_foods` dan isi:

- `id`: ID unik, contoh `lovebird-bayam`.
- `bird_id`: contoh `lovebird`.
- `name`: nama makanan.
- `category`: `main` atau `extra`.
- `benefits`: array text.
- `note`: catatan pemberian.
- `sort_order`: urutan.

### Menambah Toxic Checker

Buka `toxic_entries`:

- Gunakan `bird_id = NULL` untuk aturan umum seluruh burung.
- Isi `bird_id` untuk aturan khusus satu burung.
- `status` harus `safe`, `caution`, atau `toxic`.

Data khusus burung akan menggantikan data umum apabila nama bahannya sama.

### Menambah aturan porsi

Buka `portion_rules`:

- `size`: `Kecil`, `Standar`, atau `Besar`.
- `condition`: `Harian`, `Mabung`, atau `Ternak`.
- `grams`: jumlah gram.
- `teaspoon`: teks konversi sendok.
- `morning` dan `evening`: jadwal yang ditampilkan.

### Menambah resep

1. Tambahkan header resep di `recipes`.
2. Gunakan `id` resep yang sama di `recipe_ingredients`.
3. Gunakan `id` resep yang sama di `recipe_steps`.
4. Atur urutan menggunakan `sort_order`.

## 9. Data Fitur

Tabel `app_features` mengontrol:

- Label tab.
- Label pendek.
- Deskripsi.
- Urutan tab.
- Status aktif.

Empat ID yang saat ini sudah memiliki komponen React:

```text
food
 toxic
portion
recipe
```

Mengubah label, urutan, deskripsi, atau status aktif cukup dilakukan di database. Menambah jenis fitur kelima membutuhkan komponen React baru karena database hanya menyimpan metadata, bukan logika tampilan fitur.

## 10. Catatan Validasi Konten

Data awal dimigrasikan dari konten website yang sudah ada dan diberi `review_status = needs_review`. Sebelum digunakan sebagai rujukan publik, tinjau kembali:

- Klaim keamanan dan toksisitas.
- Besaran porsi.
- Jadwal pemberian.
- Resep dan frekuensi pemberian.
- Sumber referensi.

Setelah diverifikasi, ubah `review_status` menjadi `reviewed` dan isi `source_urls`.
