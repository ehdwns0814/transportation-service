'use client';

import Link from 'next/link';
import NavBar from '../../components/NavBar';

export default function CheckEmailPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-8">
              <svg 
                className="h-16 w-16 text-green-500 mx-auto" 
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
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">이메일을 확인해주세요</h2>
            <p className="text-gray-600 mb-8">
              회원가입을 완료하기 위해 이메일로 발송된 링크를 클릭해주세요.<br />
              이메일을 받지 못하셨다면 스팸 메일함을 확인하거나 다시 시도해주세요.
            </p>
            <div className="mt-6 space-y-4">
              <Link 
                href="/login" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인 페이지로 이동
              </Link>
              <Link 
                href="/" 
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 