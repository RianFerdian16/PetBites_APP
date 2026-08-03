# PetBites

PetBites adalah web app panduan nutrisi burung dengan dashboard pengguna, CMS admin privat, Supabase, formulir request burung, dan AI assistant opsional melalui Supabase Edge Function.

## Menjalankan project

```bash
cp .env.example .env.local
npm install
npm run dev
```

Isi `.env.local` dengan URL dan publishable key milik project Supabase. Jangan menaruh `service_role`, Gemini API key, atau secret lain di variabel `VITE_*`.

## Setup database dan CMS

Ikuti [SUPABASE_SETUP.md](./SUPABASE_SETUP.md). Untuk instalasi baru, urutannya adalah:

1. `supabase/full_setup.sql`
2. `supabase/cms_ai_request_setup.sql`
3. Buat user di Supabase Authentication
4. Ubah email pada `supabase/bootstrap_admin.sql`, lalu jalankan file tersebut

AI assistant bersifat opsional. Petunjuk deploy ada di [README_GEMINI_AI_SETUP.md](./README_GEMINI_AI_SETUP.md).

## Quality check

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Hasil audit terbaru dan batas pengujiannya tercatat di [QA_AUDIT_2026-08-03.md](./QA_AUDIT_2026-08-03.md).

Dashboard publik hanya meminta burung aktif dan konten berstatus `published`. Dashboard admin membaca seluruh status sesuai role yang tersimpan di `admin_users`.

## Keamanan

- `.env.local` dan secret tidak boleh masuk ZIP publik atau Git.
- Frontend hanya memakai Supabase publishable key; pembatasan akses dilakukan dengan RLS.
- AI key disimpan sebagai secret Supabase Edge Function, bukan di browser.
- Konten hasil AI tidak dipublish otomatis dan tetap perlu review manusia.
