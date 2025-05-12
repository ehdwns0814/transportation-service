'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agency')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      toast.error('대리점 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching agencies:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">대리점 목록</h1>
          <p className="mt-2 text-sm text-gray-600">등록된 운송 대리점 목록입니다.</p>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.id}`}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-gray-900">{agency.company_name || agency.full_name}</p>
                  <p className="mt-3 text-base text-gray-500">
                    {agency.description || '소개가 없습니다.'}
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{agency.company_name || agency.full_name}</span>
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {(agency.company_name || agency.full_name)?.[0] || '?'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {agency.phone || '연락처 없음'}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{agency.location || '지역 정보 없음'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>사업자등록번호: {agency.business_number || '정보 없음'}</p>
                    <p>영업시간: {agency.business_hours || '정보 없음'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {agencies.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500">등록된 대리점이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 