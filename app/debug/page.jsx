'use client';

import { useState, useEffect } from 'react';
import { debugClientEnv, checkServerEnv } from '../utils/debugEnv';

export default function DebugPage() {
  const [clientEnv, setClientEnv] = useState(null);
  const [serverEnv, setServerEnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 클라이언트 환경 변수 확인
        const clientEnvData = debugClientEnv();
        setClientEnv(clientEnvData);
        
        // 서버 환경 변수 확인
        const serverEnvData = await checkServerEnv();
        setServerEnv(serverEnvData);
      } catch (err) {
        console.error('디버그 정보 로딩 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">환경 변수 디버그 페이지</h1>
      
      {loading && <p className="text-gray-500">환경 정보를 로딩 중입니다...</p>}
      {error && <p className="text-red-500">오류 발생: {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* 클라이언트 환경 변수 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">클라이언트 환경 변수</h2>
          {clientEnv && (
            <div>
              <div className="mb-2">
                <p className="font-medium">NEXT_PUBLIC_GEMINI_API_KEY:</p>
                <p className={`ml-2 ${clientEnv.geminiApiKey.exists ? 'text-green-600' : 'text-red-600'}`}>
                  {clientEnv.geminiApiKey.exists ? '설정됨' : '설정되지 않음'}
                  {clientEnv.geminiApiKey.exists && (
                    <> (접두사: {clientEnv.geminiApiKey.prefix}..., 길이: {clientEnv.geminiApiKey.length})</>
                  )}
                </p>
              </div>
              
              <p className="font-medium mt-2">NODE_ENV: <span className="font-normal">{clientEnv.nodeEnv}</span></p>
              
              <div className="mt-4">
                <p className="font-medium">모든 공개 환경 변수:</p>
                <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(clientEnv.nextPublicEnv, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        {/* 서버 환경 변수 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">서버 환경 변수</h2>
          {serverEnv && (
            <div>
              {serverEnv.environment && (
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">GEMINI_API_KEY:</p>
                    <p className={`ml-2 ${serverEnv.environment.geminiApiKeyExists ? 'text-green-600' : 'text-red-600'}`}>
                      {serverEnv.environment.geminiApiKeyExists ? '설정됨' : '설정되지 않음'}
                      {serverEnv.environment.geminiApiKeyExists && (
                        <> (접두사: {serverEnv.environment.geminiApiKeyPrefix}..., 길이: {serverEnv.environment.geminiApiKeyLength})</>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">NEXT_PUBLIC_GEMINI_API_KEY:</p>
                    <p className={`ml-2 ${serverEnv.environment.geminiPublicKeyExists ? 'text-green-600' : 'text-red-600'}`}>
                      {serverEnv.environment.geminiPublicKeyExists ? '설정됨' : '설정되지 않음'}
                      {serverEnv.environment.geminiPublicKeyExists && (
                        <> (접두사: {serverEnv.environment.geminiPublicKeyPrefix}..., 길이: {serverEnv.environment.geminiPublicKeyLength})</>
                      )}
                    </p>
                  </div>
                  
                  <p className="font-medium mt-2">NODE_ENV: <span className="font-normal">{serverEnv.environment.nodeEnv}</span></p>
                </div>
              )}
              
              {serverEnv.error && (
                <p className="text-red-500">{serverEnv.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold">문제 해결 단계</h3>
        <ol className="list-decimal ml-5 space-y-1 mt-2">
          <li>프로젝트 루트에 <code className="bg-gray-100 px-1 rounded">.env.local</code> 파일이 있는지 확인하세요.</li>
          <li>파일 내에 <code className="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code>와 <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GEMINI_API_KEY</code>가 올바르게 설정되어 있는지 확인하세요.</li>
          <li>API 키가 유효한지 확인하세요. <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>에서 확인할 수 있습니다.</li>
          <li>환경 변수에 따옴표나 공백이 포함되어 있지 않은지 확인하세요.</li>
          <li>변경 후 서버를 재시작하세요: <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
        </ol>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  );
} 