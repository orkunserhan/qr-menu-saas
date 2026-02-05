-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Restaurants Table
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  logo_url text,
  wifi_pass text,
  address text,
  is_active boolean default true
);

-- 2. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  order_index integer default 0
);

-- 3. Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.categories(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null, -- Denormalized for easier querying
  name text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  is_available boolean default true,
  tags text[], -- e.g. ['vegan', 'spicy']
  allergens text[] -- e.g. ['nuts', 'gluten']
);

-- RLS Policies (Simple start - Public read for now, will secure later)
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Allow public read access (for menu viewing)
create policy "Allow public read access on restaurants"
on public.restaurants for select using (true);

create policy "Allow public read access on categories"
on public.categories for select using (true);

create policy "Allow public read access on products"
on public.products for select using (true);
