-- Kullanıcı ID'sini al (Sorguyu çalıştıran kişi sahibi olsun)
-- Eğer SQL Editor'den çalıştırıyorsanız auth.uid() bazen null dönebilir.
-- O yüzden admin panelinde kendi ID'nizi bulup buraya yazmanız en garantisidir.
-- Örn: select id from auth.users limit 1; 
-- Şimdilik auth.uid() deniyoruz.

do $$
declare
  my_uid uuid := auth.uid(); -- Burası NULL dönerse manuel ID girin: 'sizin-uuid-niz'
  rest_ege_id uuid;
  rest_pizza_id uuid;
  
  cat_soguk uuid;
  cat_ara uuid;
  cat_ana uuid;
  
  cat_klasik uuid;
  cat_gurme uuid;
  cat_tatli uuid;
begin

  -- Eğer my_uid yoksa (SQL Editor için), varsayılan bir kullanıcı varsa onu al, yoksa uyar.
  if my_uid is null then
     -- Bu satırı, auth.users tablosundan ilk kullanıcıyı almak için açabilirsiniz:
     select id into my_uid from auth.users limit 1;
  end if;

  -- 1. RESTORAN: Ege Mavisi
  insert into public.restaurants (owner_id, name, slug, address, category, is_active)
  values (my_uid, 'Ege Mavisi Balıkçısı', 'ege-mavisi', 'Kuruçeşme Sahil Yolu, No: 42', 'Fine Dining', true)
  returning id into rest_ege_id;

  -- Kategoriler
  insert into public.categories (restaurant_id, name, order_index) values (rest_ege_id, 'Soğuk Başlangıçlar', 1) returning id into cat_soguk;
  insert into public.categories (restaurant_id, name, order_index) values (rest_ege_id, 'Ara Sıcaklar', 2) returning id into cat_ara;
  insert into public.categories (restaurant_id, name, order_index) values (rest_ege_id, 'Ana Yemekler', 3) returning id into cat_ana;

  -- Ürünler: Soğuk
  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_ege_id, cat_soguk, 'Levrek Marin', 'Taze levrek, hardal sosu ve kapari ile.', 280, 'https://images.unsplash.com/photo-1615141982880-13f55e3ce4c8?auto=format&fit=crop&w=800'),
  (rest_ege_id, cat_soguk, 'Girit Ezmesi', 'Fıstıklı, peynirli ve zeytinyağlı özel karışım.', 240, 'https://images.unsplash.com/photo-1626200926749-43303fce69d8?auto=format&fit=crop&w=800'),
  (rest_ege_id, cat_soguk, 'Deniz Börülcesi', 'Sarımsaklı zeytinyağı soslu.', 190, 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=800');

  -- Ürünler: Ara Sıcak
  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_ege_id, cat_ara, 'Kalamar Tava', 'Tarator sos ile, yerli kalamar.', 450, 'https://images.unsplash.com/photo-1600336153113-d86ca097de63?auto=format&fit=crop&w=800'),
  (rest_ege_id, cat_ara, 'Karides Güveç', 'Tereyağlı, sarımsaklı ve pul biberli.', 520, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800');

  -- Ürünler: Ana Yemek
  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_ege_id, cat_ana, 'Izgara Levrek', 'Roka ve kırmızı soğan salatası eşliğinde.', 750, 'https://images.unsplash.com/photo-1599084993091-18c97ddba429?auto=format&fit=crop&w=800'),
  (rest_ege_id, cat_ana, 'Deniz Mahsullü Linguine', 'Karides, kalamar ve midyeli özel soslu makarna.', 680, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800');


  -- 2. RESTORAN: Pizzamore Napoli
  insert into public.restaurants (owner_id, name, slug, address, category, is_active)
  values (my_uid, 'Pizzamore Napoli', 'pizzamore', 'Moda Caddesi, No: 12', 'Casual Dining', true)
  returning id into rest_pizza_id;

  -- Kategoriler
  insert into public.categories (restaurant_id, name, order_index) values (rest_pizza_id, 'Klasik Pizzalar', 1) returning id into cat_klasik;
  insert into public.categories (restaurant_id, name, order_index) values (rest_pizza_id, 'Gurme Pizzalar', 2) returning id into cat_gurme;
  insert into public.categories (restaurant_id, name, order_index) values (rest_pizza_id, 'Tatlılar', 3) returning id into cat_tatli;

  -- Ürünler
  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_pizza_id, cat_klasik, 'Margherita', 'San Marzano domates sosu, manda mozzarellası, taze fesleğen.', 320, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800'),
  (rest_pizza_id, cat_klasik, 'Pepperoni', 'İtalyan sucuğu, mozzarella ve özel domates sosu.', 390, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800');

  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_pizza_id, cat_gurme, 'Trüflü Mantarlı', 'Trüf yağı, porçini mantarı, roka ve parmesan.', 480, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800'),
  (rest_pizza_id, cat_gurme, 'Quattro Formaggi', 'Mozzarella, Gorgonzola, Parmesan ve Edam peyniri.', 440, 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800');

  insert into public.products (restaurant_id, category_id, name, description, price, image_url) values
  (rest_pizza_id, cat_tatli, 'Tiramisu', 'Orijinal mascarpone peyniri ve espresso ile.', 220, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800'),
  (rest_pizza_id, cat_tatli, 'Nutellalı Pizza', 'Çilek ve muz parçacıkları ile (Paylaşımlık).', 280, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800');


end $$;
