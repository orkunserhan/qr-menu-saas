-- 1. Restoranlara Kapak Fotoğrafı Ekle
alter table public.restaurants 
add column if not exists cover_image_url text;

-- 2. Sistem Hata Logları Tablosu (Superadmin için)
create table if not exists public.system_logs (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  level text default 'error', -- 'error', 'warning', 'info'
  message text not null,
  stack_trace text,
  metadata jsonb, -- Ekstra veriler
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Logları sadece admin görebilsin (RLS)
alter table public.system_logs enable row level security;

create policy "Superadmin logları görebilir"
on public.system_logs for select
to authenticated
using (
  (select allow_super_admin from public.profiles where id = auth.uid()) = true
);
