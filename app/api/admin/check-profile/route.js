import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Target user ID to check
    const targetUserId = '17613cf4-c67c-48da-a608-0dfe57143b1d';
    
    // First check if the profile exists
    const { data: existsResult, error: existsError } = await supabase
      .rpc('check_profile_exists', { p_user_id: targetUserId });
    
    if (existsError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error checking if profile exists', 
        error: existsError.message 
      }, { status: 500 });
    }
    
    // If profile exists, we're done
    if (existsResult === true) {
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Profile exists'
      });
    }
    
    // Profile doesn't exist, create it
    const { data: ensureResult, error: ensureError } = await supabase
      .rpc('ensure_profile_exists', { 
        p_user_id: targetUserId,
        p_name: 'Dummy User'
      });
    
    if (ensureError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error ensuring profile exists', 
        error: ensureError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      result: ensureResult,
      message: ensureResult.created ? 'Profile created successfully' : 'Profile already exists'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
} 