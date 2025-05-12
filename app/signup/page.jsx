'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import StepByStepForm from '../components/StepByStepForm';
import NavBar from '../components/NavBar';
import Link from 'next/link';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-white py-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-[15%] -top-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/70 blur-3xl"></div>
          <div className="absolute -left-[15%] top-[40%] w-[40%] h-[40%] rounded-full bg-blue-100/70 blur-3xl"></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">회원가입</h1>
            <StepByStepForm isLogin={false} />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <Link href="/" className="flex items-center justify-center gap-2 hover:text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>메인 페이지로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 