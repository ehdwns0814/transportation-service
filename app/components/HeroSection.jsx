'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { signInWithGoogle, signInWithKakao, signInWithNaver, signOut } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const inviteLinkRef = useRef(null);
  const [loginLoading, setLoginLoading] = useState({
    google: false,
    kakao: false,
    naver: false
  });
  
  const { user } = useAuth();
  const router = useRouter();

  // 메트릭스 데이터 - 컴포넌트 외부에서 정의하여 재렌더링 방지
  const metrics = [
    { id: 1, value: "3,200+", label: "등록 기사", color: "blue", symbol: "+" },
    { id: 2, value: "420+", label: "파트너 기업", color: "green", symbol: "+" },
    { id: 3, value: "98%", label: "계약 성사율", color: "yellow", symbol: "%" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션
    setTimeout(() => {
      const generatedLink = `https://prematch.co.kr/invite/${btoa(email).substring(0, 8)}`;
      setInviteLink(generatedLink);
      setIsLoading(false);
      toast.success(`${email}로 초대 링크를 보냈습니다!`);
    }, 1000);
  };

  const copyInviteLink = () => {
    if (inviteLinkRef.current) {
      inviteLinkRef.current.select();
      document.execCommand('copy');
      toast.success('초대 링크가 클립보드에 복사되었습니다!');
    }
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('로그아웃되었습니다');
    } catch (error) {
      toast.error(`로그아웃 오류: ${error.message}`);
    }
  };
  
  const navigateToLogin = () => {
    router.push('/login');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(prev => ({ ...prev, google: true }));
      const { error } = await signInWithGoogle();
      if (error) throw error;
      toast.success('Google 로그인 진행중입니다.');
    } catch (error) {
      toast.error(`로그인 오류: ${error.message}`);
    } finally {
      setLoginLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setLoginLoading(prev => ({ ...prev, kakao: true }));
      const { error } = await signInWithKakao();
      if (error) throw error;
      toast.success('Kakao 로그인 진행중입니다.');
    } catch (error) {
      toast.error(`로그인 오류: ${error.message}`);
    } finally {
      setLoginLoading(prev => ({ ...prev, kakao: false }));
    }
  };

  const handleNaverLogin = async () => {
    try {
      setLoginLoading(prev => ({ ...prev, naver: true }));
      const { error } = await signInWithNaver();
      if (error) throw error;
      toast.success('Naver 로그인 진행중입니다.');
    } catch (error) {
      toast.error(`로그인 오류: ${error.message}`);
    } finally {
      setLoginLoading(prev => ({ ...prev, naver: false }));
    }
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50 to-white overflow-hidden py-12 sm:py-16 md:py-24 mt-16">
      {/* 배경 장식 간소화 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-[15%] -top-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/70 blur-3xl"></div>
        <div className="absolute -left-[15%] top-[40%] w-[40%] h-[40%] rounded-full bg-blue-100/70 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
          {/* Left content - Text and buttons */}
          <div className="flex-1 text-center md:text-left max-w-xl mx-auto md:mx-0 w-full pt-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight relative z-10"
            >
              물류 운송의 <span className="text-blue-600 relative">
                새로운 패러다임
                <span className="absolute bottom-0 left-0 w-full h-3 bg-blue-100 -z-10 transform -rotate-1"></span>
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed px-2 sm:px-0"
            >
              <span className="inline-block">중개사 수수료 없이</span>{' '}
              <span className="inline-block">기업과 운송기사를 직접 연결하는 플랫폼</span>
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-500 leading-relaxed px-2 sm:px-0"
            >
              <span className="inline-block">일반 중계플랫폼과 달리, 중간 수수료 없이</span>{' '}
              <span className="inline-block">더 높은 수익을 기사님께 드립니다.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 sm:mt-10 space-y-6"
            >
              {user ? (
                <div className="flex flex-col items-center md:items-start space-y-4 w-full">
                  <div className="bg-white rounded-lg p-4 shadow-md w-full">
                    <p className="text-gray-700 font-medium">로그인 됨: {user.email || user.user_metadata?.full_name || '사용자'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {user.app_metadata?.provider ? `${user.app_metadata.provider}로 로그인` : ''}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSignOut}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
                      >
                        로그아웃
                      </motion.button>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 bg-blue-600 rounded-full px-6 py-3 border-2 border-blue-600 shadow-md text-white font-medium w-full md:w-auto transition-all hover:bg-blue-700"
                  >
                    <span>마이페이지</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLoginClick}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-6 py-3 sm:py-4 border-2 border-blue-700 shadow-lg font-medium w-full sm:max-w-xs mx-auto md:mx-0 transition-all hover:bg-blue-700"
                  >
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-base sm:text-lg">로그인 / 회원가입</span>
                  </motion.button>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-6 sm:mt-8">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center p-2 sm:p-3 bg-white rounded-full shadow-md hover:shadow-lg"
                        disabled={loginLoading.google}
                      >
                        {loginLoading.google ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
                        ) : (
                          <Image 
                            src="/google-icon.svg" 
                            alt="Google" 
                            width={28}
                            height={28}
                            className="sm:w-8 sm:h-8"
                            unoptimized
                          />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleKakaoLogin}
                        className="flex items-center justify-center p-2 sm:p-3 bg-[#FEE500] rounded-full shadow-md hover:shadow-lg"
                        disabled={loginLoading.kakao}
                      >
                        {loginLoading.kakao ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-t-gray-800 border-gray-200 animate-spin" />
                        ) : (
                        <Image 
                          src="/kakao-icon.svg" 
                          alt="Kakao" 
                          width={28} 
                          height={28}
                          className="sm:w-8 sm:h-8"
                          unoptimized
                        />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNaverLogin}
                        className="flex items-center justify-center p-2 sm:p-3 bg-[#03C75A] rounded-full shadow-md hover:shadow-lg"
                        disabled={loginLoading.naver}
                      >
                        {loginLoading.naver ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-t-white border-gray-200 animate-spin" />
                        ) : (
                        <Image 
                          src="/naver-icon.svg" 
                          alt="Naver" 
                          width={28} 
                          height={28}
                          className="sm:w-8 sm:h-8"
                          unoptimized
                        />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
            
            {!user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 sm:mt-12 border-t border-gray-100 pt-6 sm:pt-8"
              >
                <p className="text-gray-700 font-medium mb-3 sm:mb-4">이메일로 초대 링크 받기</p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0 w-full max-w-md mx-auto md:mx-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소를 입력하세요"
                    className="flex-1 px-4 sm:px-5 py-3 rounded-lg sm:rounded-r-none border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 font-medium placeholder:text-gray-500 text-sm sm:text-base"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#3a7ff7' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white font-medium px-5 sm:px-8 py-3 rounded-lg sm:rounded-l-none hover:bg-blue-700 transition-all duration-200 shadow-lg flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "초대 링크 받기"}
                  </motion.button>
                </form>

                {inviteLink && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 max-w-md mx-auto md:mx-0"
                  >
                    <p className="text-sm text-gray-500 mb-2">초대 링크가 생성되었습니다:</p>
                    <div className="flex items-center">
                      <input
                        ref={inviteLinkRef}
                        readOnly
                        value={inviteLink}
                        className="flex-1 p-2 text-sm rounded-l-md border border-gray-300 bg-gray-50 overflow-ellipsis"
                      />
                      <button
                        onClick={copyInviteLink}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium p-2 rounded-r-md transition-colors"
                      >
                        복사
                      </button>
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="mt-4 text-center md:text-left"
                >
                  <p className="text-sm text-gray-600">
                    또는{' '}
                    <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                      지금 바로 회원가입
                    </Link>
                    {' '}하여 서비스를 이용해보세요.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
          
          {/* Right content - Metrics and CTA */}
          <div className="flex-1 max-w-lg mt-10 md:mt-0 w-full">
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-gray-100 mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">플랫폼 현황</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {metrics.map((metric) => (
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg" key={metric.id}>
                    <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${metric.color}-600`}>{metric.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">구인 공고 바로 확인하기</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">지금 420개 이상의 기업에서 운송 기사를 찾고 있어요</p>
              <motion.a
                href="/jobs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl py-3 sm:py-4 shadow-md transition-all"
              >
                <span>공고 바로 확인하기</span>
                <svg className="ml-1 h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 