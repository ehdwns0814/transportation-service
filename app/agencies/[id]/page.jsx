'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AgencyProfilePage() {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAgencyProfile();
  }, [params.id]);

  const fetchAgencyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .eq('role', 'agency')
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('대리점 정보를 찾을 수 없습니다.');
        router.push('/agencies');
        return;
      }

      setAgency(data);
    } catch (error) {
      toast.error('대리점 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching agency profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!agency) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* 뒤로 가기 버튼 */}
            <div className="mb-6">
              <Link
                href="/agencies"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                대리점 목록으로 돌아가기
              </Link>
            </div>

            {/* 프로필 헤더 */}
            <div className="flex items-center mb-8">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {(agency.company_name || agency.full_name)?.[0] || '?'}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">{agency.company_name || agency.full_name}</h1>
                <p className="text-gray-500">{agency.email}</p>
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">회사 소개</h2>
                <p className="mt-2 text-gray-600">{agency.description || '소개가 없습니다.'}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">사업자 정보</h2>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-600">사업자등록번호: {agency.business_number || '정보 없음'}</p>
                  <p className="text-gray-600">대표자명: {agency.representative_name || '정보 없음'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-600">전화번호: {agency.phone || '정보 없음'}</p>
                  <p className="text-gray-600">주소: {agency.location || '정보 없음'}</p>
                  <p className="text-gray-600">영업시간: {agency.business_hours || '정보 없음'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">서비스 지역</h2>
                <div className="mt-2">
                  <p className="text-gray-600">{agency.service_areas || '정보 없음'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">취급 화물 유형</h2>
                <div className="mt-2">
                  <p className="text-gray-600">{agency.cargo_types || '정보 없음'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 