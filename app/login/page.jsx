'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { signInWithGoogle, signInWithKakao, signInWithNaver } from '../../lib/supabase';
import { hasUserProfile } from '../utils/database';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    kakao: false,
    naver: false
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Check session on page load and clear if necessary
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        // First check if there's an existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user has a profile
          const hasProfile = await hasUserProfile(session.user.id);
          
          if (!hasProfile) {
            // No profile, redirect to onboarding
            router.push('/onboarding');
            return;
          } else {
            // Has profile, redirect to home page
            router.push('/');
            return;
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [router, supabase]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Successfully signed in, check if profile exists
      const hasProfile = await hasUserProfile(data.user.id);
      
      toast.success('로그인 성공!');
      
      if (!hasProfile) {
        // User doesn't have a profile, redirect to onboarding
        router.push('/onboarding');
      } else {
        // User has a profile, redirect to home page
        router.push('/');
      }
    } catch (error) {
      toast.error(`로그인 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setSocialLoading(prev => ({ ...prev, [provider]: true }));
      
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'kakao':
          result = await signInWithKakao();
          break;
        case 'naver':
          result = await signInWithNaver();
          break;
        default:
          throw new Error('지원하지 않는 로그인 방식입니다.');
      }
      
      if (result.error) throw result.error;
      
      toast.success(`${provider} 로그인 진행중입니다.`);
      // Note: For social login, the redirect happens via the callback route
      
    } catch (error) {
      toast.error(`${provider} 로그인 오류: ${error.message}`);
    } finally {
      setSocialLoading(prev => ({ ...prev, [provider]: false }));
  }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">로그인</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
            운송 서비스
          </Link>
          {' '}로 일감을 찾고 관리하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="이메일을 입력하세요"
                />
              </div>
        </div>
        
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  로그인 유지
                </label>
              </div>

              <div className="text-sm">
                <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading.google}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {socialLoading.google ? (
                    <div className="w-5 h-5 border-t-2 border-gray-500 border-solid rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.821h5.445c-.239 1.424-1.713 4.168-5.445 4.168-3.271 0-5.937-2.713-5.937-6.057s2.666-6.057 5.937-6.057c1.863 0 3.113.801 3.824 1.488l2.607-2.607C17.502 3.605 15.222 2.65 12.545 2.65c-5.429 0-9.839 4.41-9.839 9.84s4.41 9.839 9.839 9.839c5.685 0 9.46-3.995 9.46-9.623 0-.647-.065-1.139-.196-1.634h-9.264z" />
                    </svg>
                  )}
                </button>
              </div>

              <div>
                <button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={socialLoading.kakao}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-yellow-400 text-sm font-medium text-gray-800 hover:bg-yellow-300"
                >
                  {socialLoading.kakao ? (
                    <div className="w-5 h-5 border-t-2 border-gray-800 border-solid rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 16.5a7.5 7.5 0 110-15 7.5 7.5 0 010 15zm-2.25-9a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75zm4.5 0a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75zm-5.806 4.28a.75.75 0 00-1.068 1.056c.991.999 2.365 1.614 3.875 1.614s2.884-.615 3.875-1.614a.75.75 0 10-1.068-1.056A3.6 3.6 0 0112.25 16a3.6 3.6 0 01-2.555-1.07z" />
                    </svg>
                  )}
                </button>
              </div>

              <div>
                <button
                  onClick={() => handleSocialLogin('naver')}
                  disabled={socialLoading.naver}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-green-500 text-sm font-medium text-white hover:bg-green-600"
                >
                  {socialLoading.naver ? (
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8.8V15h-2.674v-4.1L9.998 15H7.326V8.8h2.674v4.1l3.326-4.1H16z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                회원가입
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 