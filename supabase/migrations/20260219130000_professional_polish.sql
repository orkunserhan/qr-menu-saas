-- PROFESSIONAL POLISH MIGRATION

-- 1. INDEXES FOR PERFORMANCE
-- Frequent filtering on restaurant_id is common in this multi-tenant app
create index if not exists idx_orders_restaurant_id on public.orders(restaurant_id);
create index if not exists idx_products_restaurant_id on public.products(restaurant_id);
create index if not exists idx_categories_restaurant_id on public.categories(restaurant_id);
create index if not exists idx_waiter_calls_restaurant_id on public.waiter_calls(restaurant_id);

-- FK Indexes for Joins
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_products_category_id on public.products(category_id);

-- Status filtering indexes (Active orders dashboard uses this heavily)
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_waiter_calls_status on public.waiter_calls(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- 2. UPDATED_AT TRIGGER FUNCTION
-- Standard reusable function to auto-update updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. APPLY TRIGGERS (Safe to run multiple times, drop if exists first)
drop trigger if exists on_order_updated on public.orders;
create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_product_updated on public.products;
create trigger on_product_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_restaurant_updated on public.restaurants;
create trigger on_restaurant_updated
  before update on public.restaurants
  for each row execute procedure public.handle_updated_at();

-- 4. DATA INTEGRITY
-- Ensure payment_status has valid values
alter table public.orders 
add constraint check_payment_status 
check (payment_status in ('unpaid', 'paid', 'refunded', 'failed'));

-- Ensure order status has valid values
alter table public.orders 
add constraint check_order_status 
check (status in ('pending', 'preparing', 'served', 'paid', 'cancelled'));

-- Ensure order_items structure exists for robustness
alter table public.order_items 
add column if not exists options jsonb, -- Store options as JSON for flexibility
add column if not exists price_at_time numeric, -- Log price at time of order for history
add column if not exists order_id uuid references public.orders(id) on delete cascade;

-- 5. ANALYTICS HELPER (View for easier reporting)
create or replace view public.restaurant_daily_summary as
select 
  restaurant_id,
  date(created_at) as day,
  count(*) as total_orders,
  sum(total_amount) as total_revenue,
  count(case when status = 'cancelled' then 1 end) as cancelled_orders
from public.orders
group by restaurant_id, date(created_at);
