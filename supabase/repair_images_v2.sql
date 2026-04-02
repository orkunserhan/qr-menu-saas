-- =============================================================================
-- FINAL IMAGE REPAIR: Guaranteed High-Res Photos for Public Categories
-- =============================================================================

-- Kategorilerin ilk ürünlerini güncelle ki üst bardaki fotolar düzelsin
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1547592166-83ac45744acd?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%çorba%' OR name ILIKE '%soup%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1511690656052-7e10ce0294ad?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%starter%' OR name ILIKE '%başlangıç%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%appetizer%' OR name ILIKE '%ara sıcak%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%main course%' OR name ILIKE '%ana yemek%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1573016608464-5aa29afcd953?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%snack%' OR name ILIKE '%atıştırmalık%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%tatlı%' OR name ILIKE '%dessert%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1544145945-f904253db0ad?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%içecek%' OR name ILIKE '%drink%' OR name ILIKE '%soft drink%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%şarap%' OR name ILIKE '%wine%');
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%kokteyl%' OR name ILIKE '%cocktail%');

-- Münferit popüler ürünler için kesin fix
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' WHERE name ILIKE '%pizza%' AND image_url IS NULL;
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' WHERE name ILIKE '%burger%' AND image_url IS NULL;

-- Eksik Logo/Kapak Fotoğrafları
UPDATE public.restaurants SET logo_url = 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=400&q=80' WHERE logo_url IS NULL OR logo_url = '';
UPDATE public.restaurants SET cover_image_url = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80' WHERE cover_image_url IS NULL OR cover_image_url = '';
