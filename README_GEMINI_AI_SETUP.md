# PetBites — Aktivasi Gemini AI

Integrasi AI CMS sekarang memakai Gemini melalui Supabase Edge Function.
API key tidak disimpan di React, `.env.local`, Vercel frontend, atau GitHub.

## Secret yang dipakai

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (opsional, default: `gemini-2.5-flash`)

## Aktivasi

```powershell
cd "D:\data C\Download\petbites"

npx supabase login
npx supabase projects list
npx supabase link --project-ref PROJECT_REF_KAMU

npx supabase secrets set GEMINI_API_KEY="API_KEY_GEMINI_KAMU"
npx supabase secrets set GEMINI_MODEL="gemini-2.5-flash"
npx supabase secrets list

npx supabase functions deploy petbites-ai
npx supabase functions list
```

## Tes

1. Buka `https://petbites-app.vercel.app/admin`.
2. Login sebagai admin.
3. Pilih salah satu konten.
4. Buka AI Assistant.
5. Pilih `Review` terlebih dahulu.
6. Klik jalankan AI.
7. Periksa hasilnya sebelum menerapkan ke draft.

## Catatan

- CMS tetap berjalan tanpa AI.
- AI hanya dapat dipakai oleh admin yang sudah login dan terdaftar di `admin_users`.
- AI tidak melakukan publish otomatis.
- Kuota Gemini Free terbatas dan dapat berubah.
