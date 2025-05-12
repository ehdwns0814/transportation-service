'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ProfilesListPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'driver', 'agency'
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('profiles')
          .select('*');
          
        if (filter !== 'all') {
          query = query.eq('role', filter);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProfiles(data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error.message);
        toast.error('프로필 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [supabase, filter]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로필 목록</h1>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('driver')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'driver'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              용차 기사
            </button>
            <button
              onClick={() => setFilter('agency')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'agency'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              대리점
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">프로필이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Link 
                href={`/profile/${profile.user_id}`} 
                key={profile.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mb-2">
                        {profile.role === 'driver' ? '용차 기사' : '대리점'}
                      </span>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {profile.role === 'driver' 
                          ? profile.name 
                          : profile.agency_name}
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {profile.role === 'driver' 
                        ? (profile.name?.charAt(0) || 'D') 
                        : (profile.agency_name?.charAt(0) || 'A')}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    {profile.role === 'driver' ? (
                      <>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">근무 경력:</span> {profile.experience_years}년
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">거주지:</span> {profile.address || '미지정'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">반품 회수:</span> {profile.returns_pickup ? '가능' : '불가능'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">택배사:</span> {profile.delivery_company || '미지정'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">물량:</span> {profile.quantity || '미지정'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">터미널:</span> {profile.terminal_location || '미지정'}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {profile.description || '소개가 없습니다.'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 