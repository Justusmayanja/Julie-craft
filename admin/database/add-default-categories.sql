-- Add default categories for JulieCraft (only if they don't exist)
INSERT INTO categories (name, description, sort_order, is_active, created_at, updated_at)
VALUES 
  ('Pottery', 'Handcrafted ceramic and pottery items', 1, true, NOW(), NOW()),
  ('Jewelry', 'Handmade jewelry and accessories', 2, true, NOW(), NOW()),
  ('Textiles', 'Handwoven textiles and fabrics', 3, true, NOW(), NOW()),
  ('Woodwork', 'Hand-carved wooden items', 4, true, NOW(), NOW()),
  ('Home Decor', 'Decorative items for the home', 5, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify categories were added
SELECT * FROM categories ORDER BY sort_order;
