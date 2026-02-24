-- 1. Kullanıcı Rolleri için Profil Tablosu
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text default 'restaurant_owner' check (role in ('super_admin', 'restaurant_owner')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Profiles)
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin')
);

-- Yeni kullanıcı oluştuğunda otomatik profil oluşturma Trigger'ı
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'restaurant_owner');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger'ı bağla (Eğer varsa önce sil)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Restoran Tablosuna "Anlık Açık/Kapalı" durumu ekle
-- is_active: Lisans/Sistem durumu (Admin yönetir)
-- is_open: Günlük operasyonel durum (Restoran sahibi yönetir)
alter table public.restaurants 
add column if not exists is_open boolean default true;

-- 3. RLS Politikalarını Güncelle (Admin vs Owner Ayırımı)

-- Yardımcı Fonksiyon: Admin mi?
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'super_admin'
  );
end;
$$ language plpgsql security definer;

-- Mevcut politikaları temizleyelim (yeni mantıkla baştan yazacağız)
drop policy if exists "Owners can view own restaurants" on public.restaurants;
drop policy if exists "Owners can insert own restaurants" on public.restaurants;
drop policy if exists "Owners can update own restaurants" on public.restaurants;

-- YENİ POLİTİKALAR (Restaurants)

-- Select: Admin her şeyi görür, Owner sadece kendininkini, Public sadece 'is_active=true' olanları (menü)
create policy "Admin can view all" 
on public.restaurants for select 
using (public.is_admin());

create policy "Owner can view own" 
on public.restaurants for select 
using (owner_id = auth.uid());

create policy "Public can view active" 
on public.restaurants for select 
using (is_active = true); 

-- Update: 
-- Admin her şeyi güncelleyebilir.
-- Owner sadece kendi restoranını güncelleyebilir (ama is_active ve subscription_end_date sütunlarını client tarafında gizleyeceğiz ve API'de koruyacağız, RLS update kısıtlaması karmaşık olduğu için genelde row-based yeterlidir, column-based logic server code'da yapılır).
create policy "Admin can update all" 
on public.restaurants for update 
using (public.is_admin());

create policy "Owner can update own" 
on public.restaurants for update 
using (owner_id = auth.uid());

-- Delete: Sadece Admin silebilir
create policy "Admin can delete" 
on public.restaurants for delete 
using (public.is_admin());

-- Insert: Admin ekleyebilir, Owner ekleyebilir (kendi restoranını oluşturma senaryosu)
create policy "Authenticated can insert" 
on public.restaurants for insert 
with check (auto.uid() = owner_id or public.is_admin());

-- Manuel Admin Atama (Bu sorguyu kendiniz için bir kere çalıştırmalısınız)
-- update public.profiles set role = 'super_admin' where email = 'sizin@emailiniz.com';
