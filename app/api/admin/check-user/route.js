import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // The specific user ID we want to check for
  const userId = '599dc79e-fd79-42b2-82a0-0aaca312d9ec';
  
  try {
    // First check if the user exists in auth.users
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !user) {
      console.error('Error or user not found:', authError);
      
      // First, let's check the profiles table structure to see what fields exist
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (tableError) {
        return NextResponse.json({ 
          success: false, 
          message: '프로필 테이블 구조 확인 실패', 
          error: tableError.message 
        }, { status: 500 });
      }
      
      // Create a profile with just the required fields
      try {
        const profileData = {
          user_id: userId,
          name: '테스트 사용자',
          // Only add fields that exist in the table structure
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add email field if it exists in the table
        if (tableInfo && tableInfo.length > 0 && tableInfo[0].hasOwnProperty('email')) {
          profileData.email = 'test@example.com';
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData)
          .select();
          
        if (profileError) {
          return NextResponse.json({ 
            success: false, 
            message: '더미 사용자 프로필 생성 실패', 
            error: profileError.message 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: '더미 사용자 프로필이 생성되었습니다 (인증 없음)',
          data: profile 
        }, { status: 201 });
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          message: '더미 사용자 생성 중 오류 발생', 
          error: error.message 
        }, { status: 500 });
      }
    }
    
    // User exists, check if they have a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // User exists in auth but has no profile, create one
        const { data: tableInfo } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        const profileData = {
          user_id: userId,
          name: '테스트 사용자',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add email field if it exists in the table
        if (tableInfo && tableInfo.length > 0 && tableInfo[0].hasOwnProperty('email')) {
          profileData.email = user?.email || 'test@example.com';
        }
        
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .upsert(profileData)
          .select();
          
        if (newProfileError) {
          return NextResponse.json({ 
            success: false, 
            message: '사용자 프로필 생성 실패', 
            error: newProfileError.message 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: '사용자 프로필이 생성되었습니다', 
          data: newProfile 
        }, { status: 201 });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: '프로필 확인 중 오류 발생', 
          error: profileError.message 
        }, { status: 500 });
      }
    }
    
    // User and profile both exist
    return NextResponse.json({ 
      success: true, 
      message: '사용자가 이미 존재합니다', 
      data: { 
        user: {
          id: user.id,
          email: user.email
        }, 
        profile 
      }
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: '사용자 확인 중 오류 발생', 
      error: error.message 
    }, { status: 500 });
  }
} 