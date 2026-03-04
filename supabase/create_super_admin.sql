-- 1. Önce eski kaydı temizleyelim (varsa)
delete from public.profiles where email = 'orkunserhan@gmail.com';
delete from auth.users where email = 'orkunserhan@gmail.com';

-- 2. Yeni Kullanıcı Oluştur (Supabase Auth tablosuna manuel ekleme)
-- Şifre hashleme karmaşık olduğu için, SQL ile doğrudan kullanıcı eklemek yerine
-- "Authentication" panelinden kullanıcı eklemeniz daha sağlıklıdır. 
-- Ancak kullanıcıyı panelden ekledikten sonra şu kodu çalıştırarak yetki verebilirsiniz:

-- (Kullanıcıyı panelden eklediğinizi varsayarak yetki veriyorum)
insert into public.profiles (id, email, role)
select id, email, 'super_admin'
from auth.users
where email = 'orkunserhan@gmail.com'
on conflict (id) do update set role = 'super_admin';
