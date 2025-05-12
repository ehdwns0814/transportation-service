-- Ensure jobs table has the user_id column
DO $$
BEGIN
    -- Check if user_id column exists in jobs table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'user_id'
    ) THEN
        -- Add user_id column if it doesn't exist
        ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to jobs table';
    ELSE
        RAISE NOTICE 'user_id column already exists in jobs table';
    END IF;
END $$;

-- Ensure dummy user exists in profiles table before any operations
DO $$
DECLARE
    dummy_user_id UUID := '17613cf4-c67c-48da-a608-0dfe57143b1d';
BEGIN
    -- Check if profile exists for dummy user
    IF NOT EXISTS (
        SELECT 1
        FROM profiles
        WHERE user_id = dummy_user_id
    ) THEN
        -- Create profile for dummy user if it doesn't exist
        BEGIN
            INSERT INTO profiles (user_id, name, created_at)
            VALUES (dummy_user_id, 'Dummy User', NOW());
            RAISE NOTICE 'Created profile for dummy user';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create dummy user profile: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Dummy user profile already exists';
    END IF;
END $$;

-- Create a function to fix jobs without author IDs
CREATE OR REPLACE FUNCTION fix_missing_author_ids()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
    dummy_user_id UUID := '17613cf4-c67c-48da-a608-0dfe57143b1d';
    jobs_count INTEGER;
    fixed_count INTEGER := 0;
    result TEXT;
BEGIN
    -- Check dummy user exists
    IF NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = dummy_user_id
    ) THEN
        RETURN 'Error: Dummy user does not exist in profiles table';
    END IF;

    -- Count jobs without user_id
    SELECT COUNT(*) INTO jobs_count
    FROM jobs
    WHERE user_id IS NULL;
    
    -- Update jobs that have created_by_email but no user_id
    -- Try to find matching user by email
    WITH email_matches AS (
        UPDATE jobs j
        SET user_id = u.id
        FROM auth.users u
        WHERE j.created_by_email = u.email
        AND j.user_id IS NULL
        RETURNING j.id
    )
    SELECT COUNT(*) INTO fixed_count FROM email_matches;
    
    -- For remaining jobs without user_id, set to the dummy user
    WITH remaining_fixes AS (
        UPDATE jobs
        SET user_id = dummy_user_id
        WHERE user_id IS NULL
        RETURNING id
    )
    SELECT fixed_count + COUNT(*) INTO fixed_count FROM remaining_fixes;
    
    -- Set result message
    result := format('Found %s jobs without user_id, fixed %s jobs', jobs_count, fixed_count);
    
    RETURN result;
END;
$$;

-- Run the function to fix missing author IDs
SELECT fix_missing_author_ids();

-- Add a constraint to make user_id NOT NULL for future inserts
ALTER TABLE jobs
ALTER COLUMN user_id SET NOT NULL;

-- Create a trigger to ensure user_id is set on insert
CREATE OR REPLACE FUNCTION ensure_job_has_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        -- If no user_id is provided, use the current authenticated user
        NEW.user_id := auth.uid();
        
        -- If still NULL (e.g., triggered outside of auth context), use the dummy user
        IF NEW.user_id IS NULL THEN
            NEW.user_id := '17613cf4-c67c-48da-a608-0dfe57143b1d';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_job_author_trigger ON jobs;

-- Create the trigger
CREATE TRIGGER ensure_job_author_trigger
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION ensure_job_has_author(); 