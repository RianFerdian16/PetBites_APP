$ErrorActionPreference = "Stop"

$requiredFiles = @(
  "src/routes/admin.tsx",
  "src/features/admin/admin-app.tsx",
  "src/features/petbites/bird-request-form.tsx",
  "src/lib/admin-service.ts",
  "src/lib/request-service.ts",
  "supabase/cms_ai_request_setup.sql",
  "supabase/functions/petbites-ai/index.ts"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "File belum ada: $file"
  }
}

if (-not (Test-Path ".env.local")) {
  Write-Warning ".env.local tidak ditemukan. Buat dari .env.example dan isi Supabase URL + publishable key."
}

Write-Host "Semua file CMS/request ditemukan." -ForegroundColor Green

npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "QA PetBites selesai." -ForegroundColor Green
