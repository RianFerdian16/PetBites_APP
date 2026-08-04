PetBites final mobile hero layout

Perubahan:
- label tidak lagi mengambang dan tidak bisa keluar layar
- dua label menjadi dua chip kecil rapi di bawah ilustrasi
- ilustrasi burung diperkecil dan area visual dipadatkan
- layar sangat kecil otomatis menumpuk chip menjadi satu kolom
- hanya CSS + struktur ringan, tanpa aset atau animasi berat tambahan

Cara pasang:
1. Extract ZIP ini.
2. Robocopy ke project:
   robocopy "D:\data C\Download\petbites_mobile_hero_final" "D:\data C\Download\petbites" /E /R:1 /W:1
3. Jalankan npm run qa
4. Jalankan npm run dev
5. Hard refresh browser dengan Ctrl + F5
