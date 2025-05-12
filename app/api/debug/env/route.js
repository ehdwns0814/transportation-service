import { NextResponse } from 'next/server';

export async function GET() {
  // Be careful not to expose sensitive values in production
  const debug = {
    geminiApiKeyExists: !!process.env.GEMINI_API_KEY,
    geminiPublicKeyExists: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    geminiApiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 4) || 'undefined',
    geminiPublicKeyPrefix: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 4) || 'undefined',
    geminiApiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    geminiPublicKeyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json({ 
    status: 'Diagnostic information', 
    environment: debug 
  });
} 