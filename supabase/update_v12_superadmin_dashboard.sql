-- 1. Abonelik ile ilgili alanları ekle (Eğer yoksa)
alter table public.restaurants 
add column if not exists subscription_end_date date,
add column if not exists subscription_plan text default 'free'; -- 'free', 'pro_monthly', 'pro_yearly'

-- 2. İstatistik Görünümü (Advanced Dashboard için)
-- admin_restaurant_stats view'ı, dashboard sayfasında kullanılan ana veri kaynağıdır.
create or replace view public.admin_restaurant_stats as
select 
    r.id,
    r.name,
    r.slug,
    r.owner_id,
    r.is_active,
    r.created_at,
    r.subscription_end_date,
    r.subscription_plan,
    (select email from profiles where id = r.owner_id limit 1) as owner_email,
    (select count(*) from products where restaurant_id = r.id) as total_products,
    (select count(*) from categories where restaurant_id = r.id) as total_categories,
    (select count(*) from feedback where restaurant_id = r.id) as total_feedback
from restaurants r;
