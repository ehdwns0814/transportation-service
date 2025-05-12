'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '../utils/database';
import AiChatBox from '../components/AiChatBox';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
        // Get user profile
        const userProfile = await getUserProfile(session.user.id);
        
        if (!userProfile) {
          router.push('/onboarding');
          return;
        }
        
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">운송 서비스 대시보드</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">안녕하세요, {profile?.name || profile?.representative_name || '사용자'}님!</h2>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">프로필 정보</h3>
                <div className="space-y-2 text-gray-800">
                  {profile?.profile_type === 'driver' ? (
                    <>
                      <p className="text-gray-800"><span className="font-medium">역할:</span> 용차 기사</p>
                      <p className="text-gray-800"><span className="font-medium">이름:</span> {profile?.name}</p>
                      <p className="text-gray-800"><span className="font-medium">연락처:</span> {profile?.phone}</p>
                      <p className="text-gray-800"><span className="font-medium">차량 유형:</span> {profile?.vehicle_type}</p>
                      {profile?.experience_years > 0 && (
                        <p className="text-gray-800"><span className="font-medium">운전 경력:</span> {profile?.experience_years}년</p>
                      )}
                      {profile?.preferred_area && (
                        <p className="text-gray-800"><span className="font-medium">선호 배송 지역:</span> {profile?.preferred_area}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-gray-800"><span className="font-medium">역할:</span> 대리점</p>
                      <p className="text-gray-800"><span className="font-medium">대리점명:</span> {profile?.agency_name}</p>
                      <p className="text-gray-800"><span className="font-medium">대표자명:</span> {profile?.representative_name}</p>
                      <p className="text-gray-800"><span className="font-medium">연락처:</span> {profile?.phone}</p>
                      <p className="text-gray-800"><span className="font-medium">사업자 등록번호:</span> {profile?.business_number}</p>
                      <p className="text-gray-800"><span className="font-medium">주소:</span> {profile?.address}</p>
                      {profile?.service_areas && (
                        <p className="text-gray-800"><span className="font-medium">서비스 지역:</span> {profile?.service_areas}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">빠른 링크</h3>
                <div className="space-y-2">
                  {profile?.profile_type === 'driver' ? (
                    <>
                      <a href="/jobs" className="block py-2 px-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                        일감 목록 보기
                      </a>
                      <a href="/applications" className="block py-2 px-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                        내 지원 현황
                      </a>
                      <a href="/profile" className="block py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        프로필 관리
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/jobs/create" className="block py-2 px-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                        새 일감 등록하기
                      </a>
                      <a href="/jobs/my" className="block py-2 px-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                        내 일감 관리
                      </a>
                      <a href="/profile" className="block py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        회사 프로필 관리
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI 채팅 컴포넌트 */}
        <AiChatBox />
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {profile?.profile_type === 'driver' ? '추천 일감' : '지원자 현황'}
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700 text-center py-8">데이터가 없습니다</p>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {profile?.profile_type === 'driver' ? '최근 활동' : '최근 등록한 일감'}
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700 text-center py-8">데이터가 없습니다</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 