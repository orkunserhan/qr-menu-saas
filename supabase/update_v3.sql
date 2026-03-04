-- 1. Google Maps ve Abonelik Alanlarını Ekle
alter table public.restaurants 
add column if not exists google_place_id text, -- Google yorum linki veya ID'si
add column if not exists subscription_end_date timestamp with time zone default (now() + interval '3 months'); -- Varsayılan 3 ay

-- Not: Dondurma işlemi için subscription_end_date alanını geçmiş bir tarih yapmak yeterlidir.
