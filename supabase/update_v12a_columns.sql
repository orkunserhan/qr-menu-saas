-- ÖNCE BU KODU ÇALIŞTIRIN (Tabloya kolonları ekler)
alter table public.restaurants 
add column if not exists subscription_end_date date,
add column if not exists subscription_plan text default 'free';
