'use client';

/**
 * 클라이언트 측 환경 변수 디버깅 유틸리티
 * 이 함수는 개발 환경에서만 사용하고, 프로덕션에서는 사용하지 마세요.
 * 공개 환경 변수의 설정 여부를 확인합니다.
 */
export function debugClientEnv() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('debugClientEnv는 개발 환경에서만 사용해야 합니다.');
    return null;
  }
  
  const envInfo = {
    // Next.js에서는 클라이언트에서 NEXT_PUBLIC_ 접두사가 붙은 환경 변수만 접근 가능합니다
    geminiApiKey: {
      exists: typeof process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'undefined',
      prefix: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 4) || 'not set',
      length: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0
    },
    nodeEnv: process.env.NODE_ENV,
    nextPublicEnv: Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .reduce((obj, key) => {
        obj[key] = key.includes('KEY') || key.includes('SECRET')
          ? `${process.env[key]?.substring(0, 4)}...` // API 키, 비밀번호 등 민감 정보는 접두사만 보여줍니다
          : process.env[key];
        return obj;
      }, {})
  };
  
  console.log('클라이언트 환경 변수 정보:', envInfo);
  return envInfo;
}

/**
 * 서버 측 환경 변수 디버깅을 위한 API 엔드포인트를 호출합니다.
 */
export async function checkServerEnv() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('checkServerEnv는 개발 환경에서만 사용해야 합니다.');
    return null;
  }
  
  try {
    const response = await fetch('/api/debug/env');
    return await response.json();
  } catch (error) {
    console.error('서버 환경 변수 확인 실패:', error);
    return { error: error.message };
  }
} 