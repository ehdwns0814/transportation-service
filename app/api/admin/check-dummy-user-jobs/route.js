import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Target user ID to check
    const targetUserId = '17613cf4-c67c-48da-a608-0dfe57143b1d';
    
    // Check if profile exists for the dummy user
    const { data: profileExists, error: profileError } = await supabase
      .rpc('check_profile_exists', { p_user_id: targetUserId });
    
    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error checking profile', 
        error: profileError.message 
      }, { status: 500 });
    }
    
    // Count jobs assigned to this user
    const { count: jobCount, error: jobError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', targetUserId);
    
    if (jobError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error counting jobs', 
        error: jobError.message 
      }, { status: 500 });
    }
    
    // Count total jobs
    const { count: totalJobs, error: totalError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true });
    
    if (totalError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error counting total jobs', 
        error: totalError.message 
      }, { status: 500 });
    }
    
    // Get some sample jobs with the dummy user
    const { data: sampleJobs, error: sampleError } = await supabase
      .from('jobs')
      .select('id, title, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    return NextResponse.json({
      success: true,
      profileExists,
      jobCount,
      totalJobs,
      percentage: (jobCount / totalJobs * 100).toFixed(2) + '%',
      sampleJobs: sampleError ? [] : sampleJobs
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
} 