-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles;

-- Create the updated profiles table with all form fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL,
    
    -- Common fields
    phone VARCHAR(20),
    description TEXT,
    
    -- Driver-specific fields
    name VARCHAR(255),
    vehicle_type VARCHAR(50),
    license_number VARCHAR(50),
    experience_years INTEGER,
    preferred_area TEXT,
    can_long_distance BOOLEAN DEFAULT FALSE,
    
    -- Agency-specific fields
    agency_name VARCHAR(255),
    business_number VARCHAR(50),
    representative_name VARCHAR(255),
    address TEXT,
    company_size VARCHAR(50),
    service_areas TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add comment to the table
COMMENT ON TABLE public.profiles IS 'Stores user profile information for both drivers and agencies';

-- Update RPC function
CREATE OR REPLACE FUNCTION public.create_profiles_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function is now just a stub since table existence is handled directly above
    RETURN;
END;
$$;

-- Set up Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id); 