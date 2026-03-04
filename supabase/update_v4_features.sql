-- 1. Restaurants tablosu güncellemeleri (Sosyal Medya ve Ayarlar)
alter table public.restaurants 
add column if not exists social_instagram text,
add column if not exists social_twitter text,
add column if not exists social_facebook text,
add column if not exists show_calories boolean default true,
add column if not exists show_preparation_time boolean default true;

-- 2. Products tablosu güncellemeleri (Video ve Detaylar)
alter table public.products 
add column if not exists video_url text, -- Youtube/Vimeo link
add column if not exists calories integer, -- Kalori (kcal)
add column if not exists preparation_time integer; -- Dakika cinsinden

-- 3. Geri Bildirim (Feedback) Sistemi
create table if not exists public.feedbacks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  customer_contact text, -- İsteğe bağlı email/telefon
  is_read boolean default false -- Okundu bilgisi
);

-- RLS (Feedback)
alter table public.feedbacks enable row level security;

-- Herkes yorum yazabilir
create policy "Public can insert feedback" 
on public.feedbacks for insert 
with check (true);

-- Sadece restoran sahibi kendi restoranına gelen yorumları görebilir
create policy "Owners can view their restaurant feedbacks" 
on public.feedbacks for select 
using (
  exists (
    select 1 from public.restaurants
    where id = public.feedbacks.restaurant_id
    and owner_id = auth.uid()
  )
);
