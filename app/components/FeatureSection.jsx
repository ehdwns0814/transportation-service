'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const FeatureSection = () => {
  const [iconLoadError, setIconLoadError] = useState({});

  const handleIconError = (id) => {
    setIconLoadError(prev => ({...prev, [id]: true}));
  };

  const features = [
    {
      id: 1,
      title: '원클릭 운송 계약',
      description: '복잡한 서류 작업 없이 몇 번의 클릭만으로 계약을 완료하세요.',
      icon: '/icons/click-icon.svg',
      fallbackIcon: '📝',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: '실시간 배송 추적',
      description: '화물의 현재 위치와 도착 예정 시간을 실시간으로 확인하세요.',
      icon: '/icons/tracking-icon.svg',
      fallbackIcon: '🔍',
      color: 'bg-green-500',
    },
    {
      id: 3,
      title: '안전한 결제 시스템',
      description: '운송이 완료된 후에 안전하게 결제가 이루어집니다.',
      icon: '/icons/payment-icon.svg',
      fallbackIcon: '💰',
      color: 'bg-purple-500',
    },
    {
      id: 4,
      title: '전문 고객 지원',
      description: '문제가 생겼을 때 언제든지 전문 상담원과 상담하세요.',
      icon: '/icons/support-icon.svg',
      fallbackIcon: '🎧',
      color: 'bg-yellow-500',
    },
    {
      id: 5,
      title: '자동 매칭 시스템',
      description: 'AI 기반 시스템이 최적의 운송 요청과 드라이버를 매칭합니다.',
      icon: '/icons/ai-icon.svg',
      fallbackIcon: '🤖',
      color: 'bg-red-500',
    },
    {
      id: 6,
      title: '다양한 차량 옵션',
      description: '용도에 맞는 다양한 차량 유형 중에서 선택하세요.',
      icon: '/icons/truck-icon.svg',
      fallbackIcon: '🚚',
      color: 'bg-indigo-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            최고의 <span className="text-blue-600">기능</span>으로 더 효율적인 운송
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            복잡한 운송 과정을 단순화하고, 더 빠르고 안전하게 운송할 수 있는 다양한 기능을 제공합니다.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 group"
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {iconLoadError[feature.id] ? (
                    <span className="text-white text-xl">{feature.fallbackIcon}</span>
                  ) : (
                    <Image 
                      src={feature.icon} 
                      alt={feature.title} 
                      width={24} 
                      height={24}
                      className="text-white" 
                      onError={() => handleIconError(feature.id)}
                      unoptimized
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              <div className={`h-1 ${feature.color} w-0 group-hover:w-full transition-all duration-300`}></div>
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl px-8 py-4 shadow-lg"
          >
            <a href="/features" className="flex items-center">
              <span>모든 기능 살펴보기</span>
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
          <p className="mt-4 text-gray-500">계속해서 새로운 기능이 추가되고 있습니다</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection; 