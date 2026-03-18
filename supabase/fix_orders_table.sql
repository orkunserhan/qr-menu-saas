-- 1. Ensure `orders` table has `payment_status` column
alter table public.orders 
add column if not exists payment_status text default 'unpaid';

-- 2. Add the check constraint if it doesn't exist
do $$
begin
    if not exists (
        select 1 
        from pg_constraint 
        where conname = 'check_payment_status'
    ) then
        alter table public.orders 
        add constraint check_payment_status 
        check (payment_status in ('unpaid', 'paid', 'refunded', 'failed'));
    end if;
end
$$;

-- 3. Reload schema cache (Fixes "Could not find column" errors)
NOTIFY pgrst, 'reload schema';
