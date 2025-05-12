'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterDeliveryCompany, setFilterDeliveryCompany] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // 테스트를 위해 기본값을 true로 설정
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  };

  const handleCreateJob = () => {
    if (!user) {
      toast.error('일감 등록은 로그인 후 이용 가능합니다.');
      router.push('/login');
    } else {
      router.push('/jobs/create');
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // 첫 번째 방법: 외래 키 관계를 사용해 프로필 정보 조회 (에러가 발생할 수 있음)
      let jobsQuery = supabase
        .from('jobs')
        .select(`
          *,
          job_details (*),
          job_requirements (*),
          job_contacts (*),
          companies (name, business_number)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      const { data, error } = await jobsQuery;

      if (error) throw error;
      
      // 프로필 정보를 별도로 조회하여 결합
      const jobsWithProfiles = await Promise.all(
        data.map(async (job) => {
          if (job.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, agency_name, phone, role')
              .eq('user_id', job.user_id)
              .single();
            
            return { ...job, profiles: profileData };
          }
          return job;
        })
      );
      
      setJobs(jobsWithProfiles || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // 일감 삭제 함수
  const handleDeleteJob = async (jobId) => {
    // 삭제 전 확인
    if (!window.confirm('정말로 이 일감을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      
      // jobs 테이블에서 해당 항목 삭제 (외래 키 제약조건으로 관련 데이터도 자동 삭제됨)
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
      
      // 삭제 성공 시 목록에서도 제거
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('일감이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error(`삭제 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 필터링된 일감 목록
  const filteredJobs = jobs.filter(job => {
    // 검색어 필터링
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_details?.[0]?.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 일감 유형 필터링
    const matchesType = filterType === '' || job.job_type === filterType;
    
    // 택배사 필터링
    const matchesDeliveryCompany = filterDeliveryCompany === '' || 
      job.delivery_company === filterDeliveryCompany;
    
    return matchesSearch && matchesType && matchesDeliveryCompany;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading jobs: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 네비게이션 */}
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            홈으로
          </Link>
        </div>
        
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">일감 리스트</h1>
            <p className="mt-2 text-gray-700">현재 등록된 일감 목록입니다.</p>
          </div>
          <button 
            onClick={handleCreateJob}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            일감 등록
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="키워드 검색"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">전체 유형</option>
              <option value="short">단기</option>
              <option value="long">장기</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
              value={filterDeliveryCompany}
              onChange={(e) => setFilterDeliveryCompany(e.target.value)}
            >
              <option value="">전체 택배사</option>
              <option value="CJ대한통운">CJ대한통운</option>
              <option value="롯데택배">롯데택배</option>
              <option value="한진택배">한진택배</option>
              <option value="우체국택배">우체국택배</option>
              <option value="로젠택배">로젠택배</option>
              <option value="쿠팡">쿠팡</option>
              <option value="기타">기타</option>
            </select>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterDeliveryCompany('');
              }}
            >
              필터 초기화
            </button>
          </div>
        </div>

        {/* 일감 리스트 */}
        <div className="grid gap-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 font-medium">등록된 일감이 없습니다.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              // Check if this job was created by the current user
              const isMyJob = user && job.user_id === user.id;
              
              return (
                <div 
                  key={job.id} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isMyJob ? 'border-l-4 border-blue-500' : ''}`} 
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 mr-3">
                            {job.title}
                        </h2>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                          {job.job_type === 'short' ? '단기' : '장기'}
                        </span>
                        {job.delivery_company && (
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                            {job.delivery_company}
                          </span>
                        )}
                          {isMyJob && (
                            <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                              내 일감
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-gray-700">{job.description || '세부 내용이 없습니다.'}</p>
                      </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">근무지</p>
                      <p className="font-medium text-gray-800">{job.job_details?.[0]?.location || '미정'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">급여</p>
                      <p className="font-medium text-gray-800">
                        {job.job_details?.[0]?.payment_amount?.toLocaleString() || '협의'} {job.job_details?.[0]?.payment_unit || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">물량</p>
                      <p className="font-medium text-gray-800">
                        {job.job_details?.[0]?.quantity?.toLocaleString() || '미정'} 건
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">분포도</p>
                      <p className="font-medium text-gray-800">
                        {job.job_details?.[0]?.distribution_type || '미정'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">터미널 위치</p>
                      <p className="font-medium text-gray-800">
                        {job.job_details?.[0]?.terminal_location || '미정'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          {job.companies?.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-700 font-medium">{job.companies?.name || '회사명'}</span>
                    </div>

                      {/* 작성자 정보 표시 */}
                      {job.profiles && (
                        <div className={`flex items-center ${isMyJob ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100'} px-3 py-1 rounded-full`}>
                          <div className={`w-6 h-6 rounded-full ${isMyJob ? 'bg-blue-600' : 'bg-gray-500'} flex items-center justify-center`}>
                            <span className="text-xs font-medium text-white">
                              {isMyJob ? '내' : 
                                (job.profiles.role === 'agency' 
                                ? (job.profiles.agency_name?.charAt(0) || '회')
                                : (job.profiles.name?.charAt(0) || '작'))}
                            </span>
                          </div>
                          <div className="ml-2">
                            <span className="text-sm text-gray-800 font-medium">
                              {isMyJob ? '내가 작성' : 
                                (job.profiles.role === 'agency' 
                                ? (job.profiles.agency_name || '회사')
                                : (job.profiles.name || '작성자'))}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              {job.created_by_email || '이메일 정보 없음'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 