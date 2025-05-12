'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/supabase';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const NavBar = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      // 로그아웃 전에 현재 사용자 확인 (디버깅용)
      const { data: { user } } = await supabase.auth.getUser();
      console.log('로그아웃하는 사용자:', user?.email);
      
      // 완전한 로그아웃 실행
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // 브라우저 스토리지 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }
      
      toast.success('로그아웃되었습니다');
      setIsMenuOpen(false);
      
      // 홈 페이지로 리다이렉트
      router.push('/');
      
      // 페이지 새로고침 (세션 상태 완전 초기화)
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(`로그아웃 오류: ${error.message}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <svg 
                className="h-8 w-8 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">프리매칭</span>
            </Link>
          </div>
          
          {/* 메인 네비게이션 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">일감 찾기</Link>
            <Link href="/drivers" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">기사 목록</Link>
            <Link href="/agencies" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">대리점 목록</Link>
            <Link href="/tasks" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">내 일감</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">요금제</Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">이용방법</Link>
            <Link href="/profiles" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">프로필 목록</Link>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded-md"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition duration-150 ease-in-out"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-gray-700 hidden sm:block">
                    {user.email?.split('@')[0] || user.user_metadata?.full_name || '사용자'}
                  </span>
                  <svg 
                    className={`h-4 w-4 text-gray-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link 
                      href={`/profile/${user.id}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 프로필
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                    <Link 
                      href="/tasks" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 일감 관리
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      계정 설정
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md transition duration-150 ease-in-out">
                    로그인
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out">
                    회원가입
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            홈
          </Link>
          <Link href="/jobs" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            일감 목록
          </Link>
          <Link href="/drivers" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            기사 목록
          </Link>
          <Link href="/agencies" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            대리점 목록
          </Link>
          <Link href="/tasks" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            내 일감
          </Link>
          <Link href="/pricing" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            요금제
          </Link>
          <Link href="/how-it-works" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            이용방법
          </Link>
          <Link href="/profiles" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            프로필 목록
          </Link>
          {user && (
            <Link href={`/profile/${user.id}`} className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              내 프로필
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {loading ? (
            <div className="flex items-center px-4">
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded-md"></div>
            </div>
          ) : user ? (
            <div className="flex items-center px-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700"
              >
                대시보드
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 px-4">
              <Link href="/login">
                <button
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-base font-medium hover:bg-gray-50"
                >
                  로그인
                </button>
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 