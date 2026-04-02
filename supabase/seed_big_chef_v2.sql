-- =============================================================================
-- SEED V2: "Big Chef Demo" - Kategoriler, Ürünler ve Ayarlar
-- Restoran zaten mevcut: ID = 20e69999-d6d3-448b-8c37-aee2a72ef7b4
-- Bu script restoranı güncelleyip kategorileri ve ürünleri ekler.
-- =============================================================================

DO $$
DECLARE
    rest_id UUID := '20e69999-d6d3-448b-8c37-aee2a72ef7b4';

    cat_pizza_id    UUID;
    cat_soup_id     UUID;
    cat_burger_id   UUID;
    cat_drinks_id   UUID;
BEGIN

    -- 1. Restoranı tüm ayrıntılarla güncelle
    UPDATE public.restaurants SET
        address             = '123 Gourmet Street, Vienna',
        category            = 'Fine Dining',
        currency            = 'EUR',
        is_open             = true,
        logo_url            = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
        cover_image_url     = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        phone               = '+43 1 234 5678',
        email               = 'chef@bigchef.demo',
        is_campaign_active  = true,
        campaign_title      = 'Happy Hour! 🍷',
        campaign_text       = 'Tüm şaraplarda %20 indirim – Her gün 17:00-19:00 arası.',
        show_calories       = true,
        show_preparation_time = true,
        subscription_end_date = NOW() + INTERVAL '365 days'
    WHERE id = rest_id;

    -- 2. Eski kategorileri temizle (idempotent)
    DELETE FROM public.categories WHERE restaurant_id = rest_id;

    -- 3. Kategorileri oluştur
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Pizzas', 1)           RETURNING id INTO cat_pizza_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Soups', 2)            RETURNING id INTO cat_soup_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Burgers', 3)          RETURNING id INTO cat_burger_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Drinks & Alcohol', 4) RETURNING id INTO cat_drinks_id;

    -- ==========================================================================
    -- 4. PIZZAS
    -- ==========================================================================

    -- Margherita: EN + DE + TR hepsi dolu (TAM ÇEVİRİ testi)
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_pizza_id, 'Margherita',
        'Classic tomato, fresh mozzarella & basil on thin crust.',
        '{"en": "Classic tomato sauce, fresh buffalo mozzarella and aromatic basil on our perfectly thin sourdough crust.", "de": "Klassische Tomatensoße, frischer Büffelmozzarella und aromatisches Basilikum auf unserem hauchdünnen Sauerteigboden.", "tr": "İnce sourdough hamuru üzerinde klasik domates sosu, taze bufala mozzarella ve aromatik fesleğen."}'::jsonb,
        12.50, 620, 12, true,
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegetarian']
    );

    -- Diavola: EN + TR dolu, DE KASITLI BOŞ → Fallback testi!
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_pizza_id, 'Diavola',
        'Spicy Italian salami, chilli oil and smoked mozzarella.',
        '{"en": "Fiery Calabrian salami, drizzle of chilli oil, smoked mozzarella on a crispy tomato base. Warning: genuinely spicy!", "de": "", "tr": "Acı Calabria salamı, acı biber yağı ve füme mozzarella ile çıtır domates tabanlı pizza. Dikkat: gerçekten acı!"}'::jsonb,
        14.50, 790, 14, true,
        'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80',
        ARRAY['pork', 'spicy']
    );

    -- ==========================================================================
    -- 5. SOUPS
    -- ==========================================================================

    -- Tomato Soup: EN + DE + TR dolu
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_soup_id, 'Roasted Tomato Soup',
        'Oven-roasted tomatoes blended with fresh basil and olive oil.',
        '{"en": "Slow-roasted vine tomatoes with fresh basil, a hint of garlic and finest extra-virgin olive oil. Served with sourdough croutons.", "de": "Langsam geröstete Strauchtomaten mit frischem Basilikum, einer Prise Knoblauch und nativem Olivenöl. Serviert mit Sauerteig-Croutons.", "tr": "Yavaş kızartılmış salkım domatesler, taze fesleğen, sarımsak ve sızma zeytinyağı ile. Sourdough kruton ile servis edilir."}'::jsonb,
        7.50, 210, 8, true,
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegan', 'hot']
    );

    -- Chicken Broth: is_available FALSE → "Tükendi" badge testi!
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_soup_id, 'Chicken Broth',
        'Traditional clear chicken soup with fine noodles and herbs.',
        '{"en": "Traditional Austrian-style clear chicken broth simmered for 6 hours, with fine noodles and garden herbs. A true comfort classic.", "tr": "6 saat kaynatılmış geleneksel Avusturya usulü berrak tavuk suyu, ince şehriye ve taze otlarla."}'::jsonb,
        6.00, 155, 5, false,  -- ⚠️ is_available = false → TÜKENDI
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80',
        ARRAY['chicken', 'hot']
    );

    -- ==========================================================================
    -- 6. BURGERS
    -- ==========================================================================

    -- Classic Beef Burger: EN + DE + TR dolu
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_burger_id, 'Classic Beef Burger',
        'Hand-pressed Angus beef patty, lettuce, tomato, house pickles.',
        '{"en": "180g hand-pressed Angus beef patty, aged cheddar, crispy lettuce, vine tomato, red onion and house-made pickles on a toasted brioche bun.", "de": "180g handgepresster Angus-Rindfleisch-Patty, gereifter Cheddar, knackiger Salat, Strauchtomaten und hausgemachte Pickles auf einem Brioche-Bun.", "tr": "180g elle preslenen Angus dana köftesi, olgunlaşmış cheddar, çıtır marul, domates, kırmızı soğan ve ev yapımı turşu, brioche ekmeğinde."}'::jsonb,
        16.90, 890, 15, true,
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        ARRAY['beef']
    );

    -- Truffle Mushroom Burger: EN + TR dolu, DE YOK → Fallback testi!
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_burger_id, 'Truffle Mushroom Burger',
        'Portobello mushroom, truffle aioli, gruyère cheese.',
        '{"en": "Juicy portobello mushroom patty with truffle oil, melted gruyère, caramelised onions and house-made truffle aioli. A vegetarian showstopper.", "tr": "Trüf yağlı sulu portobello mantar köfte, erimiş gruyère, karamelize soğan ve ev yapımı trüf aioli. Vejetaryen için özel."}'::jsonb,
        18.50, 720, 15, true,
        'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegetarian', 'chefs_choice']
    );

    -- ==========================================================================
    -- 7. DRINKS & ALCOHOL
    -- ==========================================================================

    -- Coca Cola: EN + TR
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_drinks_id, 'Coca Cola',
        'Ice-cold Coca Cola served in a chilled glass.',
        '{"en": "The classic. Ice-cold Coca Cola in a chilled glass with plenty of ice and a slice of fresh lime. 330ml.", "tr": "Klasik. Buz gibi Coca Cola, soğutulmuş bardakta bol buz ve taze limon dilimiyle. 330ml."}'::jsonb,
        4.00, 140, 2, true,
        'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
        ARRAY['cold']
    );

    -- Cabernet Sauvignon: EN + DE + TR hepsi dolu
    INSERT INTO public.products (restaurant_id, category_id, name, description, description_translations, price, calories, preparation_time, is_available, image_url, tags)
    VALUES (
        rest_id, cat_drinks_id, 'Cabernet Sauvignon',
        'Premium Austrian red wine with deep fruit notes.',
        '{"en": "Premium Austrian Cabernet Sauvignon from Burgenland. Deep ruby with notes of blackcurrant, plum and a hint of oak. 150ml glass.", "de": "Premium österreichischer Cabernet Sauvignon aus dem Burgenland. Tiefes Rubinrot mit Aromen von Johannisbeere, Pflaume und Eiche. 150ml.", "tr": "Burgenland''dan premium Avusturya Cabernet Sauvignon. Derin yakut rengi, siyah frenk üzümü, erik ve hafif meşe notası. 150ml bardak."}'::jsonb,
        9.50, 125, 2, true,
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        ARRAY['alcohol']
    );

    RAISE NOTICE '✅ Big Chef Demo kategorileri ve ürünleri başarıyla eklendi!';
    RAISE NOTICE 'Test URL: http://localhost:3000/en/big-chef';
    RAISE NOTICE 'Fallback test (DE boş): /de/big-chef → Diavola ve Truffle Mushroom Burger İngilizce açıklama göstermeli.';
    RAISE NOTICE 'Tükendi test: /en/big-chef → Chicken Broth kırmızı badge göstermeli.';

END $$;
