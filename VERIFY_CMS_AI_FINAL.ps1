$ErrorActionPreference = "Stop"

Write-Host "[1/4] Prettier" -ForegroundColor Cyan
npx prettier --write "src/features/admin/admin-app.tsx" "src/lib/admin-service.ts" "src/styles.css" "supabase/functions/petbites-ai/index.ts"

Write-Host "[2/4] TypeScript" -ForegroundColor Cyan
npm run typecheck

Write-Host "[3/4] ESLint" -ForegroundColor Cyan
npm run lint

Write-Host "[4/4] Build" -ForegroundColor Cyan
npm run build

Write-Host "PetBites CMS + AI checks passed." -ForegroundColor Green
