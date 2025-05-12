import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // 작성자 정보 확인
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }
    
    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다' }, { status: 403 });
    }
    
    // 관리자만 실행 가능
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }
    
    // 작성자 ID가 없는 게시물 수 조회
    const { count: missingCount, error: countError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .is('user_id', null);
      
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    
    // 더미 사용자 ID
    const dummyUserId = '17613cf4-c67c-48da-a608-0dfe57143b1d';
    
    // 더미 사용자 존재 여부 확인
    const { data: dummyUserExists, error: dummyUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', dummyUserId)
      .maybeSingle();
      
    let dummyUserStatus = '더미 사용자 확인 불가';
    
    if (dummyUserError) {
      dummyUserStatus = `더미 사용자 확인 중 오류: ${dummyUserError.message}`;
    } else if (!dummyUserExists) {
      dummyUserStatus = '더미 사용자가 존재하지 않습니다';
      
      // 더미 사용자 프로필 생성
      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          user_id: dummyUserId,
          name: 'Dummy User',
          created_at: new Date().toISOString()
        }]);
        
      if (createError) {
        dummyUserStatus = `더미 사용자 생성 중 오류: ${createError.message}`;
      } else {
        dummyUserStatus = '더미 사용자를 생성했습니다';
      }
    } else {
      dummyUserStatus = '더미 사용자가 존재합니다';
    }
    
    // 작성자 ID가 없는 게시물이 없으면 바로 성공 반환
    if (missingCount === 0) {
      return NextResponse.json({
        success: true,
        message: '모든 게시물에 작성자 ID가 있습니다',
        missingCount: 0,
        dummyUserStatus
      });
    }
    
    // 마이그레이션 함수 실행 (fix_missing_author_ids 함수가 이미 정의되어 있어야 함)
    try {
      const { data: fixResult, error: fixError } = await supabase.rpc('fix_missing_author_ids');
      
      if (fixError) {
        return NextResponse.json({ 
          error: '게시물 수정 중 오류가 발생했습니다', 
          details: fixError.message 
        }, { status: 500 });
      }
      
      // 수정 후 남은 작성자 ID 없는 게시물 수 확인
      const { count: remainingCount, error: remainingError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .is('user_id', null);
        
      if (remainingError) {
        return NextResponse.json({ error: remainingError.message }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: `작성자 ID가 없는 ${missingCount}개 게시물 중 ${missingCount - remainingCount}개가 수정되었습니다`,
        initialCount: missingCount,
        remainingCount: remainingCount,
        fixResult,
        dummyUserStatus
      });
    } catch (error) {
      return NextResponse.json({ 
        error: '게시물 수정 중 오류가 발생했습니다', 
        details: error.message 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다', 
      details: error.message 
    }, { status: 500 });
  }
} 