-- Create a function to check if a profile exists for a specific user_id
CREATE OR REPLACE FUNCTION check_profile_exists(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with definer's privileges, bypassing RLS
AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM profiles
        WHERE user_id = p_user_id
    ) INTO profile_exists;
    
    RETURN profile_exists;
END;
$$;

-- Create a function to create a profile for a user if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_profile_exists(
    p_user_id UUID,
    p_name TEXT DEFAULT 'Default User',
    p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with definer's privileges, bypassing RLS
AS $$
DECLARE
    profile_exists BOOLEAN;
    profile_data JSONB;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(
        SELECT 1
        FROM profiles
        WHERE user_id = p_user_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        -- Return existing profile
        SELECT 
            jsonb_build_object(
                'exists', true,
                'created', false,
                'profile', row_to_json(p)::jsonb
            )
        INTO profile_data
        FROM profiles p
        WHERE p.user_id = p_user_id;
    ELSE
        -- Create new profile
        INSERT INTO profiles (
            user_id,
            name,
            email,
            created_at
        )
        VALUES (
            p_user_id,
            p_name,
            p_email,
            NOW()
        )
        RETURNING 
            jsonb_build_object(
                'exists', false,
                'created', true,
                'profile', row_to_json(profiles)::jsonb
            ) INTO profile_data;
    END IF;
    
    RETURN profile_data;
END;
$$; 