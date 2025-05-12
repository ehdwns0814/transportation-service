-- SQL script for creating users table and setting up auth sync
-- This can be run directly in the Supabase SQL Editor

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
        -- Print table structure to help understand the schema
        RAISE NOTICE 'Current profiles table structure:';
        FOR r IN (
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles'
            ORDER BY ordinal_position
        ) LOOP
            RAISE NOTICE '  % (%) %', r.column_name, r.data_type, CASE WHEN r.is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END;
        END LOOP;
    ELSE
        RAISE NOTICE 'Creating new public.users table...';
        
        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            name TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ
        );

        -- Add RLS policies
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own record" ON public.users
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update their own record" ON public.users
            FOR UPDATE USING (auth.uid() = id);
            
        -- Grant access
        GRANT SELECT ON public.users TO anon, authenticated;
        GRANT UPDATE (name, email) ON public.users TO authenticated;
        
        RAISE NOTICE 'public.users table created successfully.';
    END IF;
END $$;

-- Create function to handle new user creation
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
        -- Insert into profiles table
        INSERT INTO public.profiles (user_id, email, created_at)
        VALUES (NEW.id, NEW.email, NOW())
        ON CONFLICT (user_id) DO NOTHING;
        RAISE NOTICE 'User % added to profiles table', NEW.id;
    ELSE
        -- Insert into users table
        INSERT INTO public.users (id, email, created_at)
        VALUES (NEW.id, NEW.email, NOW())
        ON CONFLICT (id) DO NOTHING;
        RAISE NOTICE 'User % added to users table', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users
DO $$
DECLARE
    profiles_exists BOOLEAN;
    users_exists BOOLEAN;
    user_count INTEGER := 0;
    skip_count INTEGER := 0;
    auth_user RECORD;
BEGIN
    -- Check which tables exist
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
    ) INTO profiles_exists;
    
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
                BEGIN
                    INSERT INTO public.profiles (user_id, email, created_at)
                    VALUES (auth_user.id, auth_user.email, COALESCE(auth_user.created_at, NOW()));
                    user_count := user_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    RAISE WARNING 'Could not insert user % into profiles: %', auth_user.id, SQLERRM;
                END;
            ELSE
                skip_count := skip_count + 1;
            END IF;
        ELSIF users_exists THEN
            -- Check if user exists in users
            IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
                -- Add to users
                BEGIN
                    INSERT INTO public.users (id, email, created_at)
                    VALUES (auth_user.id, auth_user.email, COALESCE(auth_user.created_at, NOW()));
                    user_count := user_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    RAISE WARNING 'Could not insert user % into users: %', auth_user.id, SQLERRM;
                END;
            ELSE
                skip_count := skip_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Backfilled % users, skipped % existing users', user_count, skip_count;
END $$; 