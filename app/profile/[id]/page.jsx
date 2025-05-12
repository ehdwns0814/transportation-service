'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function UserProfilePage({ params }) {
  const { id } = React.use(params);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError.message);
        }
        
        if (session) {
          setSession(session);
          // Check if this profile belongs to the current user
          setIsOwnProfile(session.user.id === id);
        }
        
        // Fetch user profile by id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single();
          
        if (profileError) {
          if (profileError.code === 'PGRST116') { // No profile found
            toast.error('프로필을 찾을 수 없습니다.');
            router.push('/');
            return;
          }
          throw profileError;
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, router, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">프로필을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">해당 사용자의 프로필이 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto mt-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {profile.role === 'driver' 
              ? `${profile.name}님의 프로필` 
              : `${profile.agency_name} 프로필`}
          </h1>
          <div className="flex space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              홈으로
            </Link>
            {isOwnProfile && (
              <Link 
                href="/profile/edit" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                프로필 수정
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
          <div>
            {/* User basic info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-medium mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">역할</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.role === 'driver' ? '용차 기사' : '대리점'}</p>
                </div>
                {/* Only show email for own profile */}
                {isOwnProfile && session && (
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium text-gray-900">{session.user.email}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile specific info based on role */}
            {profile.role === 'driver' ? (
              <div>
                <h2 className="text-xl font-medium mb-4">용차 기사 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">택배 근무 경력</p>
                    <p className="font-medium text-gray-900">{profile.experience_years}년</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">거주지</p>
                    <p className="font-medium text-gray-900">{profile.address || '미지정'}</p>
                  </div>
                  {(profile.age || profile.gender) && (
                    <div>
                      <p className="text-sm text-gray-500">나이/성별</p>
                      <p className="font-medium text-gray-900">
                        {profile.age ? `${profile.age}세` : ''} 
                        {profile.age && profile.gender ? ' / ' : ''} 
                        {profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : ''}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">반품 회수 수행</p>
                    <p className="font-medium text-gray-900">{profile.returns_pickup ? '가능' : '불가능'}</p>
                  </div>
                  {isOwnProfile && (
                    <div>
                      <p className="text-sm text-gray-500">연락처</p>
                      <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  )}
                  {profile.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">추가 정보</p>
                      <p className="font-medium text-gray-900">{profile.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-medium mb-4">대리점 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">업체명</p>
                    <p className="font-medium text-gray-900">{profile.agency_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">택배사</p>
                    <p className="font-medium text-gray-900">{profile.delivery_company || '미지정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">일정(근무 날짜)</p>
                    <p className="font-medium text-gray-900">{profile.working_date || '미지정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">물량(건수)</p>
                    <p className="font-medium text-gray-900">{profile.quantity || '미지정'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">아파트, 지번 분포도(업무 난이도)</p>
                    <p className="font-medium text-gray-900">{profile.distribution_type || '미지정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">터미널 위치</p>
                    <p className="font-medium text-gray-900">{profile.terminal_location || '미지정'}</p>
                  </div>
                  {isOwnProfile ? (
                    <div>
                      <p className="text-sm text-gray-500">담당자 연락처</p>
                      <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">문의하기</p>
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => toast.success('준비 중인 기능입니다.')}
                      >
                        연락처 요청하기
                      </button>
                    </div>
                  )}
                  {profile.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">추가 정보</p>
                      <p className="font-medium text-gray-900">{profile.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!isOwnProfile && (
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={() => toast.success('준비 중인 기능입니다.')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {profile.role === 'driver' ? '운송 의뢰하기' : '일감 보기'}
                </button>
                <button
                  onClick={() => toast.success('준비 중인 기능입니다.')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  메시지 보내기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 