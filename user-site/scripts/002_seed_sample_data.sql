-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Pottery', 'Handcrafted ceramic pieces including bowls, vases, and decorative items', '/placeholder.svg?height=300&width=300'),
('Jewelry', 'Unique handmade jewelry pieces including necklaces, bracelets, and earrings', '/placeholder.svg?height=300&width=300'),
('Textiles', 'Woven and knitted items including scarves, blankets, and clothing', '/placeholder.svg?height=300&width=300'),
('Woodwork', 'Carved and crafted wooden items including furniture and decorative pieces', '/placeholder.svg?height=300&width=300');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_featured) VALUES
-- Pottery products
('Ceramic Bowl Set', 'Set of 4 handcrafted ceramic bowls in earth tones', 89.99, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 12, true),
('Blue Glazed Vase', 'Large decorative vase with beautiful blue glaze finish', 124.99, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 8, false),
('Terracotta Planter', 'Rustic terracotta planter perfect for herbs and small plants', 34.99, (SELECT id FROM categories WHERE name = 'Pottery'), '/placeholder.svg?height=400&width=400', 15, false),

-- Jewelry products
('Silver Wire Bracelet', 'Elegant handwoven silver wire bracelet with natural stones', 67.99, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 20, true),
('Beaded Necklace', 'Colorful beaded necklace with semi-precious stones', 45.99, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 18, false),
('Copper Earrings', 'Handforged copper earrings with unique patina finish', 29.99, (SELECT id FROM categories WHERE name = 'Jewelry'), '/placeholder.svg?height=400&width=400', 25, true),

-- Textiles products
('Wool Throw Blanket', 'Soft wool throw blanket in traditional patterns', 156.99, (SELECT id FROM categories WHERE name = 'Textiles'), '/placeholder.svg?height=400&width=400', 6, true),
('Silk Scarf', 'Hand-dyed silk scarf with abstract patterns', 78.99, (SELECT id FROM categories WHERE name = 'Textiles'), '/placeholder.svg?height=400&width=400', 14, false),

-- Woodwork products
('Carved Wooden Bowl', 'Beautiful hand-carved wooden serving bowl', 92.99, (SELECT id FROM categories WHERE name = 'Woodwork'), '/placeholder.svg?height=400&width=400', 10, false),
('Oak Cutting Board', 'Premium oak cutting board with natural edge', 68.99, (SELECT id FROM categories WHERE name = 'Woodwork'), '/placeholder.svg?height=400&width=400', 16, true);
