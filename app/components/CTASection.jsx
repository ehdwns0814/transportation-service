'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CTASection({ isAuthenticated }) {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };
  
  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-blue-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">준비되셨나요?</span>
          <span className="block text-blue-200">지금 바로 시작하세요.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          {isAuthenticated ? (
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
        >
                대시보드로 이동
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-md shadow">
                <Link href="/login">
                  <span className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                    로그인
                  </span>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
              href="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500"
            >
                  무료 회원가입
                </Link>
              </div>
            </>
          )}
          </div>
      </div>
    </div>
  );
} 