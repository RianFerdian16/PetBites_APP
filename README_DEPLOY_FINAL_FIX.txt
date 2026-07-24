PetBites — Final Welcome Bird + VS Code Fix

Perubahan:
- Objek burung pada welcome screen diperkecil secara responsif.
- Animasi tetap memakai transform agar ringan.
- Welcome key dinaikkan ke v7 agar hasil baru tampil sekali setelah deploy.
- VS Code menggunakan TypeScript milik project.
- False warning Tailwind CSS v4 seperti @theme/@source tidak lagi memenuhi Problems panel.
- Aset forest dan welcome ikut disertakan agar tidak hilang di Vercel.

Pemasangan:
1. Hentikan npm run dev dengan Ctrl+C.
2. Robocopy patch ke folder project.
3. Jalankan npm run typecheck.
4. Jalankan npm run lint.
5. Jalankan npm run build.
6. Jalankan npm run dev dan periksa localhost.
7. Commit SEMUA perubahan dengan git add -A, bukan hanya git add src.

Deploy:
git add -A
git status --short
git commit -m "Fix welcome bird size and editor diagnostics"
git push

Verifikasi aset Vercel:
/theme/forest-day.webp
/theme/forest-night.webp
/welcome/flying-bird.webp
/welcome/flying-bird-wing.webp
