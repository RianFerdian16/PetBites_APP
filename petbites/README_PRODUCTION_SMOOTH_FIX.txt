PetBites production smooth welcome animation fix

Perbaikan:
- kedua aset burung dipreload
- animasi baru mulai setelah gambar selesai decode
- durasi welcome disinkronkan dengan durasi terbang
- gerak horizontal dan jalur naik-turun dipisah agar stabil 60fps
- drop-shadow/filter bergerak dihapus
- efek angin tetap ada tetapi hanya memakai transform dan opacity

Cara pasang:
1. Extract zip.
2. Robocopy ke project:
   robocopy "D:\data C\Download\petbites_production_smooth_fix" "D:\data C\Download\petbites" /E /R:1 /W:1
3. npm run qa
4. npm run dev
5. git add -A && git commit -m "Fix production welcome animation performance" && git push
