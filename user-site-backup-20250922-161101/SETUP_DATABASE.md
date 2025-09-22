# Database Setup Guide for Craft Web

This guide will help you configure your Supabase database for the craft web project.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name and password
3. Select a region close to your users
4. Wait for the project to be created

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: Your public API key
   - **Service Role Key**: Your service role key (keep this secure!)

## Step 3: Create Environment Variables

Create a `.env.local` file in the `user-site` directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Run Database Scripts

Execute the following scripts in your Supabase SQL Editor (in order):

1. **001_create_database_schema.sql** - Creates all tables and security policies
2. **002_seed_sample_data.sql** - Adds sample categories and products
3. **003_create_profile_trigger.sql** - Sets up automatic profile creation

## Step 5: Configure Storage (Optional)

If you want to upload product images:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `product-images`
3. Set it to public if you want images to be publicly accessible

## Step 6: Test Your Setup

Run your Next.js application:

```bash
npm run dev
```

Visit the admin panel and try creating categories and products to verify everything works.

## Troubleshooting

- Make sure your `.env.local` file is in the `user-site` directory
- Verify your Supabase project URL and keys are correct
- Check that all database scripts ran without errors
- Ensure Row Level Security policies are properly configured
