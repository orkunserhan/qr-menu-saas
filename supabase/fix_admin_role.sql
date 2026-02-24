-- BU KODU SUPABASE SQL EDITOR'E YAPIŞTIRIP RUN DEYİN

-- 1. Adım: Eğer 'profiles' tablosunda kaydınız yoksa auth.users tablosundan oluştur
insert into public.profiles (id, email, role)
select id, email, 'super_admin'
from auth.users
where email = 'demo@demo.com' -- Mail adresiniz buradaysa
on conflict (id) do update
set role = 'super_admin';

-- 2. Adım: Garanti olsun diye, 'demo@demo.com' olan her profili güncelle
update public.profiles
set role = 'super_admin'
where email = 'demo@demo.com';

-- 3. Adım: Kontrol (Opsiyonel - Sonucu görmek için)
select * from public.profiles where email = 'demo@demo.com';
