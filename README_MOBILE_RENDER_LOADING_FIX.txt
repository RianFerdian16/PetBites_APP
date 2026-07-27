PetBites mobile rendering + loading/welcome fix

Patch ini hanya mengubah src/styles.css.

Yang diperbaiki:
- burung di welcome screen tidak terpotong
- logo burung di loading screen tidak terpotong
- loading mobile menampilkan dua skeleton saja agar lebih ringan
- blur berat dan animasi dekoratif non-penting dimatikan khusus mobile
- tampilan desktop/laptop dan layout homepage tidak diubah

Cara pasang:
1. Extract ZIP ini ke D:\data C\Download\petbites_mobile_render_fix
2. Matikan npm run dev dengan Ctrl + C
3. Jalankan:
   robocopy "D:\data C\Download\petbites_mobile_render_fix" "D:\data C\Download\petbites" /E /R:1 /W:1
4. Jalankan npm run qa
5. Jalankan npm run dev dan hard refresh Ctrl + F5
