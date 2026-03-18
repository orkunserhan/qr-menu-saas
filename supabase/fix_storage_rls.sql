-- 1. Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- 2. Drop existing policies to avoid duplicates
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Auth Delete" on storage.objects;

-- 3. Create policies for the menu-images bucket
-- Herkes menü resimlerini görebilir
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'menu-images' );

-- Sadece giriş yapmış kullanıcılar resim yükleyebilir
create policy "Auth Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'menu-images' );

-- Kullanıcılar resim güncelleyebilir
create policy "Auth Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'menu-images' );

-- Kullanıcılar resim silebilir
create policy "Auth Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'menu-images' );
