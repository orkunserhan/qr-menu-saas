-- Profiles tablosuna yeni alanlar ekle
alter table public.profiles 
add column if not exists phone text,
add column if not exists full_name text,
add column if not exists birth_date date;

-- Restaurants tablosuna yeni alanlar ekle (Signup sırasında alınanlar)
-- Address zaten vardı.
alter table public.restaurants
add column if not exists phone text,
add column if not exists email text, -- Restoran iletişim maili
add column if not exists establishment_date date;
