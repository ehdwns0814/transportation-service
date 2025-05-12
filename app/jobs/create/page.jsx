'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import LocationSearch from '../../components/LocationSearch';

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: '', // 글 제목 (사용자가 입력)
    description: '', // 세부 내용 (사용자가 입력, 선택사항)
    job_type: 'short',
    status: 'published',
    
    // 사용자가 입력하는 필드
    delivery_company: '', // 택배사
    custom_delivery_company: '', // 직접 입력 택배사
    working_date: '', // 일정(근무 날짜)
    quantity: '', // 물량(건수)
    distribution_type: '', // 아파트, 지번 분포도
    terminal_location: '', // 터미널 위치
  });

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        const { data: { session } } = await supabase.auth.getSession();
          
        if (!session) {
          toast.error('로그인이 필요한 서비스입니다.');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('인증 확인 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router, supabase]);
  
  const [useCustomDelivery, setUseCustomDelivery] = useState(false);

  // 날짜 범위가 변경될 때마다 working_date 업데이트
  useEffect(() => {
    if (startDate && endDate) {
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const dateRange = `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
      setFormData(prev => ({ ...prev, working_date: dateRange }));
    } else if (startDate) {
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      setFormData(prev => ({ ...prev, working_date: formatDate(startDate) }));
    }
  }, [startDate, endDate]);

  // Show loading state when checking authentication
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'delivery_company') {
      if (value === 'custom') {
        setUseCustomDelivery(true);
      } else {
        setUseCustomDelivery(false);
      }
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 달력 클릭 핸들러
  const handleCalendarClick = () => {
    if (!startDate) {
      // 현재 날짜로 기본 설정
      setStartDate(new Date());
    }
  };

  // 진행 프로세스 시뮬레이션 함수
  const updateProgress = (stage) => {
    switch(stage) {
      case 'start':
        setProgress(10);
        break;
      case 'job_created':
        setProgress(40);
        break;
      case 'details_created':
        setProgress(70);
        break;
      case 'contacts_created':
        setProgress(90);
        break;
      case 'completed':
        setProgress(100);
        break;
      default:
        break;
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData(prevState => ({
      ...prevState,
      terminal_location: location.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(0);
    updateProgress('start');

    try {
      // 현재 세션 재확인 (중요: 여기서 최신 세션을 다시 가져옴)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('세션 확인 중 오류가 발생했습니다.');
      }
      
      if (!session) {
        throw new Error('로그인이 필요한 서비스입니다.');
      }
      
      console.log('일감 등록 사용자:', session.user.email); // 디버깅용
      
      // 폼 데이터 유효성 검증
      if (!formData.title.trim()) {
        throw new Error('글 제목을 입력해주세요');
      }
      
      // 택배사 확인 (기본 선택 또는 직접 입력)
      let finalDeliveryCompany = formData.delivery_company;
      if (formData.delivery_company === 'custom' && formData.custom_delivery_company.trim()) {
        finalDeliveryCompany = formData.custom_delivery_company.trim();
      } else if (formData.delivery_company === 'custom' && !formData.custom_delivery_company.trim()) {
        throw new Error('택배사를 입력해주세요');
      } else if (!formData.delivery_company) {
        throw new Error('택배사를 선택해주세요');
      }
      
      if (!formData.working_date.trim()) {
        throw new Error('근무 날짜를 입력해주세요');
      }
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        throw new Error('물량(건수)을 입력해주세요');
      }
      if (!formData.distribution_type.trim()) {
        throw new Error('아파트/지번 분포도를 선택해주세요');
      }
      if (!formData.terminal_location.trim()) {
        throw new Error('터미널 위치를 입력해주세요');
      }

      // 1. 회사 정보 생성 (간소화된 버전)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert({
          name: '자동 생성',
          business_number: `AUTO-${Date.now()}`,
          address: '자동 생성',
          phone: '자동 생성'
        })
        .select()
        .single();

      if (companyError) {
        console.error('Company insertion error:', companyError);
        throw new Error(`회사 정보 저장 중 오류가 발생했습니다: ${companyError.message}`);
      }
      
      if (!companyData || !companyData.id) {
        throw new Error('회사 ID를 가져올 수 없습니다');
      }
      
      // 2. 현재 사용자 프로필 정보 조회
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      // 3. jobs 테이블에 기본 정보 삽입 (사용자 ID와 이메일 추가)
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          description: formData.description,
          job_type: formData.job_type,
          delivery_company: finalDeliveryCompany,
          status: formData.status,
          company_id: companyData.id,
          user_id: session.user.id, // 현재 로그인한 사용자의 ID 저장
          created_by_email: session.user.email, // 사용자 이메일 저장
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job insertion error:', jobError);
        throw new Error(`일감 기본 정보 저장 중 오류가 발생했습니다: ${jobError.message}`);
      }
      
      updateProgress('job_created');

      // 4. job_details 테이블에 세부 정보 삽입
      const { error: detailsError } = await supabase
        .from('job_details')
        .insert({
          job_id: jobData.id,
          location: '자동 생성', // 위치는 자동 생성
          working_date: formData.working_date,
          quantity: parseInt(formData.quantity) || 0,
          distribution_type: formData.distribution_type,
          terminal_location: formData.terminal_location,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (detailsError) {
        console.error('Job details insertion error:', detailsError);
        throw new Error(`근무 세부사항 저장 중 오류가 발생했습니다: ${detailsError.message}`);
      }
      
      updateProgress('details_created');

      // 5. job_contacts 테이블에 연락처 정보 삽입
        const { error: contactsError } = await supabase
          .from('job_contacts')
          .insert({
            job_id: jobData.id,
          contact_type: '담당자',
          contact_info: '담당자 연락처는 로그인 후 확인 가능합니다.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
          });

        if (contactsError) {
        console.error('Job contacts insertion error:', contactsError);
        throw new Error(`연락처 정보 저장 중 오류가 발생했습니다: ${contactsError.message}`);
      }
      
      updateProgress('contacts_created');
      updateProgress('completed');

      toast.success('일감이 성공적으로 등록되었습니다!');
      
      // 등록 완료 후 목록 페이지로 이동
      setTimeout(() => {
        router.push('/jobs');
      }, 1500);
      
    } catch (err) {
      console.error('일감 등록 중 오류 발생:', err);
      setError(err.message);
      toast.error('일감 등록 중 오류가 발생했습니다: ' + err.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              홈으로
            </Link>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              일감 목록으로 돌아가기
          </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">일감 등록</h1>
          <p className="mt-2 text-gray-700">새로운 일감을 등록하세요.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

          {/* 진행 상태 표시 */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
            <p className="text-sm text-gray-600 mt-2">
              {progress === 100 ? '등록이 완료되었습니다!' : '등록 중...'}
                </p>
            </div>
          )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* 글 제목 */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                글 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900 font-medium"
                placeholder="제목을 입력해주세요"
                required
                    />
                  </div>
            
            {/* 세부 내용 (선택사항) */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                세부 내용
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900"
                placeholder="세부 내용을 입력해주세요 (선택사항)"
                    ></textarea>
                  </div>
            
            {/* 1. 택배사 */}
                  <div>
                    <label htmlFor="delivery_company" className="block text-sm font-medium text-gray-700 mb-1">
                      택배사 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="delivery_company"
                      name="delivery_company"
                      value={formData.delivery_company}
                      onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white font-medium"
                required
              >
                <option value="" className="text-gray-600">택배사 선택</option>
                          <option value="CJ대한통운">CJ대한통운</option>
                          <option value="롯데택배">롯데택배</option>
                          <option value="한진택배">한진택배</option>
                          <option value="우체국택배">우체국택배</option>
                          <option value="로젠택배">로젠택배</option>
                          <option value="쿠팡">쿠팡</option>
                <option value="custom">기타 (직접입력)</option>
                    </select>
              
              {useCustomDelivery && (
                    <input
                      type="text"
                  id="custom_delivery_company"
                  name="custom_delivery_company"
                  value={formData.custom_delivery_company}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900 font-medium"
                  placeholder="택배사명을 직접 입력해주세요"
                      required
                />
              )}
                  </div>
            
            {/* 2. 일정(근무 날짜) */}
                  <div>
              <label htmlFor="working_date" className="block text-sm font-medium text-gray-700 mb-1">
                일정(근무 날짜) <span className="text-red-500">*</span>
                    </label>
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    onCalendarOpen={handleCalendarClick}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900 font-medium"
                    placeholderText="시작일 선택"
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    isClearable
                    showPopperArrow={false}
                    calendarClassName="font-medium"
                    dayClassName={date => 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear()
                        ? "bg-blue-100 text-blue-800 font-bold"
                        : undefined
                    }
                    />
                  </div>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900 font-medium"
                    placeholderText="종료일 선택 (선택사항)"
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    isClearable
                    showPopperArrow={false}
                    calendarClassName="font-medium"
                    dayClassName={date => 
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear()
                        ? "bg-blue-100 text-blue-800 font-bold"
                        : undefined
                    }
                    />
                  </div>
                <input
                  type="text"
                  id="working_date"
                  name="working_date"
                  value={formData.working_date}
                      onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 bg-gray-50"
                  placeholder="날짜가 자동으로 입력됩니다"
                  readOnly
                  hidden
                />
                </div>
              </div>

            {/* 3. 물량(건수) */}
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      물량(건수) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-900 font-medium"
                placeholder="건수 입력"
                required
                    />
                  </div>
            
            {/* 4. 아파트, 지번 분포도 */}
                  <div>
                    <label htmlFor="distribution_type" className="block text-sm font-medium text-gray-700 mb-1">
                분포도(업무 난이도) <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="distribution_type"
                      name="distribution_type"
                      value={formData.distribution_type}
                      onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white font-medium"
                required
                    >
                <option value="" className="text-gray-600">선택하세요</option>
                      <option value="아파트 위주">아파트 위주</option>
                      <option value="지번 위주">지번 위주</option>
                      <option value="아파트/지번 혼합">아파트/지번 혼합</option>
                    </select>
                  </div>
            
            {/* 5. 터미널 위치 */}
                  <div>
                    <label htmlFor="location-search-input" className="block text-sm font-medium text-gray-700 mb-1">
                      터미널 위치 <span className="text-red-500">*</span>
                    </label>
                    <LocationSearch onLocationSelect={handleLocationSelect} useAdvancedMarker={false} />
                    {selectedLocation && (
                      <p className="mt-2 text-sm text-gray-600">
                        선택된 위치: {selectedLocation.name} ({selectedLocation.address})
                      </p>
                    )}
                  </div>

            {/* 6. 담당자 연락처 필드 제거 */}
              </div>

          <div className="flex justify-end space-x-4">
              <Link 
                href="/jobs" 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              >
              {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
} 