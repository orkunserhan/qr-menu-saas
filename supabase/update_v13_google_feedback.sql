
-- 1. Add Google Review URL to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS google_review_url text;

-- 2. Add status to feedback for approval workflow
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- pending, approved, archived

-- 3. Ensure birth_date is in profiles (just in case v11 didnt run or we need it)
-- This is already in v11 but safe to rerun with if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date date;
    END IF;
END $$;
