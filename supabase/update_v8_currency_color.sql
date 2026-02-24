-- 1. Restoranlara Para Birimi Ekle
alter table public.restaurants 
add column if not exists currency text default 'TRY'; -- 'TRY', 'EUR', 'USD'

-- 2. Masalara Renk Ekle
alter table public.tables 
add column if not exists color text default 'gray'; -- 'gray', 'red', 'blue', 'green', 'yellow', 'purple'
