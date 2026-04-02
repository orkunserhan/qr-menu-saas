-- =============================================================================
-- SEED: "Big Chef Demo" Restoranı
-- Amaç: i18n (Çok dilli açıklama), description_translations fallback mantığı,
--       product tag sistemi, dark mode ve kampanya özelliklerini test etmek.
--
-- KULLANIM:
--   Supabase Dashboard > SQL Editor > Bu dosyayı yapıştır ve RUN.
--   Önce: SELECT id FROM auth.users LIMIT 5; ile owner_id'yi bulun.
--         Ardından aşağıdaki 'BURAYA_SENIN_UUID_NI_YAZ' değerini değiştirin.
-- =============================================================================

DO $$
DECLARE
    -- ⚠️ Kendi kullanıcı UUID'ni buraya yaz!
    -- Bulmak için: SELECT id FROM auth.users LIMIT 1;
    my_uid UUID;

    rest_id UUID;

    cat_pizza_id    UUID;
    cat_soup_id     UUID;
    cat_burger_id   UUID;
    cat_drinks_id   UUID;
BEGIN

    -- Otomatik kullanıcı ID tespiti (SQL Editor için)
    SELECT id INTO my_uid FROM auth.users ORDER BY created_at ASC LIMIT 1;

    IF my_uid IS NULL THEN
        RAISE EXCEPTION 'auth.users tablosu boş veya erişilemiyor. Lütfen my_uid değişkenine UUID''nizi manuel olarak girin.';
    END IF;

    -- Eğer "big-chef" slug'ı zaten varsa temizle (idempotent çalışma için)
    DELETE FROM public.restaurants WHERE slug = 'big-chef';

    -- =============================================================================
    -- 1. RESTORAN KAYDINI OLUŞTUR
    -- =============================================================================
    INSERT INTO public.restaurants (
        owner_id,
        name,
        slug,
        address,
        category,
        currency,
        is_active,
        is_open,
        logo_url,
        cover_image_url,
        phone,
        email,
        is_campaign_active,
        campaign_title,
        campaign_text,
        show_calories,
        show_preparation_time,
        subscription_end_date
    ) VALUES (
        my_uid,
        'Big Chef Demo',
        'big-chef',
        '123 Gourmet Street, Vienna',
        'Fine Dining',
        'EUR',
        true,
        true,
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        '+43 1 234 5678',
        'chef@bigchef.demo',
        true,
        'Happy Hour! 🍷',
        'Tüm şaraplarda %20 indirim – Her gün 17:00-19:00 arası.',
        true,
        true,
        NOW() + INTERVAL '365 days'
    ) RETURNING id INTO rest_id;

    RAISE NOTICE 'Restoran oluşturuldu. ID: %', rest_id;

    -- =============================================================================
    -- 2. KATEGORİLERİ OLUŞTUR
    -- =============================================================================
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Pizzas', 1)  RETURNING id INTO cat_pizza_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Soups', 2)   RETURNING id INTO cat_soup_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Burgers', 3) RETURNING id INTO cat_burger_id;
    INSERT INTO public.categories (restaurant_id, name, order_index) VALUES (rest_id, 'Drinks & Alcohol', 4) RETURNING id INTO cat_drinks_id;

    RAISE NOTICE 'Kategoriler oluşturuldu.';

    -- =============================================================================
    -- 3. ÜRÜNLER: Pizzas
    -- =============================================================================

    -- Margherita: EN + DE + TR (Fallback testi YOK - her dilde dolu)
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_pizza_id,
        'Margherita',
        'Classic tomato, fresh mozzarella & basil on thin crust.',
        '{"en": "Classic tomato sauce, fresh buffalo mozzarella and aromatic basil on our perfectly thin sourdough crust.", "de": "Klassische Tomatensoße, frischer Büffelmozzarella und aromatisches Basilikum auf unserem hauchdünnen Sauerteigboden.", "tr": "İnce sourdough hamuru üzerinde klasik domates sosu, taze bufala mozzarella ve aromatik fesleğen."}',
        12.50, 620, 12,
        true,
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegetarian']
    );

    -- Diavola: EN + TR dolu, *** DE KASITLI BOŞ *** → Fallback test!
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_pizza_id,
        'Diavola',
        'Spicy Italian salami, chilli oil and smoked mozzarella.',
        '{"en": "Fiery Calabrian salami, drizzle of chilli oil, smoked mozzarella on a crispy tomato base. Warning: genuinely spicy!", "de": "", "tr": "Acı Calabria salamı, acı biber yağı ve füme mozzarella ile çıtır domates tabanlı pizza. Dikkat: gerçekten acı!"}',
        14.50, 790, 14,
        true,
        'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80',
        ARRAY['pork', 'spicy']
    );

    -- =============================================================================
    -- 4. ÜRÜNLER: Soups
    -- =============================================================================

    -- Tomato Soup: EN + DE + TR dolu
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_soup_id,
        'Roasted Tomato Soup',
        'Oven-roasted tomatoes blended with fresh basil and olive oil.',
        '{"en": "Slow-roasted vine tomatoes blended with fresh basil, a hint of garlic and our finest extra-virgin olive oil. Served with sourdough croutons.", "de": "Langsam geröstete Strauchtomaten mit frischem Basilikum, einer Prise Knoblauch und nativem Olivenöl extra. Serviert mit Sauerteig-Croutons.", "tr": "Yavaş kızartılmış salkım domatesler, taze fesleğen, sarımsak ve birinci kalite sızma zeytinyağı ile harmanlandı. Sourdough kruton ile servis edilir."}',
        7.50, 210, 8,
        true,
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegan', 'hot']
    );

    -- Chicken Broth: EN + TR dolu, is_available: FALSE → "Tükendi" test!
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_soup_id,
        'Chicken Broth',
        'Traditional clear chicken soup with fine noodles and herbs.',
        '{"en": "Traditional Austrian-style clear chicken broth simmered for 6 hours, served with fine noodles and garden herbs. A true comfort classic.", "tr": "6 saat kaynatılmış geleneksel Avusturya usulü berrak tavuk suyu, ince şehriye ve taze otlarla servis edilir. Gerçek bir teselli yemeği."}',
        6.00, 155, 5,
        false, -- ⚠️ KASITLI: is_available = false → "Tükendi" badge testi
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80',
        ARRAY['chicken', 'hot']
    );

    -- =============================================================================
    -- 5. ÜRÜNLER: Burgers
    -- =============================================================================

    -- Classic Beef Burger: EN + DE + TR dolu
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_burger_id,
        'Classic Beef Burger',
        'Hand-pressed Angus beef patty, lettuce, tomato, house pickles.',
        '{"en": "180g hand-pressed Australian Angus beef patty, aged cheddar, crispy lettuce, vine tomato, red onion and our house-made pickles on a toasted brioche bun.", "de": "180g handgepresster australischer Angus-Rindfleisch-Patty, gereifter Cheddar, knackiger Salat, Strauchtomaten, rote Zwiebeln und hausgemachte Pickles auf einem getoasteten Brioche-Bun.", "tr": "180g elle preslenen Avustralyalı Angus dana köftesi, olgunlaşmış cheddar, çıtır marul, salkım domates, kırmızı soğan ve ev yapımı turşu, brioche ekmeğinde."}',
        16.90, 890, 15,
        true,
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        ARRAY['beef']
    );

    -- Truffle Mushroom Burger: EN + TR dolu, *** DE YOK *** → Fallback test!
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_burger_id,
        'Truffle Mushroom Burger',
        'Portobello mushroom, truffle aioli, gruyère cheese.',
        '{"en": "Juicy portobello mushroom patty brushed with truffle oil, melted gruyère cheese, caramelised onions and our house-made truffle aioli. A vegetarian showstopper.", "tr": "Trüf yağıyla fırçalanmış sulu portobello mantar köfte, eritilmiş gruyère peyniri, karamelize soğan ve ev yapımı trüf aioli. Vejeteryanlar için özel bir seçim."}',
        18.50, 720, 15,
        true,
        'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80',
        ARRAY['vegetarian', 'chefs_choice']
    );

    -- =============================================================================
    -- 6. ÜRÜNLER: Drinks & Alcohol
    -- =============================================================================

    -- Coca Cola: EN + TR dolu
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_drinks_id,
        'Coca Cola',
        'Ice-cold Coca Cola served in a chilled glass.',
        '{"en": "The classic. Ice-cold Coca Cola served in a chilled glass with plenty of ice and a slice of fresh lime. 330ml.", "tr": "Klasik. Buz gibi Coca Cola, soğutulmuş bardakta bol buzlu ve taze limon dilimiyle servis edilir. 330ml."}',
        4.00, 140, 2,
        true,
        'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
        ARRAY['cold']
    );

    -- Cabernet Sauvignon: EN + DE + TR dolu
    INSERT INTO public.products (
        restaurant_id, category_id, name, description,
        description_translations, price, calories, preparation_time,
        is_available, image_url, tags
    ) VALUES (
        rest_id, cat_drinks_id,
        'Cabernet Sauvignon',
        'Premium Austrian red wine with deep fruit notes.',
        '{"en": "Premium Austrian Cabernet Sauvignon from the Burgenland region. Deep ruby colour with notes of blackcurrant, plum and a hint of oak. 150ml glass.", "de": "Premium österreichischer Cabernet Sauvignon aus dem Burgenland. Tiefes Rubinrot mit Aromen von Schwarzer Johannisbeere, Pflaume und einem Hauch von Eiche. 150ml.", "tr": "Burgenland bölgesinden premium Avusturya Cabernet Sauvignon. Derin yakut rengi, siyah frenk üzümü, erik aromaları ve hafif meşe notası. 150ml bardak."}',
        9.50, 125, 2,
        true,
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        ARRAY['alcohol']
    );

    RAISE NOTICE '✅ "Big Chef Demo" seed verisi başarıyla oluşturuldu!';
    RAISE NOTICE 'Müşteri menüsü: /en/big-chef, /de/big-chef, /sk/big-chef';
    RAISE NOTICE 'Fallback testi için: Diavola (de boş) ve Truffle Mushroom Burger (de boş).';
    RAISE NOTICE '"Tükendi" testi için: Chicken Broth (is_available = false).';

END $$;
