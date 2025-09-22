@echo off
echo Testing Craft Web Configuration...
echo ==================================

echo.
echo 1. Testing admin TypeScript configuration...
cd admin
npx tsc --noEmit --skipLibCheck
if %errorlevel% equ 0 (
    echo ✅ admin TypeScript config is valid
) else (
    echo ❌ admin TypeScript config has issues
)

echo.
echo 2. Testing user-site TypeScript configuration...
cd ../user-site
npx tsc --noEmit --skipLibCheck
if %errorlevel% equ 0 (
    echo ✅ user-site TypeScript config is valid
) else (
    echo ❌ user-site TypeScript config has issues
)

echo.
echo 3. Testing shared configurations...
cd ..
if exist "tsconfig.base.json" (
    echo ✅ Base TypeScript config exists
) else (
    echo ❌ Base TypeScript config missing
)

if exist "eslint.config.base.js" (
    echo ✅ Base ESLint config exists
) else (
    echo ❌ Base ESLint config missing
)

if exist "tailwind.config.base.js" (
    echo ✅ Base Tailwind config exists
) else (
    echo ❌ Base Tailwind config missing
)

echo.
echo Configuration test completed!
pause
