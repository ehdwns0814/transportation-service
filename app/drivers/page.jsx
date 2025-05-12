'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      toast.error('기사 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching drivers:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">기사 목록</h1>
          <p className="mt-2 text-sm text-gray-600">등록된 운송 기사 목록입니다.</p>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {drivers.map((driver) => (
            <Link
              key={driver.id}
              href={`/drivers/${driver.id}`}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-gray-900">{driver.full_name}</p>
                  <p className="mt-3 text-base text-gray-500">
                    {driver.description || '소개가 없습니다.'}
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{driver.full_name}</span>
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {driver.full_name?.[0] || '?'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {driver.phone || '연락처 없음'}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{driver.location || '지역 정보 없음'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {drivers.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500">등록된 기사가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 