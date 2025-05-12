-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN ('driver', 'agency')),
  role VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  
  -- Driver-specific fields
  vehicle_type VARCHAR(50),
  license_number VARCHAR(50),
  experience_years INTEGER,
  preferred_area TEXT,
  can_long_distance BOOLEAN,
  
  -- Agency-specific fields
  agency_name VARCHAR(255),
  business_number VARCHAR(50),
  representative_name VARCHAR(255),
  address TEXT,
  company_size VARCHAR(50),
  service_areas TEXT,
  
  -- Common fields
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Function to create profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profiles_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN ('driver', 'agency')),
      role VARCHAR(50) NOT NULL,
      name VARCHAR(255),
      phone VARCHAR(50),
      
      -- Driver-specific fields
      vehicle_type VARCHAR(50),
      license_number VARCHAR(50),
      experience_years INTEGER,
      preferred_area TEXT,
      can_long_distance BOOLEAN,
      
      -- Agency-specific fields
      agency_name VARCHAR(255),
      business_number VARCHAR(50),
      representative_name VARCHAR(255),
      address TEXT,
      company_size VARCHAR(50),
      service_areas TEXT,
      
      -- Common fields
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      UNIQUE(user_id)
    );
    
    -- Create indexes
    CREATE INDEX idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX idx_profiles_profile_type ON profiles(profile_type);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own profile
DROP POLICY IF EXISTS "Users can view only their own profile" ON profiles;
CREATE POLICY "Users can view only their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own profile
DROP POLICY IF EXISTS "Users can update only their own profile" ON profiles;
CREATE POLICY "Users can update only their own profile" 
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE profiles_id_seq TO authenticated; 