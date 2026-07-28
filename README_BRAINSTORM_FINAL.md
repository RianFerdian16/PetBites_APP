# PetBites — CMS Private + AI Assistant + Request Burung

Paket ini dibuat dari project `petbites(6).zip` dan mempertahankan tampilan publik, welcome screen, mobile optimization, mode gelap, terjemahan ID/EN, serta data Supabase yang sudah ada.

## Hasil revisi

### Publik

- Website utama PetBites tetap seperti sebelumnya.
- Bagian paling bawah homepage memiliki form **Request Burung Baru**.
- Pengunjung hanya dapat mengirim request.
- Pengunjung tidak dapat melihat request orang lain, mengubah status, atau membuka data kontak.

### Private admin

- CMS tersedia di `/admin`.
- Login memakai Supabase Auth.
- Hanya akun yang terdaftar di `admin_users` yang dapat masuk.
- Role tersedia: `owner`, `editor`, dan `reviewer`.
- Admin dapat mengelola burung, pakan, Toxic Checker, porsi, resep, gambar, dan request pengguna.
- Tombol **Buat draft profil burung** mengubah request terpilih menjadi draft awal di menu Burung.

### AI Assistant

- AI berada di CMS private, bukan di website publik.
- AI membantu membuat draft, memperbaiki isi, menerjemahkan, dan mereview.
- AI tidak melakukan publish otomatis.
- AI bersifat opsional. CMS dan form request tetap berfungsi tanpa API key AI.

### Database

Supabase tetap dipakai sebagai database, autentikasi admin, storage gambar, RLS, RPC request publik, dan Edge Function AI.

---

# Cara memasang ke project lama

## 1. Backup project

Project lokal utama:

```text
D:\data C\Download\petbites
```

Hentikan server dengan `Ctrl + C`.

## 2. Extract ZIP patch

Extract paket patch ke:

```text
D:\data C\Download\petbites_brainstorm_final_patch
```

Pastikan folder tersebut langsung berisi `src`, `supabase`, dan file README ini.

## 3. Timpa source project

```powershell
robocopy "D:\data C\Download\petbites_brainstorm_final_patch" "D:\data C\Download\petbites" /E /R:1 /W:1
```

Robocopy ini tidak menghapus `.env.local`, `.git`, atau `node_modules` yang sudah ada di project utama.

## 4. Jalankan migration Supabase

Buka:

```text
Supabase Dashboard → SQL Editor → New query
```

Copy seluruh isi file:

```text
supabase/cms_ai_request_setup.sql
```

Paste ke SQL Editor lalu tekan **Run**.

Migration ini:

- tidak menghapus data burung lama;
- membuat CMS roles;
- menambahkan workflow draft/review/published;
- membuat tabel private `bird_requests`;
- membuat RPC publik `submit_bird_request`;
- mengatur RLS;
- membuat bucket `bird-media` untuk upload admin.

## 5. Buat akun admin

Di Supabase:

```text
Authentication → Users → Add user
```

Buat email dan password admin, lalu aktifkan/konfirmasi akun tersebut.

## 6. Jadikan akun sebagai owner

Buka file:

```text
supabase/bootstrap_admin.sql
```

Ganti `EMAIL_ADMIN_KAMU`, lalu jalankan query tersebut di SQL Editor.

## 7. Jalankan pengecekan project

```powershell
cd "D:\data C\Download\petbites"
npm run qa
```

Apabila muncul masalah native binding setelah project dipindahkan:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
npm run qa
```

Jangan hapus `package-lock.json`.

## 8. Jalankan localhost

```powershell
npm run dev
```

Buka website publik:

```text
http://localhost:8080/
```

Buka CMS private:

```text
http://localhost:8080/admin
```

## 9. Tes form request

1. Scroll ke paling bawah homepage.
2. Isi form Request Burung Baru.
3. Kirim request.
4. Login ke `/admin`.
5. Buka menu **Request pengguna**.
6. Pastikan request terlihat.
7. Ubah status menjadi `reviewing` lalu simpan.
8. Tekan **Buat draft profil burung** untuk membuat draft awal.

## 10. Aktifkan AI — opsional

CMS dapat dipakai tanpa langkah ini.

Login dan link Supabase CLI:

```powershell
npx supabase login
npx supabase projects list
npx supabase link --project-ref PROJECT_REF_KAMU
```

Simpan API key hanya sebagai Edge Function secret:

```powershell
npx supabase secrets set OPENAI_API_KEY="API_KEY_KAMU"
```

Model dapat diatur secara opsional:

```powershell
npx supabase secrets set OPENAI_MODEL="MODEL_YANG_KAMU_PAKAI"
```

Deploy function:

```powershell
npx supabase functions deploy petbites-ai
```

Jangan menaruh API key AI di `.env.local`, source React, GitHub, atau environment frontend Vercel.

## 11. Push dan deploy

```powershell
git add -A
git status --short
git commit -m "Add private CMS AI assistant and bird requests"
git push
```

Vercel akan mendeploy frontend. Edge Function AI tetap dideploy melalui Supabase CLI.

---

# Alur akhir

```text
Pengunjung
→ website publik
→ melihat konten published
→ mengirim request burung

Admin
→ login /admin
→ melihat request private
→ meminta bantuan AI bila diperlukan
→ membuat draft
→ review
→ publish

Supabase
→ menyimpan seluruh data
→ melindungi akses dengan Auth + RLS
```
