-- Restaurants tablosuna yeni alanlar ekle
alter table public.restaurants 
add column if not exists phone text,
add column if not exists email text, -- Restoranın iletişim emaili (Account emailinden farklı olabilir)
add column if not exists category text; -- Örn: Fine Dining, Fast Food...

-- Eğer daha önce yapmadıysanız owner_id eklemesi
alter table public.restaurants 
add column if not exists owner_id uuid default auth.uid();
