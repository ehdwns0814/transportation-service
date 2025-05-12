import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// 환경 변수 디버깅
console.log('Gemini API Route Loaded');
console.log('GEMINI_API_KEY 존재여부:', !!process.env.GEMINI_API_KEY);
console.log('NEXT_PUBLIC_GEMINI_API_KEY 존재여부:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);

if (process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY 첫 문자:', process.env.GEMINI_API_KEY.substring(0, 4) + '...');
} else {
  console.error('⚠️ GEMINI_API_KEY가 설정되지 않았습니다!');
}

// Gemini API 설정
const setupGemini = () => {
  // 두 환경 변수 모두 시도
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('API KEY NOT FOUND: 환경 변수가 설정되지 않았습니다');
    throw new Error('Gemini API 키가 설정되지 않았습니다. 관리자에게 문의하세요.');
  }
  
  // API 키 유효성 확인
  if (apiKey.trim() === 'your_gemini_api_key' || apiKey.length < 10) {
    console.error('API KEY ERROR: 유효하지 않은 API 키 형식입니다');
    throw new Error('유효하지 않은 API 키입니다. 올바른 Gemini API 키를 설정하세요.');
  }
  
  console.log('Gemini API 키 확인됨:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Gemini API 클라이언트 초기화 오류:', error);
    throw new Error('API 클라이언트 초기화 실패: ' + error.message);
  }
};

export async function POST(request) {
  try {
    console.log('API 요청 받음');
    
    // 요청 본문 파싱
    const { question } = await request.json();
    
    if (!question || question.trim() === '') {
      return NextResponse.json({ 
        error: '질문이 제공되지 않았습니다.' 
      }, { status: 400 });
    }
    
    console.log('질문:', question);
    
    try {
      // Gemini API 클라이언트 초기화
      const genAI = setupGemini();
      
      // 적절한 프롬프트 생성
      const prompt = `
        당신은 운송 서비스 업계 전문가입니다. 다음 질문에 친절하고 정확하게 답변해주세요:
        
        질문: ${question}
      `;
      
      console.log('Gemini API 호출 중...');
      
      // 새로운 API 형식으로 Gemini API 호출
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash", // 업데이트된 모델 이름 사용
        contents: prompt,
      });
      
      const text = response.text; 
      
      console.log('응답 받음:', text.substring(0, 50) + '...');
      
      // 성공 응답 반환
      return NextResponse.json({
        answer: text,
        model: 'gemini-2.0-flash',
        timestamp: new Date().toISOString()
      });
    } catch (apiError) {
      console.error('Gemini API 호출 오류:', apiError);
      throw apiError; // 상위 catch 블록으로 전달
    }
    
  } catch (error) {
    console.error('전체 오류:', error);
    
    // 오류 유형에 따른 메시지
    let errorMessage = '답변을 생성하는 중 오류가 발생했습니다.';
    
    if (error.message && error.message.includes('API 키')) {
      errorMessage = 'API 키 설정 오류: 관리자에게 문의하세요';
    } else if (error.message && error.message.includes('network')) {
      errorMessage = '네트워크 오류: 인터넷 연결을 확인하세요';
    } else if (error.message && error.message.includes('blocked')) {
      errorMessage = 'API 액세스 제한: 안전 설정 또는 지역 제한 문제일 수 있습니다';
    }
    
    // 개발 환경에서는 상세 오류 메시지 제공
    return NextResponse.json({ 
      error: process.env.NODE_ENV === 'development' 
        ? `${errorMessage} - ${error.message}` 
        : errorMessage
    }, { status: 500 });
  }
}

// CORS 설정을 위한 OPTIONS 핸들러
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 