# Profile Photo Upload Feature

This feature allows users to upload and manage their profile photos with automatic initials fallback.

## Components Created

### 1. Avatar Component (`/components/ui/avatar.tsx`)
- Reusable avatar component with photo and initials fallback
- Multiple sizes: sm, md, lg, xl
- Automatic initials generation from name
- Error handling for failed image loads
- Optional editable state with hover effects

### 2. Profile Photo Upload (`/components/ui/profile-photo-upload.tsx`)
- Complete photo upload interface
- Drag and drop support
- File preview with crop/remove options
- Upload progress indicators
- File validation (image types, size limits)

### 3. User Profile Hook (`/lib/hooks/use-user-profile.ts`)
- Manages user profile data from Supabase
- Handles profile updates and avatar uploads
- Provides initials generation utility
- Error handling and loading states

## Database Setup

### 1. Run Migration
```sql
-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### 2. Create Storage Bucket
```sql
-- Create user-uploads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;
```

### 3. Set Storage Policies
Run the policies from `/database/storage/user-uploads-bucket.sql`

## Usage

### In Profile Page
```tsx
import { ProfilePhotoUpload } from "@/components/ui/profile-photo-upload"
import { useUserProfile } from "@/lib/hooks/use-user-profile"

const { profile, uploadAvatar } = useUserProfile()

<ProfilePhotoUpload
  currentPhoto={profile?.avatar_url}
  currentName={profile?.full_name}
  onSave={uploadAvatar}
/>
```

### In Header/Avatar Display
```tsx
import { Avatar } from "@/components/ui/avatar"

<Avatar
  src={profile?.avatar_url}
  fallback={profile?.full_name}
  size="md"
/>
```

## Features

✅ **Automatic Initials**: Shows user initials when no photo is uploaded  
✅ **Drag & Drop**: Easy photo upload with drag and drop interface  
✅ **File Validation**: Validates image types and sizes  
✅ **Preview**: Shows photo preview before saving  
✅ **Error Handling**: Graceful fallback when images fail to load  
✅ **Responsive**: Works on all screen sizes  
✅ **Storage Integration**: Uses Supabase storage for file uploads  
✅ **Profile Integration**: Updates user profile with photo URL  

## File Structure
```
admin/
├── components/ui/
│   ├── avatar.tsx
│   └── profile-photo-upload.tsx
├── lib/hooks/
│   └── use-user-profile.ts
├── database/
│   ├── migrations/
│   │   └── add_avatar_to_profiles.sql
│   └── storage/
│       └── user-uploads-bucket.sql
└── PROFILE_PHOTOS.md
```

## Next Steps

1. Run the database migrations
2. Set up Supabase storage bucket
3. Test photo upload functionality
4. Customize avatar styling if needed
5. Add photo cropping functionality (optional)
