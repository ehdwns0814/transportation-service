-- Check if profiles table exists in the public schema
SELECT EXISTS (
   SELECT 1
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);

-- Get structure of profiles table if it exists
SELECT 
    column_name, 
    data_type,
    is_nullable 
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position; 