-- Önce mevcut tüm profilleri temizle (Test ortamı olduğu için)
-- DİKKAT: Bu işlem profil tablosunu sıfırlar ve trigger ile yeniden oluşturmasını sağlar
delete from public.profiles;

-- Trigger'ı tekrar tetikleyerek temiz profiller oluştur (Varsayılan: restaurant_owner)
insert into public.profiles (id, email, role)
select id, email, 'restaurant_owner'
from auth.users
on conflict (id) do nothing;

-- Şimdi admin@demo.com adresini KESİN olarak super_admin yap
update public.profiles
set role = 'super_admin'
where email = 'admin@demo.com';

-- SONUÇLARI KONTROL ET
select * from public.profiles where email = 'admin@demo.com';
