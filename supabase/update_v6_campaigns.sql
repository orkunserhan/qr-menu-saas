-- Restoranlara Kampanya/Duyuru Özelliği Ekleme
alter table public.restaurants 
add column if not exists campaign_title text, -- Kampanya Başlığı (Örn: Mutlu Cuma!)
add column if not exists campaign_text text, -- Kampanya İçeriği (Örn: Tatlı alana çay ikram)
add column if not exists is_campaign_active boolean default false; -- Kampanya Gösterilsin mi?
