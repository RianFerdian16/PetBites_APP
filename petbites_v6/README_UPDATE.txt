PETBITES — WELCOME BIRD UPDATE

Isi update:
- Mengganti flying bird berbentuk shape dengan gambar burung transparan.
- Sayap dibuat sebagai layer terpisah dan dianimasikan dengan CSS transform.
- Asset WebP total kurang lebih 49 KB.
- Tidak memakai GIF, video, canvas, atau JavaScript interval.
- Mendukung prefers-reduced-motion.

Cara copy ke project:
1. Extract ZIP ini ke:
   D:\data C\Download\petbites_welcome_update

2. Buka terminal PowerShell di VS Code, lalu jalankan:
   robocopy "D:\data C\Download\petbites_welcome_update" "D:\data C\Download\petbites" /E

3. Masuk ke project:
   cd "D:\data C\Download\petbites"

4. Jalankan:
   npm run dev

5. Buka:
   http://localhost:8080/

6. Untuk menampilkan welcome screen lagi setelah pernah dibuka:
   buka Console browser dengan Ctrl + Shift + J, lalu jalankan:
   sessionStorage.removeItem("petbites:welcome-seen:v2"); location.reload();

7. Setelah cocok:
   git add src/features/petbites/illustrations.tsx src/features/petbites/welcome-screen.tsx src/styles.css public/welcome
   git commit -m "Update welcome flying bird animation"
   git push
