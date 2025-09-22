#!/bin/bash

echo "Testing Craft Web Monorepo Configuration..."
echo "=========================================="

echo "1. Testing user-site TypeScript configuration..."
cd user-site
if npx tsc --noEmit; then
    echo "✅ user-site TypeScript config is valid"
else
    echo "❌ user-site TypeScript config has issues"
fi

echo ""
echo "2. Testing admin TypeScript configuration..."
cd ../admin
if npx tsc --noEmit; then
    echo "✅ admin TypeScript config is valid"
else
    echo "❌ admin TypeScript config has issues"
fi

echo ""
echo "3. Testing shared configurations..."
cd ..
if [ -f "tsconfig.base.json" ]; then
    echo "✅ Base TypeScript config exists"
else
    echo "❌ Base TypeScript config missing"
fi

if [ -f "eslint.config.base.js" ]; then
    echo "✅ Base ESLint config exists"
else
    echo "❌ Base ESLint config missing"
fi

if [ -f "tailwind.config.base.js" ]; then
    echo "✅ Base Tailwind config exists"
else
    echo "❌ Base Tailwind config missing"
fi

echo ""
echo "Configuration test completed!"
