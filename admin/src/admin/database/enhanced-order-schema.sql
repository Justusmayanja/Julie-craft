-- =============================================
-- ENHANCED ORDER MANAGEMENT SCHEMA
-- =============================================
-- This schema extends the existing order system with robust business logic
-- and inventory integration for JulieCraft's handmade business

-- =============================================
-- 1. ENHANCED ORDERS TABLE
-- =============================================

-- Add new columns to existing orders table for enhanced functionality
DO $$ 
BEGIN
    -- Add inventory integration columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'inventory_reserved') THEN
        ALTER TABLE orders ADD COLUMN inventory_reserved BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'reserved_at') THEN
        ALTER TABLE orders ADD COLUMN reserved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfilled_at') THEN
        ALTER TABLE orders ADD COLUMN fulfilled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add business logic columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'priority') THEN
        ALTER TABLE orders ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'source') THEN
        ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'web' CHECK (source IN ('web', 'phone', 'email', 'walk_in', 'marketplace', 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'processing_notes') THEN
        ALTER TABLE orders ADD COLUMN processing_notes TEXT;
    END IF;
    
    -- Add fulfillment tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_status') THEN
        ALTER TABLE orders ADD COLUMN fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'shipped', 'delivered'));
    END IF;
    
    -- Add version tracking for optimistic locking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'version') THEN
        ALTER TABLE orders ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- =============================================
-- 2. ORDER_STATUS_HISTORY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    previous_payment_status TEXT,
    new_payment_status TEXT,
    changed_by TEXT, -- Admin user ID or system
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. ORDER_ITEM_RESERVATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_item_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reserved_quantity INTEGER NOT NULL CHECK (reserved_quantity > 0),
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'fulfilled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ORDER_FULFILLMENT TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_fulfillment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    fulfilled_quantity INTEGER NOT NULL CHECK (fulfilled_quantity > 0),
    fulfillment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_by TEXT, -- Admin user ID
    fulfillment_method TEXT DEFAULT 'manual' CHECK (fulfillment_method IN ('manual', 'automated')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ORDER_NOTES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS order_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'customer', 'internal', 'fulfillment', 'payment', 'shipping')),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to customers
    created_by TEXT, -- Admin user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. ORDER_TASKS TABLE (Workflow Management)
-- =============================================

CREATE TABLE IF NOT EXISTS order_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('inventory_check', 'payment_verification', 'shipping_preparation', 'quality_control', 'customer_contact', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT, -- Admin user ID
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Order item reservations indexes
CREATE INDEX IF NOT EXISTS idx_order_item_reservations_order_id ON order_item_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_reservations_product_id ON order_item_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_reservations_status ON order_item_reservations(status);

-- Order fulfillment indexes
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_order_id ON order_fulfillment(order_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_product_id ON order_fulfillment(product_id);

-- Order notes indexes
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_note_type ON order_notes(note_type);

-- Order tasks indexes
CREATE INDEX IF NOT EXISTS idx_order_tasks_order_id ON order_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tasks_assigned_to ON order_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_order_tasks_status ON order_tasks(status);

-- Enhanced orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_inventory_reserved ON orders(inventory_reserved);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);

-- =============================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update order version on changes
CREATE OR REPLACE FUNCTION update_order_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_order_version ON orders;
CREATE TRIGGER trigger_update_order_version
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_version();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        INSERT INTO order_status_history (
            order_id,
            previous_status,
            new_status,
            previous_payment_status,
            new_payment_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            OLD.payment_status,
            NEW.payment_status,
            'system', -- This should be replaced with actual user ID in application
            'Status updated'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- =============================================
-- 9. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DO $$ 
BEGIN
    -- Order status history policies
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_status_history;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    CREATE POLICY "Allow all operations for authenticated users" ON order_status_history
        FOR ALL TO authenticated USING (true);
    
    -- Order item reservations policies
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_item_reservations;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    CREATE POLICY "Allow all operations for authenticated users" ON order_item_reservations
        FOR ALL TO authenticated USING (true);
    
    -- Order fulfillment policies
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_fulfillment;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    CREATE POLICY "Allow all operations for authenticated users" ON order_fulfillment
        FOR ALL TO authenticated USING (true);
    
    -- Order notes policies
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_notes;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    CREATE POLICY "Allow all operations for authenticated users" ON order_notes
        FOR ALL TO authenticated USING (true);
    
    -- Order tasks policies
    BEGIN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_tasks;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, continue
    END;
    
    CREATE POLICY "Allow all operations for authenticated users" ON order_tasks
        FOR ALL TO authenticated USING (true);
END $$;

-- =============================================
-- 10. BUSINESS LOGIC FUNCTIONS
-- =============================================

-- Function to reserve inventory for an order
CREATE OR REPLACE FUNCTION reserve_order_inventory(order_uuid UUID)
RETURNS JSON AS $$
DECLARE
    order_record RECORD;
    order_item RECORD;
    product_record RECORD;
    reservation_id UUID;
    insufficient_stock BOOLEAN := FALSE;
    reservation_results JSON := '[]'::JSON;
    result JSON;
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM orders WHERE id = order_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Order not found');
    END IF;
    
    -- Check if already reserved
    IF order_record.inventory_reserved THEN
        RETURN json_build_object('success', false, 'error', 'Inventory already reserved for this order');
    END IF;
    
    -- Check stock availability for each item
    FOR order_item IN 
        SELECT oi.*, p.name as product_name, p.physical_stock, p.stock_quantity
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = order_uuid
    LOOP
        -- Use physical_stock if available, otherwise stock_quantity
        DECLARE
            available_stock INTEGER := COALESCE(order_item.physical_stock, order_item.stock_quantity, 0);
        BEGIN
            IF available_stock < order_item.quantity THEN
                insufficient_stock := TRUE;
                reservation_results := reservation_results || json_build_object(
                    'product_id', order_item.product_id,
                    'product_name', order_item.product_name,
                    'requested', order_item.quantity,
                    'available', available_stock,
                    'insufficient', TRUE
                );
            ELSE
                reservation_results := reservation_results || json_build_object(
                    'product_id', order_item.product_id,
                    'product_name', order_item.product_name,
                    'requested', order_item.quantity,
                    'available', available_stock,
                    'insufficient', FALSE
                );
            END IF;
        END;
    END LOOP;
    
    -- If insufficient stock, return error
    IF insufficient_stock THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Insufficient stock for one or more items',
            'details', reservation_results
        );
    END IF;
    
    -- Reserve inventory for each item
    FOR order_item IN 
        SELECT * FROM order_items WHERE order_id = order_uuid
    LOOP
        INSERT INTO order_item_reservations (
            order_id, order_item_id, product_id, reserved_quantity, status
        ) VALUES (
            order_uuid, order_item.id, order_item.product_id, order_item.quantity, 'active'
        );
    END LOOP;
    
    -- Update order status
    UPDATE orders 
    SET 
        inventory_reserved = TRUE,
        reserved_at = NOW(),
        version = version + 1
    WHERE id = order_uuid;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Inventory reserved successfully',
        'details', reservation_results
    );
END;
$$ LANGUAGE plpgsql;

-- Function to release inventory reservations
CREATE OR REPLACE FUNCTION release_order_inventory(order_uuid UUID)
RETURNS JSON AS $$
BEGIN
    -- Mark all reservations as released
    UPDATE order_item_reservations 
    SET 
        status = 'released',
        released_at = NOW()
    WHERE order_id = order_uuid AND status = 'active';
    
    -- Update order status
    UPDATE orders 
    SET 
        inventory_reserved = FALSE,
        version = version + 1
    WHERE id = order_uuid;
    
    RETURN json_build_object('success', true, 'message', 'Inventory reservations released');
END;
$$ LANGUAGE plpgsql;

-- Function to fulfill order items
CREATE OR REPLACE FUNCTION fulfill_order_item(
    order_uuid UUID,
    item_uuid UUID,
    fulfilled_qty INTEGER,
    fulfilled_by_user TEXT DEFAULT 'system'
)
RETURNS JSON AS $$
DECLARE
    order_item RECORD;
    total_fulfilled INTEGER;
BEGIN
    -- Get order item details
    SELECT oi.*, oi.quantity as total_quantity
    INTO order_item
    FROM order_items oi
    WHERE oi.id = item_uuid AND oi.order_id = order_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Order item not found');
    END IF;
    
    -- Calculate total already fulfilled
    SELECT COALESCE(SUM(fulfilled_quantity), 0)
    INTO total_fulfilled
    FROM order_fulfillment
    WHERE order_item_id = item_uuid;
    
    -- Check if fulfillment quantity is valid
    IF fulfilled_qty <= 0 OR (total_fulfilled + fulfilled_qty) > order_item.total_quantity THEN
        RETURN json_build_object('success', false, 'error', 'Invalid fulfillment quantity');
    END IF;
    
    -- Record fulfillment
    INSERT INTO order_fulfillment (
        order_id, order_item_id, product_id, fulfilled_quantity, fulfilled_by
    ) VALUES (
        order_uuid, item_uuid, order_item.product_id, fulfilled_qty, fulfilled_by_user
    );
    
    -- Update reservation status if fully fulfilled
    IF (total_fulfilled + fulfilled_qty) = order_item.total_quantity THEN
        UPDATE order_item_reservations 
        SET status = 'fulfilled'
        WHERE order_item_id = item_uuid AND status = 'active';
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Order item fulfilled successfully',
        'total_fulfilled', total_fulfilled + fulfilled_qty,
        'remaining', order_item.total_quantity - (total_fulfilled + fulfilled_qty)
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'Enhanced Order Management Schema created successfully!' as status;
