-- This migration creates a public.users table and sets up a trigger to sync with auth.users
-- It also handles the case where profiles table is already being used

-- Check if profiles table exists in the public schema
DO $$
DECLARE
    profiles_exists BOOLEAN;
BEGIN
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
    ) INTO profiles_exists;

    IF profiles_exists THEN
        RAISE NOTICE 'The profiles table already exists. Using profiles table instead of creating users table.';
    ELSE
        RAISE NOTICE 'Creating new public.users table...';
        
        -- Create the public.users table
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            name TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ
        );

        -- Add RLS policies
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Grant access to authenticated users
        CREATE POLICY "Users can view their own record" ON public.users
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update their own record" ON public.users
            FOR UPDATE USING (auth.uid() = id);
            
        -- Grant public access
        GRANT SELECT ON public.users TO anon, authenticated;
        GRANT UPDATE (name, email) ON public.users TO authenticated;
    END IF;
END $$;

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profiles_exists BOOLEAN;
BEGIN
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
    ) INTO profiles_exists;

    IF profiles_exists THEN
        -- Check if a profile already exists for this user
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
            -- Insert into profiles instead
            INSERT INTO public.profiles (user_id, email, created_at)
            VALUES (NEW.id, NEW.email, NOW());
            RAISE NOTICE 'User % added to profiles table', NEW.id;
        END IF;
    ELSE
        -- Check if a record already exists for this user
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
            -- Insert into users table
            INSERT INTO public.users (id, email, created_at)
            VALUES (NEW.id, NEW.email, NOW());
            RAISE NOTICE 'User % added to users table', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to automatically add users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add a function to backfill existing users
CREATE OR REPLACE FUNCTION public.backfill_users()
RETURNS TEXT AS $$
DECLARE
    profiles_exists BOOLEAN;
    users_exists BOOLEAN;
    user_count INTEGER := 0;
    skip_count INTEGER := 0;
    auth_user RECORD;
BEGIN
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
    ) INTO profiles_exists;
    
    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) INTO users_exists;
    
    -- Process each auth user
    FOR auth_user IN SELECT * FROM auth.users LOOP
        IF profiles_exists THEN
            -- Check if user exists in profiles
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth_user.id) THEN
                -- Add to profiles
                INSERT INTO public.profiles (user_id, email, created_at)
                VALUES (auth_user.id, auth_user.email, COALESCE(auth_user.created_at, NOW()));
                user_count := user_count + 1;
            ELSE
                skip_count := skip_count + 1;
            END IF;
        ELSIF users_exists THEN
            -- Check if user exists in users
            IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
                -- Add to users
                INSERT INTO public.users (id, email, created_at)
                VALUES (auth_user.id, auth_user.email, COALESCE(auth_user.created_at, NOW()));
                user_count := user_count + 1;
            ELSE
                skip_count := skip_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RETURN format('Backfilled %s users, skipped %s existing users', user_count, skip_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the backfill function to add existing users
SELECT public.backfill_users(); 