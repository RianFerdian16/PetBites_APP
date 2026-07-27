PetBites final balanced hero layout

Perubahan:
- tampilan hero desktop dikembalikan proporsional
- ilustrasi tidak miring dan tidak mojok
- tablet dan mobile memakai skala yang konsisten
- chip tetap floating seperti desktop tetapi tidak keluar layar
- hanya CSS + komponen hero, tanpa aset tambahan berat

Cara pasang:
1. Extract ZIP ini.
2. Robocopy:
   robocopy "D:\data C\Download\petbites_balanced_hero_final" "D:\data C\Download\petbites" /E /R:1 /W:1
3. npm run qa
4. npm run dev
5. hard refresh Ctrl + F5
