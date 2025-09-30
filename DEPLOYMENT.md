# Vercel Deployment Guide

## For Admin Project Deployment

### Option 1: Deploy Admin Project Only (Recommended)
1. Go to Vercel Dashboard
2. Create a new project
3. Connect your GitHub repository
4. Set the **Root Directory** to `admin`
5. Deploy

### Option 2: Use Current Configuration
The `vercel.json` file is configured to deploy the admin project. Just push your changes and redeploy.

## Files Added/Fixed

### ✅ Fixed Issues:
1. **Added `not-found.tsx`** - Required by Next.js App Router
2. **Created `vercel.json`** - Proper Vercel configuration
3. **Added root `package.json`** - Monorepo structure support

### 📁 New Files:
- `vercel.json` - Vercel deployment configuration
- `package.json` - Root package.json for monorepo
- `admin/src/app/not-found.tsx` - 404 error page

## Next Steps:
1. Commit and push these changes
2. Redeploy on Vercel
3. The admin project should deploy successfully

## Alternative: Separate Repositories
If you continue having issues, consider:
1. Creating separate repositories for admin and user-site
2. Deploying each project independently
3. Using Vercel's monorepo features properly
