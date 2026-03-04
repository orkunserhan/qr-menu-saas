alter table "restaurants" 
add column if not exists "is_payment_enabled" boolean default false,
add column if not exists "stripe_account_id" text;
