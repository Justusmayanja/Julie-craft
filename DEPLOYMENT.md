# Vercel Deployment Guide

## 🚀 Monorepo Deployment - Correct Approach

This guide shows you how to properly deploy your monorepo projects on Vercel by selecting the specific project in the Vercel dashboard.

## 📋 Two Deployment Options

### Option 1: Deploy Individual Projects (Recommended)

Create **separate Vercel projects** for each application:

#### For Admin Project:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Set Root Directory to**: `admin`
5. Click **"Deploy"**

#### For User-Site Project:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Set Root Directory to**: `user-site`
5. Click **"Deploy"**

### Option 2: Single Project with Subdirectory Selection

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Set Root Directory to**: `admin` OR `user-site` (choose one)
5. Click **"Deploy"**

## 🛠️ Project Configuration

Each project has its own `vercel.json` configuration:

### Admin Project (`admin/vercel.json`):
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### User-Site Project (`user-site/vercel.json`):
```json
{
  "version": 2,
  "framework": "nextjs", 
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

## 🚀 Deployment Steps

### For Admin Project:
1. **In Vercel Dashboard**:
   - Root Directory: `admin`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy admin project"
   git push
   ```

### For User-Site Project:
1. **In Vercel Dashboard**:
   - Root Directory: `user-site`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy user-site project"
   git push
   ```

## 📊 Available Scripts

```bash
# Development
npm run dev:user-site     # Run user-site locally
npm run dev:admin         # Run admin locally

# Building
npm run build:all         # Build both projects
npm run build:user-site   # Build user-site only
npm run build:admin       # Build admin only

# Installation
npm run install:all       # Install dependencies for both
npm run install:admin     # Install admin dependencies
npm run install:user-site # Install user-site dependencies
```

## ✅ Benefits of This Approach

- **Clear separation**: Each project has its own deployment
- **Independent scaling**: Scale each app separately
- **Easy management**: Manage each project independently
- **No routing conflicts**: Each app has its own domain/subdomain
- **Vercel best practices**: Follows Vercel's recommended monorepo approach

## 🔍 Troubleshooting

### If deployment fails:
1. **Check Root Directory**: Ensure it's set correctly in Vercel dashboard
2. **Verify Build**: Test locally first:
   ```bash
   cd admin && npm run build
   cd ../user-site && npm run build
   ```
3. **Check Dependencies**: Ensure all dependencies are installed
4. **Review Build Logs**: Check Vercel build logs for specific errors

### Common Issues:
- **Wrong Root Directory**: Make sure it matches your project folder name
- **Missing Dependencies**: Run `npm install` in the project directory
- **Build Errors**: Check for TypeScript or linting errors
- **Environment Variables**: Set up required env vars in Vercel dashboard

## 🌐 Final Result

After deployment, you'll have:
- **Admin Project**: `your-admin-project.vercel.app`
- **User-Site Project**: `your-user-site.vercel.app`

Or if using custom domains:
- **Admin**: `admin.yourdomain.com`
- **User-Site**: `yourdomain.com`
