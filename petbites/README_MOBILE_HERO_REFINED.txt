PetBites refined mobile hero layout

Patch ini merapikan hero illustration di smartphone:
- ilustrasi burung diperkecil
- tinggi area hero visual dipendekkan
- chip note atas/bawah jadi kecil dan rapi
- posisi chip dibuat sudut kanan atas dan kiri bawah
- tetap ringan untuk render di HP

Cara pasang:
1. Extract zip ini.
2. Robocopy ke project:
   robocopy "D:\data C\Download\petbites_mobile_hero_refined" "D:\data C\Download\petbites" /E /R:1 /W:1
3. npm run qa
4. npm run dev
5. hard refresh Ctrl + F5
