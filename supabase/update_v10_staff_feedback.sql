-- 1. Restoran Tablosuna Yeni Alanlar (Kurumsal & Bildirim)
alter table public.restaurants 
add column if not exists owner_name text,
add column if not exists company_name text,
add column if not exists feedback_email text; -- Yorumların gideceği mail adresi

-- 2. Personel Tablosu
create table if not exists public.restaurant_staff (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text not null,
  role text not null, -- 'Garson', 'Şef', 'Barista' vb.
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Müşteri Geri Bildirimleri (Feedback)
create table if not exists public.feedback (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  customer_contact text, -- Müşteri isterse mail/tel bırakır
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Politikaları (Standard Admin Erişimi)
alter table public.restaurant_staff enable row level security;
alter table public.feedback enable row level security;

create policy "Adminler personel ekleyebilir" on public.restaurant_staff
  for all using (auth.uid() in (select owner_id from public.restaurants where id = restaurant_id));

create policy "Herkes yorum yazabilir" on public.feedback
  for insert with check (true);

create policy "Adminler yorumları okuyabilir" on public.feedback
  for select using (auth.uid() in (select owner_id from public.restaurants where id = restaurant_id));
