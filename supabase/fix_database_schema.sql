-- 1. EKSİK KOLONLARI EKLE (Restoran Tablosu)
-- Her ihtimale karşı 'if not exists' kullanıyoruz ki zaten varsa hata vermesin.
alter table public.restaurants 
add column if not exists cover_image_url text,
add column if not exists owner_name text,
add column if not exists company_name text,
add column if not exists feedback_email text;

-- 2. SİSTEM LOGLARI (Sadece Super Admin Görsün)
create table if not exists public.system_logs (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  level text default 'error', 
  message text not null,
  stack_trace text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Aç
alter table public.system_logs enable row level security;

-- (Varsa eski hatalı politikayı sil)
drop policy if exists "Superadmin logları görebilir" on public.system_logs;

-- DÜZELTİLMİŞ POLİTİKA: (allow_super_admin yerine 'role' kontrolü)
create policy "Superadmin logları görebilir"
on public.system_logs for select
to authenticated
using (
  (select role from public.profiles where id = auth.uid()) = 'super_admin'
);

-- 3. PERSONEL TABLOSU
create table if not exists public.restaurant_staff (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text not null,
  role text not null,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.restaurant_staff enable row level security;

-- Politikalar
drop policy if exists "Adminler personel ekleyebilir" on public.restaurant_staff;
create policy "Adminler personel ekleyebilir" on public.restaurant_staff
  for all using (auth.uid() in (select owner_id from public.restaurants where id = restaurant_id));

-- 4. GERİ BİLDİRİM (FEEDBACK) TABLOSU
create table if not exists public.feedback (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  customer_contact text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

-- Politikalar
drop policy if exists "Herkes yorum yazabilir" on public.feedback;
create policy "Herkes yorum yazabilir" on public.feedback
  for insert with check (true);

drop policy if exists "Adminler yorumları okuyabilir" on public.feedback;
create policy "Adminler yorumları okuyabilir" on public.feedback
  for select using (auth.uid() in (select owner_id from public.restaurants where id = restaurant_id));
