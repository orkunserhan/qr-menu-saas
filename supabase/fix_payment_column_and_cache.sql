-- 1. Ensure 'is_payment_enabled' exists
alter table public.restaurants 
add column if not exists is_payment_enabled boolean default false;

-- 2. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
