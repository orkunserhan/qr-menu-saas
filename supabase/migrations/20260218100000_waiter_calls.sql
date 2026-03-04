
-- 1. Waiter Calls Table
create table if not exists public.waiter_calls (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  table_id text, -- Can be null or match table ID/Name
  type text not null, -- 'waiter', 'bill', 'order', 'other'
  status text default 'pending' not null, -- 'pending', 'completed', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.waiter_calls enable row level security;

-- Public can insert (request waiter)
create policy "Allow public insert waiter_calls"
on public.waiter_calls for insert with check (true);

-- Owners can view and update
create policy "Allow owners view waiter_calls"
on public.waiter_calls for select using (
    auth.uid() in (select owner_id from public.restaurants where id = waiter_calls.restaurant_id)
);

create policy "Allow owners update waiter_calls"
on public.waiter_calls for update using (
    auth.uid() in (select owner_id from public.restaurants where id = waiter_calls.restaurant_id)
);
