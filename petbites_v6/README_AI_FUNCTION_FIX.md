# PetBites AI Function Fix

Patch ini memperbaiki error generik `Edge Function returned a non-2xx status code`.

Perubahan:

- menonaktifkan legacy gateway JWT verification untuk `petbites-ai`;
- autentikasi tetap private karena function memverifikasi session JWT melalui `auth.getUser()`;
- function tetap mengecek akun pada tabel `admin_users`;
- frontend sekarang menampilkan pesan error asli dari Gemini/Supabase;
- mendukung environment key Supabase versi legacy dan publishable key baru.

Setelah robocopy, jalankan:

```powershell
npm run qa
git add -A
git commit -m "Fix Gemini AI Edge Function authentication"
git push
npx supabase@latest functions deploy petbites-ai --no-verify-jwt
```

Setelah deployment selesai, logout lalu login kembali ke `/admin`, hard refresh, dan tes AI lagi.
