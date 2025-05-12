import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Create a SQL function that bypasses RLS to create a dummy user profile
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION create_dummy_user(p_user_id UUID)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER -- This allows the function to bypass RLS
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        -- Check if the profiles table has an email column
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = 'email'
        ) THEN
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
    `;
    
    // Execute the function creation query
    try {
      const { error: funcError } = await supabase.rpc(
        'exec_sql',
        { sql_query: createFunctionQuery }
      );
      
      if (funcError) {
        console.error('Failed to create function via RPC:', funcError);
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to create function via RPC', 
          error: funcError.message 
        }, { status: 500 });
      }
      
      // Function created, now call it to create the dummy user
      const userId = '599dc79e-fd79-42b2-82a0-0aaca312d9ec';
      
      const { data, error } = await supabase.rpc('create_dummy_user', { p_user_id: userId });
      
      if (error) {
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to create dummy user', 
          error: error.message 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '더미 사용자가 생성되었습니다', 
        data 
      }, { status: 201 });
      
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error executing SQL function', 
        error: error.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
} 