-- Create waiter_calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id TEXT, -- Might be a string like 'Masa 1' or UUID, keeping as TEXT for flexibility based on previous code
    type TEXT NOT NULL, -- 'waiter', 'bill', 'order', 'other'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Owners can manage waiter calls' AND tablename = 'waiter_calls'
    ) THEN
        CREATE POLICY "Owners can manage waiter calls" ON public.waiter_calls FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.restaurants 
                WHERE id = public.waiter_calls.restaurant_id AND owner_id = auth.uid()
            ) OR public.is_admin()
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert waiter calls' AND tablename = 'waiter_calls'
    ) THEN
        CREATE POLICY "Public can insert waiter calls" ON public.waiter_calls FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
