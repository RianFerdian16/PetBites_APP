PetBites smoother welcome bird update

Isi patch:
- src/styles.css
- src/features/petbites/illustrations.tsx
- src/features/petbites/welcome-screen.tsx

Perubahan:
- animasi burung lewat dibuat lebih smooth
- efek angin / trail di belakang burung ditambah lagi
- ukuran burung tetap lebih kecil
- session key welcome diubah agar welcome screen muncul lagi sekali setelah update

Cara pakai:
1. Extract zip ini.
2. Robocopy ke project lama:
   robocopy "D:\data C\Download\petbites_smoother_welcome_bird" "D:\data C\Download\petbites" /E /R:1 /W:1
3. npm run dev
4. hard refresh Ctrl + F5
