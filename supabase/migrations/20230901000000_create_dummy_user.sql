-- Create a function to handle dummy user creation
CREATE OR REPLACE FUNCTION create_dummy_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  result JSONB;
  has_email BOOLEAN;
BEGIN
  -- Check if the profiles table has an email column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) INTO has_email;
  
  IF has_email THEN
    -- Insert with email
    INSERT INTO profiles (user_id, name, email, role, created_at, updated_at)
    VALUES (
      p_user_id, 
      '테스트 사용자', 
      'test@example.com', 
      'user', 
      NOW(), 
      NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING to_jsonb(profiles.*) INTO result;
  ELSE
    -- Insert without email
    INSERT INTO profiles (user_id, name, role, created_at, updated_at)
    VALUES (
      p_user_id, 
      '테스트 사용자', 
      'user', 
      NOW(), 
      NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING to_jsonb(profiles.*) INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- Execute the function to create the dummy user
SELECT create_dummy_user('599dc79e-fd79-42b2-82a0-0aaca312d9ec'); 