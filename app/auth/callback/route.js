import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Check if user has a profile
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        // If user has a profile, redirect to profile page, otherwise to onboarding
        if (profile) {
          return NextResponse.redirect(new URL(`/profile/${session.user.id}`, req.url));
        } else {
          // No profile found, redirect to onboarding
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      } catch (err) {
        console.error('Error fetching profile:', err.message);
        // If we can't determine if the user has a profile, redirect to onboarding
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }
  }
  
  // If no code or session, redirect to the login page
  return NextResponse.redirect(new URL('/login', req.url));
} 