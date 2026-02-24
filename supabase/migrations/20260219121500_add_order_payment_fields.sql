alter table "orders" 
add column if not exists "stripe_session_id" text,
add column if not exists "payment_status" text default 'unpaid';
