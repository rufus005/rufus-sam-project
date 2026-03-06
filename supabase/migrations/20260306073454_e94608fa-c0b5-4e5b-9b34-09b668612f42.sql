
-- Seed categories
INSERT INTO categories (id, name, slug, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Gadgets, devices, and tech accessories'),
  ('a1000000-0000-0000-0000-000000000002', 'Clothing', 'clothing', 'Apparel for men, women, and kids'),
  ('a1000000-0000-0000-0000-000000000003', 'Home & Kitchen', 'home-kitchen', 'Furniture, décor, and kitchen essentials'),
  ('a1000000-0000-0000-0000-000000000004', 'Sports & Outdoors', 'sports-outdoors', 'Gear for every adventure'),
  ('a1000000-0000-0000-0000-000000000005', 'Books', 'books', 'Bestsellers, fiction, and non-fiction');

-- Seed products
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, stock_quantity, is_active, tags) VALUES
  ('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium noise-cancelling over-ear headphones with 30-hour battery life.', 79.99, 99.99, 'a1000000-0000-0000-0000-000000000001', 150, true, ARRAY['electronics','audio','bestseller']),
  ('Smart Watch Pro', 'smart-watch-pro', 'Advanced fitness tracking, heart rate monitor, and GPS. Compatible with iOS and Android.', 199.99, 249.99, 'a1000000-0000-0000-0000-000000000001', 75, true, ARRAY['electronics','wearable','new']),
  ('USB-C Hub Adapter 7-in-1', 'usb-c-hub-adapter', 'Connect all your peripherals — HDMI, USB 3.0, SD card, and more.', 34.99, NULL, 'a1000000-0000-0000-0000-000000000001', 200, true, ARRAY['electronics','accessories']),
  ('Portable Bluetooth Speaker', 'portable-bluetooth-speaker', 'Waterproof speaker with deep bass and 12-hour playtime.', 49.99, 59.99, 'a1000000-0000-0000-0000-000000000001', 120, true, ARRAY['electronics','audio']),
  ('Classic Cotton T-Shirt', 'classic-cotton-tshirt', '100% organic cotton, available in multiple colors. Comfortable everyday wear.', 24.99, NULL, 'a1000000-0000-0000-0000-000000000002', 500, true, ARRAY['clothing','basics','bestseller']),
  ('Slim Fit Denim Jeans', 'slim-fit-denim-jeans', 'Modern slim fit with stretch comfort. Dark wash.', 59.99, 79.99, 'a1000000-0000-0000-0000-000000000002', 300, true, ARRAY['clothing','denim']),
  ('Lightweight Running Jacket', 'lightweight-running-jacket', 'Wind-resistant and breathable. Perfect for morning runs.', 89.99, 109.99, 'a1000000-0000-0000-0000-000000000002', 80, true, ARRAY['clothing','activewear','new']),
  ('Stainless Steel Water Bottle', 'stainless-steel-water-bottle', 'Double-wall insulated, keeps drinks cold 24 hours or hot 12 hours.', 29.99, NULL, 'a1000000-0000-0000-0000-000000000003', 400, true, ARRAY['home','kitchen','bestseller']),
  ('Non-Stick Cookware Set (10-Piece)', 'nonstick-cookware-set', 'Complete kitchen set with pots, pans, and utensils. Dishwasher safe.', 129.99, 179.99, 'a1000000-0000-0000-0000-000000000003', 60, true, ARRAY['home','kitchen']),
  ('LED Desk Lamp with Wireless Charger', 'led-desk-lamp-wireless-charger', 'Adjustable brightness, USB port, and built-in Qi wireless charging pad.', 44.99, 54.99, 'a1000000-0000-0000-0000-000000000003', 90, true, ARRAY['home','office','new']),
  ('Yoga Mat Premium', 'yoga-mat-premium', 'Extra thick, non-slip surface. Includes carrying strap.', 39.99, NULL, 'a1000000-0000-0000-0000-000000000004', 200, true, ARRAY['sports','fitness','bestseller']),
  ('Adjustable Dumbbell Set', 'adjustable-dumbbell-set', 'Space-saving design, adjusts from 5 to 50 lbs per dumbbell.', 299.99, 349.99, 'a1000000-0000-0000-0000-000000000004', 40, true, ARRAY['sports','fitness']),
  ('Camping Tent (4-Person)', 'camping-tent-4-person', 'Waterproof, easy setup, with ventilation windows and rain fly.', 149.99, 199.99, 'a1000000-0000-0000-0000-000000000004', 35, true, ARRAY['sports','outdoors']),
  ('The Art of Programming', 'the-art-of-programming', 'A comprehensive guide to modern software development practices.', 39.99, NULL, 'a1000000-0000-0000-0000-000000000005', 100, true, ARRAY['books','technology','bestseller']),
  ('Mindful Living Journal', 'mindful-living-journal', 'Guided journal for daily reflection and gratitude practice.', 19.99, 24.99, 'a1000000-0000-0000-0000-000000000005', 250, true, ARRAY['books','wellness','new']);
