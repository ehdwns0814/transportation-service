'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import NavBar from '../../components/NavBar';
import { resetPassword } from '../../../lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('유효한 이메일 주소를 입력해주세요');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setSubmitted(true);
      toast.success('비밀번호 재설정 이메일을 발송했습니다');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {submitted ? (
              <div className="text-center">
                <svg 
                  className="h-16 w-16 text-green-500 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">이메일을 확인해주세요</h2>
                <p className="text-gray-600 mb-8">
                  {email} 주소로 비밀번호 재설정 링크를 발송했습니다.<br />
                  이메일에 포함된 링크를 클릭하여 비밀번호를 재설정해주세요.
                </p>
                <div className="mt-6 space-y-4">
                  <Link 
                    href="/login" 
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    로그인 페이지로 이동
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">비밀번호 찾기</h2>
                <p className="text-gray-600 mb-6 text-center">
                  가입하신 이메일 주소를 입력하시면<br />
                  비밀번호 재설정 링크를 보내드립니다.
                </p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 주소
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example@example.com"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : '비밀번호 재설정 링크 받기'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                    로그인 페이지로 돌아가기
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 