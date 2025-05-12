import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { fetchFromSupabase } from '../../utils/supabaseApi';

/**
 * Example component showing how to use Supabase JS client vs direct fetch
 */
export default function SupabaseClientExample() {
  const [profiles, setProfiles] = useState([]);
  const [directProfiles, setDirectProfiles] = useState([]);
  const [manualClientProfiles, setManualClientProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directError, setDirectError] = useState(null);
  const [manualClientError, setManualClientError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Get Supabase client instance using auth-helpers-nextjs (recommended)
  const supabase = createClientComponentClient();
  
  // Manual client creation - only for demonstration
  // This is an alternative to createClientComponentClient but requires you to pass URL and key
  const createManualClient = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  };
  
  // Function using Supabase JS client (recommended way)
  const fetchWithClient = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      setIsRetrying(false);
      
      // Use the Supabase client to query data
      // The client automatically includes the API key!
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .limit(5);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error using Supabase client:', err);
      setError(err.message);
      
      // Controlled retry logic
      if (retryCount < 3) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff (1s, 2s, 4s)
        const delay = Math.pow(2, retryCount) * 1000;
        
        console.log(`Retrying in ${delay/1000}s... (Attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          setIsRetrying(false);
          fetchWithClient();
        }, delay);
      }
    } finally {
      if (!isRetrying) {
        setIsLoading(false);
      }
    }
  };
  
  // Function using manual client creation
  const fetchWithManualClient = async () => {
    try {
      setManualClientError(null);
      
      // Create client manually passing URL and key
      const manualClient = createManualClient();
      
      const { data, error } = await manualClient
        .from('profiles')
        .select('id, name, email')
        .limit(5);
      
      if (error) throw error;
      setManualClientProfiles(data || []);
    } catch (err) {
      console.error('Error using manual Supabase client:', err);
      setManualClientError(err.message);
    }
  };
  
  // Function using direct fetch to Supabase REST API (not recommended, but shown for comparison)
  const fetchWithDirectAPI = async () => {
    try {
      setDirectError(null);
      
      // Make sure we have the environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
      }
      
      // Method 1: Direct fetch (NOT RECOMMENDED - must manually include apikey and Authorization headers)
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=id,name,email&limit=5`,
      //   {
      //     headers: {
      //       'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      //       'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      // 
      // if (!response.ok) {
      //   const errorText = await response.text();
      //   throw new Error(`Failed to fetch with direct API: ${response.status} ${response.statusText}. ${errorText}`);
      // }
      // const data = await response.json();
      // setDirectProfiles(data);
      
      // Method 2: Using our utility (better if you must use fetch directly)
      // This utility automatically includes both apikey and Authorization headers
      // and has built-in retry logic with exponential backoff
      const data = await fetchFromSupabase('/rest/v1/profiles?select=id,name,email&limit=5');
      setDirectProfiles(data);
      
    } catch (err) {
      console.error('Error using direct fetch:', err);
      setDirectError(err.message);
      
      // We don't retry here because our fetchFromSupabase utility already has retry logic
    }
  };
  
  useEffect(() => {
    fetchWithClient();
    fetchWithDirectAPI();
    fetchWithManualClient();
  }, []);
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-semibold mb-4">Supabase API 접근 방법 예제</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase Client Example (Recommended) */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">1. Supabase JS 클라이언트 (권장)</h3>
          <p className="text-xs text-gray-500 mb-2">createClientComponentClient() 사용</p>
          {isLoading ? (
            <div>
              <p>로딩 중...</p>
              {isRetrying && (
                <p className="text-yellow-600 text-sm">
                  재시도 중 ({retryCount}/3)...
                </p>
              )}
            </div>
          ) : error ? (
            <div className="text-red-500">
              <p>오류: {error}</p>
              {retryCount >= 3 && (
                <p className="text-sm mt-1">최대 재시도 횟수에 도달했습니다 (3/3)</p>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-600">✅ API 키 자동 포함</p>
              <p className="mb-4 text-sm text-gray-600">✅ 타입 안전성 제공</p>
              <p className="font-medium">프로필 {profiles.length}개 찾음:</p>
              <ul className="list-disc list-inside">
                {profiles.map(profile => (
                  <li key={profile.id}>
                    {profile.name || '이름 없음'} {profile.email ? `(${profile.email})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <button 
              onClick={fetchWithClient}
              disabled={isRetrying}
              className={`px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isRetrying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRetrying ? `재시도 중 (${retryCount}/3)...` : '클라이언트로 새로고침'}
            </button>
          </div>
        </div>
        
        {/* Manual Client Creation */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">2. 수동 클라이언트 생성</h3>
          <p className="text-xs text-gray-500 mb-2">createClient() 직접 사용</p>
          {manualClientError ? (
            <div className="text-red-500">오류: {manualClientError}</div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-600">✅ API 키 자동 포함</p>
              <p className="mb-4 text-sm text-gray-600">⚠️ URL과 키를 직접 전달해야 함</p>
              <p className="font-medium">프로필 {manualClientProfiles.length}개 찾음:</p>
              <ul className="list-disc list-inside">
                {manualClientProfiles.map((profile, i) => (
                  <li key={i}>
                    {profile.name || '이름 없음'} {profile.email ? `(${profile.email})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <button 
              onClick={fetchWithManualClient}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              수동 클라이언트로 새로고침
            </button>
          </div>
        </div>
        
        {/* Direct API Example */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">3. REST API 직접 호출 (권장하지 않음)</h3>
          <p className="text-xs text-gray-500 mb-2">fetchFromSupabase() 유틸리티 사용</p>
          {directError ? (
            <div className="text-red-500">오류: {directError}</div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-600">⚠️ apikey와 Authorization 헤더 필요</p>
              <p className="mb-4 text-sm text-gray-600">⚠️ 타입 안전성 없음</p>
              <p className="font-medium">프로필 {directProfiles.length}개 찾음:</p>
              <ul className="list-disc list-inside">
                {directProfiles.map((profile, i) => (
                  <li key={i}>
                    {profile.name || '이름 없음'} {profile.email ? `(${profile.email})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <button 
              onClick={fetchWithDirectAPI}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              직접 API로 새로고침
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h3 className="font-medium mb-2">⚠️ 중요 알림</h3>
        <p>Supabase REST API를 fetch로 직접 호출할 때는 <strong>반드시</strong> apikey와 Authorization 헤더를 포함해야 합니다:</p>
        <pre className="bg-gray-800 text-white p-2 rounded-md mt-2 overflow-x-auto">
          {`headers: { 
  apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  Authorization: \`Bearer \${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}\`,
  'Content-Type': 'application/json' 
}`}
        </pre>
        <p className="mt-4 text-sm">가능하면 Supabase JS 클라이언트를 사용하세요. 자동으로 인증을 처리하고 타입 안전성을 제공합니다!</p>
        <p className="mt-2 text-sm">API 호출 실패 시 무한 재시도를 하지 않도록 적절한 에러 핸들링과 최대 재시도 횟수를 설정하세요.</p>
      </div>
    </div>
  );
} 