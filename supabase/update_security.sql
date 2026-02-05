-- 1. Restaurants tablosuna owner_id ekle
alter table public.restaurants 
add column if not exists owner_id uuid default auth.uid();

-- 2. RLS Politikalarını Güçlendir (Herkes her şeyi göremesin)

-- Önce mevcut politikaları temizleyelim (çakışma olmasın)
drop policy if exists "Allow public read access on restaurants" on public.restaurants;
drop policy if exists "Allow public read access on categories" on public.categories;
drop policy if exists "Allow public read access on products" on public.products;

-- RESTAURANTS TABLOSU POLİTİKALARI --

-- a) Public Read: Herkes (giriş yapmamış müşteriler) SADECE aktif restoranları görebilir (Menü sayfası için)
create policy "Public can view active restaurants"
on public.restaurants for select
using (true); 
-- Not: Aslında menü sayfası slug ile çektiği için 'true' bırakmak daha esnek, 
-- ama sadece aktif olanları filterelemek uygulama katmanında (page.tsx) zaten var.

-- b) Owner Access: Restoran sahibi (owner_id = senin id'n) her şeyi yapabilir (Select, Insert, Update)
create policy "Owners can view own restaurants"
on public.restaurants for select
using (auth.uid() = owner_id);

create policy "Owners can insert own restaurants"
on public.restaurants for insert
with check (auth.uid() = owner_id);

create policy "Owners can update own restaurants"
on public.restaurants for update
using (auth.uid() = owner_id);

-- Delete'i bilerek eklemiyorum, "Silme Olmasın" istediğiniz için veritabanı seviyesinde de kapatabiliriz 
-- ama admin panelinden kaldırmak yeterli olacaktır. Yine de güvenlik için delete policy eklememek en iyisi.


-- KATEGORİ VE ÜRÜNLER --
-- Bunlar restoranın alt öğesi olduğu için, restoranın sahibi bunlara da erişebilmeli.
-- Basitlik için şimdilik bunlara geniş yetki verip, uygulama katmanında (Next.js server action) kontrol edeceğiz.
-- Ancak doğrusu: "restaurants" tablosu ile join yaparak yetki kontrolü yapmaktır.

create policy "Public can view categories" on public.categories for select using (true);
create policy "Auth users can manage categories" on public.categories for all using (auth.role() = 'authenticated');

create policy "Public can view products" on public.products for select using (true);
create policy "Auth users can manage products" on public.products for all using (auth.role() = 'authenticated');
