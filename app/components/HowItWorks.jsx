'use client';

import { motion } from 'framer-motion';

const StepCard = ({ icon, number, title, desc, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
      className="bg-white rounded-lg p-6 shadow-md transition-all duration-300 border border-gray-100 relative"
    >
      <div className="absolute -top-4 -left-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
};

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">이용 방법</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            복잡한 과정 없이, 누구나 간단하게 시작할 수 있습니다
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* 연결선 (데스크톱에서만 표시) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 hidden md:block" style={{ transform: 'translateY(-50%)' }}></div>
          
          <StepCard 
            number="1"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            } 
            title="일감 리스트에서 원하는 공고를 찾으세요" 
            desc="다양한 지역과 조건의 일감을 한눈에 확인하고 선택하세요"
            delay={0.1}
          />
          
          <StepCard 
            number="2"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            } 
            title="클릭 한 번으로 바로 1:1 대화 시작" 
            desc="번거로운 절차 없이 클릭 한 번으로 공고 작성자와 직접 대화를 시작하세요"
            delay={0.2}
          />
          
          <StepCard 
            number="3"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } 
            title="채팅에서 조건 협의 후 간단하게 계약 완료!" 
            desc="중개 수수료 없이 직접 협의하고 계약하여 더 많은 수익을 가져가세요"
            delay={0.3}
          />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg text-blue-600 font-medium">
            복잡한 가입이나 중개사 없이, 누구나 간단하게 시작할 수 있습니다!
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 