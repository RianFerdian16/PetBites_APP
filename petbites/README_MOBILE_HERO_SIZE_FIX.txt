PetBites Mobile Hero Illustration Size Fix

Perubahan:
- ilustrasi burung utama pada hero diperkecil khusus smartphone
- tinggi area ilustrasi dipendekkan agar tidak memenuhi layar
- dua label Data terstruktur dan Praktis dipakai ikut diperkecil dan diposisikan ulang
- desktop dan tablet tidak diubah
- fitur translate, dark mode, welcome animation, Supabase, dan aset lain tidak diubah

Cara pasang:
1. Extract ZIP ini ke:
   D:\data C\Download\petbites_mobile_hero_fix
2. Jalankan:
   robocopy "D:\data C\Download\petbites_mobile_hero_fix" "D:\data C\Download\petbites" /E /R:1 /W:1
3. Jalankan npm run qa
4. Jalankan npm run dev lalu hard refresh Ctrl + F5
5. Push menggunakan git add -A
