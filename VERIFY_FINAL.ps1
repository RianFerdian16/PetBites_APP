$ErrorActionPreference = "Stop"

$requiredFiles = @(
  "public/theme/forest-day.webp",
  "public/theme/forest-night.webp",
  "public/welcome/flying-bird.webp",
  "public/welcome/flying-bird-wing.webp"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "File wajib tidak ditemukan: $file"
  }
}

Write-Host "[1/4] TypeScript check" -ForegroundColor Cyan
npm run typecheck

Write-Host "[2/4] ESLint" -ForegroundColor Cyan
npm run lint

Write-Host "[3/4] Production build" -ForegroundColor Cyan
npm run build

Write-Host "[4/4] Git asset check" -ForegroundColor Cyan
git status --short

Write-Host "Semua pemeriksaan selesai. Gunakan git add -A agar src dan public ikut ter-deploy." -ForegroundColor Green
