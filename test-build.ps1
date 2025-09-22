Write-Host "Testing Craft Web Build Configuration..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Testing admin build..." -ForegroundColor Yellow
Set-Location admin
try {
    $result = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ admin build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ admin build failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "❌ admin build error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing user-site build..." -ForegroundColor Yellow
Set-Location ../user-site
try {
    $result = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ user-site build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ user-site build failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "❌ user-site build error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Build test completed!" -ForegroundColor Green
Set-Location ..
