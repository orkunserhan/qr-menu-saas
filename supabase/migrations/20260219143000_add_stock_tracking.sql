alter table "products" 
add column if not exists "track_stock" boolean default false,
add column if not exists "stock_quantity" integer default null;
