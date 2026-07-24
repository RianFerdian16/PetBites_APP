PetBites Forest + Translate Fix

Patch ini menggabungkan:
- fitur translate EN/ID di kanan atas
- background hutan yang lebih kelihatan
- welcome screen yang sinkron
- dark mode dan light mode yang disesuaikan

Cara pasang:
1. Extract zip ini.
2. Robocopy ke project lama:
   robocopy "D:\data C\Download\petbites_forest_bilingual_fix" "D:\data C\Download\petbites" /E /R:1 /W:1
3. Jalankan lagi npm run dev.
4. Hard refresh browser: Ctrl + F5.
5. Kalau welcome screen belum muncul, buka Console dan jalankan:
   sessionStorage.removeItem("petbites:welcome-seen:v5-forest-visible-bilingual"); location.reload();
