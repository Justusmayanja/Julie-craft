# Enhanced Inventory Management System - Database Setup

This directory contains SQL scripts to set up and migrate to the enhanced inventory management system with all the new features.

## 📁 Files Overview

### 1. `enhanced-inventory-schema.sql`
**Complete schema with all features** - Use this for new installations or complete rebuilds.

### 2. `migrate-to-enhanced-inventory.sql`
**Migration script** - Use this to upgrade your existing database safely.

### 3. `setup-enhanced-inventory.sql`
**Quick setup** - Simplified version for new installations.

### 4. `inventory-adjustments.sql`
**Standalone adjustments table** - Just the inventory adjustments functionality.

## 🚀 Quick Start

### For New Installations
```sql
-- Run the quick setup script
\i setup-enhanced-inventory.sql
```

### For Existing Databases
```sql
-- 1. Backup your data first!
pg_dump your_database > backup_before_migration.sql

-- 2. Run the migration script
\i migrate-to-enhanced-inventory.sql
```

### For Complete Rebuild
```sql
-- Run the complete schema (includes everything)
\i enhanced-inventory-schema.sql
```

## 📊 New Features Added

### 🗄️ New Tables

#### `inventory_adjustments`
- Tracks all stock movements
- Includes adjustment type, reason, user, timestamp
- Complete audit trail

#### `locations`
- Physical locations (warehouses, stores, etc.)
- Address and contact information

#### `warehouses`
- Warehouse management
- Capacity tracking
- Location references

#### `suppliers`
- Supplier information
- Contact details
- Payment terms and lead times

#### `inventory_reservations`
- Reserve inventory for orders
- Track reserved quantities
- Expiration dates

### 🔧 Enhanced Products Table

#### New Columns Added:
- `location_id` - Physical location
- `warehouse_id` - Warehouse reference
- `supplier_id` - Supplier reference
- `reserved_quantity` - Reserved stock
- `available_quantity` - Computed available stock
- `weight` - Product weight
- `dimensions` - Product dimensions (JSON)
- `barcode` - Product barcode
- `notes` - Additional notes
- `last_restocked_at` - Last restock date
- `last_sold_at` - Last sale date
- `average_daily_sales` - Sales analytics
- `reorder_quantity` - Suggested reorder amount
- `safety_stock` - Safety stock level
- `abc_classification` - ABC analysis classification
- `total_received` - Total received quantity
- `total_sold` - Total sold quantity
- `total_adjusted` - Total adjusted quantity
- `stock_turnover_rate` - Turnover rate
- `days_in_stock` - Days in inventory

### 📈 New Views

#### `enhanced_inventory_summary`
- Complete inventory overview
- Includes all related data
- Status calculations
- Latest adjustment info

#### `inventory_alerts`
- Stock alerts and warnings
- Low stock notifications
- Out of stock alerts
- Supplier contact info

### ⚙️ New Functions

#### `adjust_inventory()`
```sql
SELECT adjust_inventory(
    'product-uuid',
    'increase',  -- or 'decrease', 'set'
    10,          -- quantity
    'received',  -- reason
    'Notes',     -- optional notes
    'PO-123',    -- optional reference
    'user-uuid', -- optional user ID
    'user@email.com' -- optional user name
);
```

#### `calculate_available_quantity()`
```sql
SELECT calculate_available_quantity('product-uuid');
```

## 🔒 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can access all data
- Proper permissions granted

### Data Validation
- Check constraints on adjustment types
- Check constraints on reasons
- Foreign key relationships
- Data integrity maintained

## 📋 Usage Examples

### 1. View Enhanced Inventory
```sql
-- Get all inventory with enhanced data
SELECT * FROM enhanced_inventory_summary;

-- Get low stock items
SELECT * FROM enhanced_inventory_summary WHERE status = 'low_stock';

-- Get out of stock items
SELECT * FROM inventory_alerts WHERE alert_type = 'out_of_stock';
```

### 2. Adjust Inventory
```sql
-- Increase stock
SELECT adjust_inventory(
    'product-uuid',
    'increase',
    50,
    'received',
    'Stock received from supplier',
    'PO-2024-001'
);

-- Decrease stock
SELECT adjust_inventory(
    'product-uuid',
    'decrease',
    5,
    'sale',
    'Sold to customer',
    'INV-2024-001'
);

-- Set specific quantity
SELECT adjust_inventory(
    'product-uuid',
    'set',
    100,
    'correction',
    'Inventory count correction'
);
```

### 3. View Adjustment History
```sql
-- Get all adjustments for a product
SELECT * FROM inventory_adjustments 
WHERE product_id = 'product-uuid' 
ORDER BY created_at DESC;

-- Get adjustments by reason
SELECT * FROM inventory_adjustments 
WHERE reason = 'received' 
ORDER BY created_at DESC;

-- Get adjustments by user
SELECT * FROM inventory_adjustments 
WHERE user_name = 'admin@example.com' 
ORDER BY created_at DESC;
```

### 4. Manage Locations and Warehouses
```sql
-- Add new location
INSERT INTO locations (name, description, address, city, state, country) 
VALUES ('New Store', 'Retail location', '123 Main St', 'Kampala', 'Central', 'Uganda');

-- Add new warehouse
INSERT INTO warehouses (name, location_id, description, capacity) 
VALUES ('New Warehouse', 'location-uuid', 'Additional storage', 5000);

-- Update product location
UPDATE products 
SET location_id = 'new-location-uuid', warehouse_id = 'new-warehouse-uuid' 
WHERE id = 'product-uuid';
```

### 5. Manage Suppliers
```sql
-- Add new supplier
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, payment_terms, lead_time_days) 
VALUES ('New Supplier', 'Jane Doe', 'jane@supplier.com', '+256-700-000-001', '456 Supplier Ave', 'Jinja', 'Eastern', 'Uganda', 'Net 15', 5);

-- Update product supplier
UPDATE products 
SET supplier_id = 'new-supplier-uuid' 
WHERE id = 'product-uuid';
```

## 🔄 Migration Process

### Before Migration
1. **Backup your database**
   ```bash
   pg_dump your_database > backup_before_migration.sql
   ```

2. **Test on a copy first**
   ```bash
   createdb test_database
   psql test_database < backup_before_migration.sql
   psql test_database < migrate-to-enhanced-inventory.sql
   ```

### During Migration
1. Run the migration script
2. Verify all tables were created
3. Check that existing data is preserved
4. Test the new functionality

### After Migration
1. Update your API endpoints
2. Update your frontend code
3. Test all functionality
4. Train users on new features

## 🐛 Troubleshooting

### Common Issues

#### 1. Foreign Key Constraints
If you get foreign key errors, make sure all referenced tables exist:
```sql
-- Check if categories table exists
SELECT * FROM information_schema.tables WHERE table_name = 'categories';

-- Check if products table exists
SELECT * FROM information_schema.tables WHERE table_name = 'products';
```

#### 2. Permission Errors
If you get permission errors, make sure you're running as a superuser or have the necessary privileges:
```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

#### 3. Column Already Exists
If you get "column already exists" errors, the migration has already been run:
```sql
-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'location_id';
```

### Verification Queries
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('inventory_adjustments', 'locations', 'warehouses', 'suppliers', 'inventory_reservations');

-- Check if new columns were added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('location_id', 'reserved_quantity', 'available_quantity');

-- Check if views exist
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('enhanced_inventory_summary', 'inventory_alerts');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('adjust_inventory', 'calculate_available_quantity');
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your database permissions
3. Ensure all prerequisites are met
4. Test on a copy of your database first

## 🎯 Next Steps

After running the migration:

1. **Update API Endpoints** - Modify your API routes to use the new tables
2. **Update Frontend** - Modify your React components to use the new data structure
3. **Test Functionality** - Verify all features work correctly
4. **Train Users** - Educate users on the new inventory management features
5. **Monitor Performance** - Check that queries perform well with the new structure

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
