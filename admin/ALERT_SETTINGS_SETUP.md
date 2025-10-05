# Stock Alert Settings Setup Guide

## 🚨 **Database Setup Required**

The stock alert settings feature is now fully implemented with a professional, responsive design, but you need to run a database migration to create the `inventory_alert_settings` table.

### **Step 1: Run Database Migration**

1. **Open your Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the following script:**

```sql
-- Simple setup script for stock alert settings
-- Run this in your Supabase SQL Editor to add alert settings functionality

-- Create the inventory_alert_settings table
CREATE TABLE IF NOT EXISTS inventory_alert_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Global thresholds (percentage of max stock level)
    low_stock_threshold INTEGER DEFAULT 20 NOT NULL CHECK (low_stock_threshold >= 0 AND low_stock_threshold <= 100),
    critical_stock_threshold INTEGER DEFAULT 5 NOT NULL CHECK (critical_stock_threshold >= 0 AND critical_stock_threshold <= 100),
    
    -- Notification settings
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    dashboard_notifications BOOLEAN DEFAULT true NOT NULL,
    notification_frequency TEXT DEFAULT 'immediate' NOT NULL CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
    
    -- Email recipients (stored as JSON array)
    email_recipients JSONB DEFAULT '[]' NOT NULL,
    
    -- Auto-reorder settings
    auto_reorder_enabled BOOLEAN DEFAULT false NOT NULL,
    reorder_buffer_percentage INTEGER DEFAULT 10 NOT NULL CHECK (reorder_buffer_percentage >= 0 AND reorder_buffer_percentage <= 100),
    
    -- Category-specific thresholds (stored as JSON object)
    category_specific_thresholds JSONB DEFAULT '{}' NOT NULL,
    
    -- Product-specific thresholds (stored as JSON object)
    product_specific_thresholds JSONB DEFAULT '{}' NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_updated_at ON inventory_alert_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_updated_by ON inventory_alert_settings(updated_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_inventory_alert_settings_updated_at ON inventory_alert_settings;
CREATE TRIGGER trigger_update_inventory_alert_settings_updated_at
    BEFORE UPDATE ON inventory_alert_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_alert_settings_updated_at();

-- Insert default settings if none exist
INSERT INTO inventory_alert_settings (
    low_stock_threshold,
    critical_stock_threshold,
    email_notifications,
    dashboard_notifications,
    notification_frequency,
    email_recipients,
    auto_reorder_enabled,
    reorder_buffer_percentage,
    category_specific_thresholds,
    product_specific_thresholds
) VALUES (
    20,  -- low_stock_threshold
    5,   -- critical_stock_threshold
    true,  -- email_notifications
    true,  -- dashboard_notifications
    'immediate',  -- notification_frequency
    '[]',  -- email_recipients
    false,  -- auto_reorder_enabled
    10,   -- reorder_buffer_percentage
    '{}',  -- category_specific_thresholds
    '{}'   -- product_specific_thresholds
) ON CONFLICT DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view alert settings" ON inventory_alert_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update alert settings" ON inventory_alert_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert alert settings" ON inventory_alert_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

4. **Click "Run" to execute the script**

### **Step 2: Verify Setup**

After running the script, you should see:
- ✅ Table `inventory_alert_settings` created
- ✅ Default settings inserted
- ✅ RLS policies applied

### **Step 3: Test the Feature**

1. **Go to Inventory page** in your admin dashboard
2. **Click "Stock Settings"** in the Quick Actions section
3. **Configure your alert settings**:
   - Set global thresholds
   - Configure notifications
   - Add email recipients
   - Set category-specific thresholds
4. **Save your settings**

## 🎨 **New Features**

### **Professional Design**
- ✅ Modern, responsive modal interface
- ✅ Gradient backgrounds and smooth animations
- ✅ Professional color scheme and typography
- ✅ Mobile-optimized layout

### **Enhanced UX**
- ✅ Real-time statistics overview
- ✅ Visual feedback for all interactions
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback

### **Comprehensive Settings**
- ✅ Global alert thresholds
- ✅ Notification preferences (dashboard, email, auto-reorder)
- ✅ Email recipient management
- ✅ Category-specific threshold overrides
- ✅ Professional form validation

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Adaptive layouts for all screen sizes
- ✅ Touch-friendly controls
- ✅ Optimized for tablets and desktops

## 🔧 **Technical Features**

- **Database**: PostgreSQL with JSONB for flexible settings
- **Security**: Row Level Security (RLS) policies
- **Performance**: Indexed columns and optimized queries
- **Validation**: Comprehensive input validation and constraints
- **Audit**: Automatic timestamp tracking and user attribution

The stock alert settings feature is now fully functional with a professional, responsive design! 🚀
