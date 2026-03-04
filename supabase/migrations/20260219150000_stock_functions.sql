-- FUNCTION: INCREMENT STOCK (FOR ROLLBACKS)
create or replace function public.increment_stock(p_id uuid, quantity integer)
returns void as $$
begin
  update public.products
  set stock_quantity = stock_quantity + quantity,
      is_available = (stock_quantity + quantity) > 0 -- Re-enable if > 0
  where id = p_id and track_stock = true;
end;
$$ language plpgsql;

-- FUNCTION: DECREMENT STOCK (ATOMIC TRANSACTION HELPER)
-- This is safer than doing it in JS because it locks the row
create or replace function public.decrement_stock(p_id uuid, quantity integer)
returns boolean as $$
declare
  current_stock integer;
begin
  -- Check current stock with FOR UPDATE to lock row
  select stock_quantity into current_stock
  from public.products
  where id = p_id and track_stock = true
  for update;

  if current_stock is null then
     return true; -- Not tracking stock
  end if;

  if current_stock < quantity then
     return false; -- Not enough stock
  end if;

  update public.products
  set stock_quantity = stock_quantity - quantity,
      is_available = (stock_quantity - quantity) > 0
  where id = p_id;
  
  return true;
end;
$$ language plpgsql;
