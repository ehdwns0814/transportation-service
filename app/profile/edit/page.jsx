'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ProfileEditPage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error.message);
          router.push('/login');
          return;
        }
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        setSession(session);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) {
          if (profileError.code === 'PGRST116') { // No profile found
            router.push('/onboarding');
            return;
          }
          throw profileError;
        }
        
        setProfile(profileData);
        // Initialize form data with profile data
        setFormData(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    checkSessionAndProfile();
  }, [supabase, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle radio inputs
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
      return;
    }
    
    // Handle text inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);
        
      if (error) throw error;
      
      toast.success('프로필이 업데이트되었습니다.');
      router.push(`/profile/${session.user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      toast.error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Update the input field classes for better visibility
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 font-medium text-base placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm";
  
  const labelClasses = "block text-sm font-semibold text-gray-800 mb-2";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">프로필 수정</h1>
          <Link href={`/profile/${session.user.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
            돌아가기
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
          {profile && (
            <form onSubmit={handleSubmit}>
              {/* Common fields */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-bold mb-6 text-gray-900">기본 정보</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClasses}>이메일</label>
                    <input
                      type="text"
                      disabled
                      value={session?.user?.email || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-800 font-medium shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">이메일은 변경할 수 없습니다.</p>
                  </div>
                </div>
              </div>
              
              {/* Profile specific fields based on role */}
              {profile.role === 'driver' ? (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900">용차 기사 정보</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="name" className={labelClasses}>이름</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="이름을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="experience_years" className={labelClasses}>택배 근무 경력 (년)</label>
                      <input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        min="0"
                        value={formData.experience_years || 0}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className={labelClasses}>거주지</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="거주지 주소를 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClasses}>연락처</label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="연락처를 입력하세요"
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center">
                        <input
                          id="returns_pickup"
                          name="returns_pickup"
                          type="checkbox"
                          checked={!!formData.returns_pickup}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="returns_pickup" className="ml-3 block text-base font-medium text-gray-800">
                          반품 회수 수행 가능
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>성별 (선택)</label>
                      <div className="flex items-center space-x-6 mt-1">
                        <div className="flex items-center">
                          <input
                            id="gender_male"
                            name="gender"
                            type="radio"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor="gender_male" className="ml-3 block text-base font-medium text-gray-800">
                            남성
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="gender_female"
                            name="gender"
                            type="radio"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor="gender_female" className="ml-3 block text-base font-medium text-gray-800">
                            여성
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="gender_none"
                            name="gender"
                            type="radio"
                            value=""
                            checked={!formData.gender}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor="gender_none" className="ml-3 block text-base font-medium text-gray-800">
                            미지정
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="age" className={labelClasses}>나이 (선택)</label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="0"
                        value={formData.age || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="나이를 입력하세요"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={labelClasses}>추가 정보</label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="추가 정보를 입력하세요"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900">대리점 정보</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="agency_name" className={labelClasses}>업체명</label>
                      <input
                        id="agency_name"
                        name="agency_name"
                        type="text"
                        value={formData.agency_name || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="업체명을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="delivery_company" className={labelClasses}>택배사</label>
                      <input
                        id="delivery_company"
                        name="delivery_company"
                        type="text"
                        value={formData.delivery_company || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="택배사 이름을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="working_date" className={labelClasses}>일정(근무 날짜)</label>
                      <input
                        id="working_date"
                        name="working_date"
                        type="text"
                        value={formData.working_date || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="근무 날짜를 입력하세요 (예: 월-금, 주 6일 등)"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity" className={labelClasses}>물량(건수)</label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="text"
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="일일 배송 물량을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="distribution_type" className={labelClasses}>아파트, 지번 분포도(업무 난이도)</label>
                      <input
                        id="distribution_type"
                        name="distribution_type"
                        type="text"
                        value={formData.distribution_type || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="예: 아파트 70%, 일반주택 30%, 아파트 밀집 지역"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="terminal_location" className={labelClasses}>터미널 위치</label>
                      <input
                        id="terminal_location"
                        name="terminal_location"
                        type="text"
                        value={formData.terminal_location || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="터미널 위치를 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClasses}>담당자 연락처</label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="담당자 연락처를 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={labelClasses}>추가 정보</label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="추가 정보를 입력하세요"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 mt-8">
                <Link
                  href={`/profile/${session.user.id}`}
                  className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 