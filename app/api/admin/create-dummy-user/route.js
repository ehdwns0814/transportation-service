import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Target user ID to check/create
    const targetUserId = '17613cf4-c67c-48da-a608-0dfe57143b1d';
    
    // Check if user exists in auth.users table
    const { data: existingAuthUser, error: authError } = await supabase
      .from('auth_users_view') // Assuming a view exists that can access auth.users information
      .select('id, email')
      .eq('id', targetUserId)
      .maybeSingle();
    
    // Check if user exists in profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();
    
    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error checking profile', 
        error: profileError.message 
      }, { status: 500 });
    }
    
    // If profile already exists, return it
    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists', 
        profile: existingProfile,
        authUserExists: !!existingAuthUser
      });
    }
    
    // Create profile if it doesn't exist
    const defaultName = 'Default User';
    const defaultEmail = 'dummy@example.com';
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([{ 
        user_id: targetUserId,
        name: defaultName,
        email: existingAuthUser?.email || defaultEmail,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (createError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create profile', 
        error: createError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully', 
      profile: newProfile,
      authUserExists: !!existingAuthUser
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
} 