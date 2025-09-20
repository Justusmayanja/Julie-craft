-- ============================================================================
-- CLEANUP EXISTING POLICIES - Run this first to avoid policy conflicts
-- ============================================================================
-- Run this script before running the main database setup script
-- This will clean up any existing policies that might cause conflicts
-- ============================================================================

-- Drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_select_admin" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
DROP POLICY IF EXISTS "order_items_update_own" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;

-- Drop policies for tables that might not exist yet (these will just be ignored)
DO $$ 
BEGIN
    -- Try to drop policies for tables that might exist
    BEGIN
        DROP POLICY IF EXISTS "pages_select_published" ON pages;
        DROP POLICY IF EXISTS "pages_select_admin" ON pages;
        DROP POLICY IF EXISTS "pages_insert_admin" ON pages;
        DROP POLICY IF EXISTS "pages_update_admin" ON pages;
        DROP POLICY IF EXISTS "pages_delete_admin" ON pages;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "blog_posts_select_published" ON blog_posts;
        DROP POLICY IF EXISTS "blog_posts_select_admin" ON blog_posts;
        DROP POLICY IF EXISTS "blog_posts_insert_admin" ON blog_posts;
        DROP POLICY IF EXISTS "blog_posts_update_admin" ON blog_posts;
        DROP POLICY IF EXISTS "blog_posts_delete_admin" ON blog_posts;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "media_select_public" ON media;
        DROP POLICY IF EXISTS "media_select_admin" ON media;
        DROP POLICY IF EXISTS "media_insert_admin" ON media;
        DROP POLICY IF EXISTS "media_update_admin" ON media;
        DROP POLICY IF EXISTS "media_delete_admin" ON media;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "wishlists_select_own" ON wishlists;
        DROP POLICY IF EXISTS "wishlists_insert_own" ON wishlists;
        DROP POLICY IF EXISTS "wishlists_delete_own" ON wishlists;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "product_reviews_select_approved" ON product_reviews;
        DROP POLICY IF EXISTS "product_reviews_select_admin" ON product_reviews;
        DROP POLICY IF EXISTS "product_reviews_insert_own" ON product_reviews;
        DROP POLICY IF EXISTS "product_reviews_update_admin" ON product_reviews;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "analytics_events_insert_authenticated" ON analytics_events;
        DROP POLICY IF EXISTS "analytics_events_select_admin" ON analytics_events;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "product_views_insert_authenticated" ON product_views;
        DROP POLICY IF EXISTS "product_views_select_admin" ON product_views;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "coupons_select_active" ON coupons;
        DROP POLICY IF EXISTS "coupons_select_admin" ON coupons;
        DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
        DROP POLICY IF EXISTS "coupons_update_admin" ON coupons;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "newsletter_subscribers_insert_public" ON newsletter_subscribers;
        DROP POLICY IF EXISTS "newsletter_subscribers_select_admin" ON newsletter_subscribers;
        DROP POLICY IF EXISTS "newsletter_subscribers_update_admin" ON newsletter_subscribers;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "stock_movements_select_admin" ON stock_movements;
        DROP POLICY IF EXISTS "stock_movements_insert_admin" ON stock_movements;
    EXCEPTION
        WHEN undefined_table THEN NULL;
    END;
END $$;

-- Also drop any triggers that might exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
DROP TRIGGER IF EXISTS update_stock_on_order_trigger ON order_items;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.update_stock_on_order() CASCADE;

-- Drop sequence if it exists
DROP SEQUENCE IF EXISTS order_number_seq;

SELECT 'Policy cleanup completed successfully!' as status;
