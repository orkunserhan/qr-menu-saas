-- =============================================================================
-- IMAGE REPAIR: Big Chef & OD Urla Photo Sync
-- =============================================================================

UPDATE public.products SET 
    image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'
WHERE name = 'Margherita';

UPDATE public.products SET 
    image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'
WHERE name = 'Diavola';

UPDATE public.products SET 
    image_url = 'https://images.unsplash.com/photo-1547592166-83ac45744acd?w=800&q=80'
WHERE name = 'Crema di Funghi al Tartufo';

UPDATE public.products SET 
    image_url = 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800&q=80'
WHERE name = 'Filetto alla Rossini';

UPDATE public.products SET 
    image_url = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'
WHERE name = 'Signature Negroni al Tartufo';

-- Logo Fallback Fix
UPDATE public.restaurants SET 
    logo_url = 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=400&q=80'
WHERE logo_url IS NULL OR logo_url = '';

-- Verify:
-- SELECT name, image_url FROM public.products ORDER BY created_at DESC LIMIT 10;
