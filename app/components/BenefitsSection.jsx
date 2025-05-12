'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const BenefitsSection = () => {
  const benefits = [
    {
      id: 1,
      title: '중개 수수료 없음',
      description: '중개자 없이 직접 계약하여 일반 중개 플랫폼 대비 평균 12~18% 추가 수익',
      icon: '/icons/money-icon.svg',
      color: 'bg-green-100',
      metrics: '평균 월 120만원 추가 수익',
    },
    {
      id: 2,
      title: '안정적인 운송 계약',
      description: '장기 계약 우선 매칭으로 안정적인 수입을 보장받으세요',
      icon: '/icons/contract-icon.svg',
      color: 'bg-blue-100',
      metrics: '평균 계약 기간 8.5개월',
    },
    {
      id: 3,
      title: '빠른 대금 지급',
      description: '업계 최단 정산 시스템으로 운송 완료 후 최대 3일 내 대금 지급',
      icon: '/icons/fast-payment-icon.svg',
      color: 'bg-purple-100',
      metrics: '평균 지급 기간 2.3일',
    },
    {
      id: 4,
      title: '다양한 운송 옵션',
      description: '화물 종류, 거리, 시간대별 다양한 운송 옵션 중 원하는 조건만 선택',
      icon: '/icons/options-icon.svg',
      color: 'bg-yellow-100',
      metrics: '월 평균 2,400+ 신규 공고',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            다른 플랫폼과는 <span className="text-blue-600">다릅니다</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            중개사 없이 직접 계약하여 더 많은 수익을 가져가세요.
            대형 물류 운송사와 비교해 최대 25% 더 높은 수익을 얻을 수 있습니다.
          </p>
        </motion.div>

        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-blue-100/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute left-0 bottom-0 w-1/3 h-1/3 bg-indigo-100/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="lg:w-1/2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  일반 중개 플랫폼과 비교했을 때
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">12~18% 더 높은 수익</h4>
                      <p className="text-gray-600">중개 수수료가 없어 그만큼 더 많은 수익을 가져갑니다</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">45% 더 빠른 정산</h4>
                      <p className="text-gray-600">업계 최단 시간인 평균 2.3일 내에 대금을 받을 수 있습니다</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">30% 더 안정적인 계약</h4>
                      <p className="text-gray-600">장기 계약 위주로 안정적인 수입을 보장합니다</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <Image
                  src="/comparison-chart.png"
                  alt="플랫폼 비교 차트"
                  width={500}
                  height={320}
                  className="rounded-xl shadow-md"
                />
                
                <div className="mt-6 bg-white rounded-xl p-4 shadow border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">25%</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">전체 평균 수익 증가율</p>
                      <h4 className="text-lg font-semibold text-gray-900">평균 월 150만원 추가 수익</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.id}
              variants={item}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start space-x-5">
                <div className={`${benefit.color} p-3 rounded-xl`}>
                  <Image 
                    src={benefit.icon} 
                    alt={benefit.title} 
                    width={32} 
                    height={32} 
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4">{benefit.description}</p>
                  <div className="bg-gray-50 py-2 px-4 rounded-lg inline-block">
                    <p className="text-sm font-medium text-gray-800">{benefit.metrics}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <motion.a
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-lg"
          >
            <span>지금 시작하기</span>
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.a>
          <p className="mt-4 text-gray-500">가입 후 1분 이내에 이용 가능합니다</p>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection; 