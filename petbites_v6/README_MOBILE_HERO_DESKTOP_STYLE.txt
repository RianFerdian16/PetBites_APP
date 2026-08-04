PetBites mobile hero desktop-like refinement

Patch ini membuat hero mobile tetap mirip desktop/laptop:
- ilustrasi tetap di tengah
- chip tetap floating seperti desktop
- seluruh layout diperkecil dan disesuaikan dengan lebar browser HP
- ringan karena hanya ubah CSS

Cara pasang:
1. Extract zip ini.
2. Robocopy ke project:
   robocopy "D:\data C\Download\petbites_mobile_hero_desktop_style" "D:\data C\Download\petbites" /E /R:1 /W:1
3. npm run qa
4. npm run dev
5. hard refresh Ctrl + F5
