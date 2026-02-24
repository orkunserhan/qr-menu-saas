-- 1. MASALAR TABLOSU (Görsel Koordinatlı)
create table if not exists public.tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null, -- Örn: "Bahçe 1", "Salon 4"
  position_x numeric default 0, -- Yatay Konum (%)
  position_y numeric default 0, -- Dikey Konum (%)
  shape text default 'square', -- 'square' (kare), 'round' (yuvarlak)
  is_occupied boolean default false, -- Dolu mu?
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SİPARİŞLER TABLOSU
create type order_status as enum ('pending', 'preparing', 'served', 'paid', 'cancelled');

create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  table_id uuid references public.tables(id) on delete set null, -- Hangi Masa?
  status order_status default 'pending', -- Sipariş Durumu
  total_amount numeric default 0, -- Toplam Tutar
  customer_note text, -- "Soğan olmasın" vs.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SİPARİŞ DETAYLARI (Hangi ürünler var?)
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1,
  price_at_time numeric not null, -- Ürünün o anki fiyatı (zam gelirse eski sipariş bozulmasın diye)
  options text -- Opsiyonel (Acılı, Az pişmiş vs. JSON string olabilir)
);

-- RLS (Güvenlik) Ayarları (Hızlı Kurulum)
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Okuma Politikaları
create policy "Public can view tables" on public.tables for select using (true);
create policy "Owners can manage tables" on public.tables for all using (exists (select 1 from public.restaurants where id = public.tables.restaurant_id and owner_id = auth.uid()) or public.is_admin());

create policy "Owners manage orders" on public.orders for all using (exists (select 1 from public.restaurants where id = public.orders.restaurant_id and owner_id = auth.uid()) or public.is_admin());
create policy "Public can insert orders" on public.orders for insert with check (true); -- Müşteri sipariş verebilsin

create policy "Owners manage order items" on public.order_items for all using (
  exists (
    select 1 from public.orders 
    join public.restaurants on public.orders.restaurant_id = public.restaurants.id
    where public.orders.id = public.order_items.order_id 
    and (public.restaurants.owner_id = auth.uid() or public.is_admin())
  )
);
create policy "Public can insert order items" on public.order_items for insert with check (true);
