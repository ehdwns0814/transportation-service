'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import ChatModal from '../../components/ChatModal';

export default function JobDetailPage() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // 테스트를 위해 기본값을 true로 설정
  const [user, setUser] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id);
      checkUser();
    }
  }, [params.id]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  };

  const fetchJob = async (jobId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_details (*),
          job_requirements (*),
          job_contacts (*),
          companies (name, business_number, address, phone)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  // 일감 삭제 함수
  const handleDeleteJob = async () => {
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
        .eq('id', job.id);
      
      if (error) throw error;
      
      toast.success('일감이 성공적으로 삭제되었습니다.');
      
      // 삭제 후 목록 페이지로 이동
      setTimeout(() => {
        router.push('/jobs');
      }, 1000);
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error(`삭제 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Check if current user is the job creator
  const isJobCreator = user && job && user.id === job.user_id;

  // Handle opening chat with the job creator
  const handleChatWithCreator = async () => {
    if (!user) {
      toast.error('채팅을 시작하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (isJobCreator) {
      toast.error('본인이 작성한 글에는 채팅을 할 수 없습니다.');
      return;
    }

    if (!job.user_id) {
      toast.error('작성자 정보를 찾을 수 없습니다.');
      return;
    }

    // 작성자 ID가 유효한지 확인
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('user_id', job.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error checking author:', error);
        toast.error('작성자 정보를 확인하는 중 오류가 발생했습니다.');
        return;
      }

      if (!data) {
        toast.error('상대방 프로필이 존재하지 않습니다.');
        return;
      }

      // 채팅 모달 열기
      setIsChatModalOpen(true);
    } catch (err) {
      console.error('Error checking author:', err);
      toast.error('작성자 정보를 확인하는 중 오류가 발생했습니다.');
    }
  };

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
            <p>Error loading job: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">일감을 찾을 수 없습니다</h1>
            <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
              일감 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-medium">
            ← 일감 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">{job.title}</h1>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                    {job.job_type === 'short' ? '단기' : '장기'}
                  </span>
                  {job.delivery_company && (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      {job.delivery_company}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{job.description}</p>
              </div>
              
              <div className="flex space-x-2">
                {isJobCreator && (
                  <>
                    <Link
                      href={`/jobs/edit/${job.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                <button
                  onClick={handleDeleteJob}
                  disabled={deleteLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {deleteLoading && (
                        <span className="sr-only">삭제 중...</span>
                      )}
                    </button>
                  </>
                )}
                
                {!isJobCreator && job.user_id && (
                  <button
                    onClick={handleChatWithCreator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                    작성자와 채팅하기
                </button>
              )}
            </div>
            </div>
            
            {/* 작성자 정보 표시 */}
            {job.user_id ? (
              <div className="mt-4 flex items-center bg-gray-100 px-3 py-2 rounded-md w-fit">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {job.created_by_email ? job.created_by_email.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="ml-2">
                  <span className="text-sm text-gray-800 font-medium">
                    작성자
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {job.created_by_email || '이메일 정보 없음'}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    작성자 ID: {job.user_id}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center bg-yellow-100 px-3 py-2 rounded-md w-fit">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">!</span>
                </div>
                <div className="ml-2">
                  <span className="text-sm text-yellow-800 font-medium">
                    작성자 정보 없음
                  </span>
                  <span className="text-xs text-yellow-700 block">
                    해당 게시글에 작성자 정보가 저장되어 있지 않습니다.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 상세 정보 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 왼쪽 컬럼 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
                <div className="space-y-4">
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
                    <p className="text-sm text-gray-600 font-medium">근무 시간</p>
                    <p className="font-medium text-gray-800">{job.job_details?.[0]?.working_hours || '협의'}</p>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">배송 정보</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">택배사</p>
                    <p className="font-medium text-gray-800">{job.delivery_company || '미정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">물량(건수)</p>
                    <p className="font-medium text-gray-800">{job.job_details?.[0]?.quantity?.toLocaleString() || '미정'} 건</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">아파트/지번 분포도</p>
                    <p className="font-medium text-gray-800">{job.job_details?.[0]?.distribution_type || '미정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">터미널 위치</p>
                    <p className="font-medium text-gray-800">{job.job_details?.[0]?.terminal_location || '미정'}</p>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">필요 자격</h2>
                <div className="space-y-4">
                  {job.job_requirements?.length > 0 ? (
                    job.job_requirements?.map((req, index) => (
                      <div key={index}>
                        <p className="text-sm text-gray-600 font-medium">{req.requirement_type}</p>
                        <p className="font-medium text-gray-800">{req.description}</p>
                      </div>
                    ))
                  ) : (
                    <div>
                      <p className="font-medium text-gray-800">특별한 자격 요건이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽 컬럼 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">회사명</p>
                    <p className="font-medium text-gray-800">{job.companies?.name || '미정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">사업자번호</p>
                    <p className="font-medium text-gray-800">{job.companies?.business_number || '미정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">주소</p>
                    <p className="font-medium text-gray-800">{job.companies?.address || '미정'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">연락처</p>
                    <p className="font-medium text-gray-800">{job.companies?.phone || '미정'}</p>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">담당자 정보</h2>
                <div className="space-y-4">
                  {job.job_contacts?.length > 0 ? (
                    job.job_contacts?.map((contact, index) => (
                      <div key={index}>
                        <p className="text-sm text-gray-600 font-medium">{contact.contact_type}</p>
                        <p className="font-medium text-gray-800">{contact.contact_info}</p>
                      </div>
                    ))
                  ) : (
                    <div>
                      <p className="font-medium text-gray-800">담당자 정보가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">등록일</p>
                <p className="font-medium text-gray-800">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  지원하기
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium">
                  채팅하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      {job && user && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          recipientId={job.user_id}
          currentUserId={user.id}
          jobTitle={job.title}
        />
      )}
    </div>
  );
} 