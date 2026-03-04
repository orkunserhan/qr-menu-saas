
-- 1. Analytics Events Table
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  event_type text not null, -- 'view_product', 'add_to_cart', 'order'
  session_id text, -- fingerprint or cookie id
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.analytics_events enable row level security;

-- Public can insert (stats logging)
create policy "Allow public insert stats"
on public.analytics_events for insert with check (true);

-- Owners can view stats
create policy "Allow owners view stats"
on public.analytics_events for select using (
    auth.uid() in (select owner_id from public.restaurants where id = analytics_events.restaurant_id)
);
