-- orkunserhan@gmail.com için KESİN ÇÖZÜM

-- 1. Kimlik (Auth) tablosundan ID'yi bul ve profile tablosuna ZORLA yaz
insert into public.profiles (id, email, role)
select id, email, 'super_admin'
from auth.users
where email ilike 'orkunserhan@gmail.com' -- Büyük/küçük harf farketmeksizin bul
on conflict (id) do update
set role = 'super_admin';

-- 2. Kontrol Et
select * from public.profiles where email ilike 'orkunserhan@gmail.com';
