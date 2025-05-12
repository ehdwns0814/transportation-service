'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const TrustBadges = () => {
  const [imageLoadError, setImageLoadError] = useState({});

  const partners = [
    { id: 1, name: "현대로지스틱스", logo: "/logos/hyundai.svg" },
    { id: 2, name: "CJ대한통운", logo: "/logos/cj.svg" },
    { id: 3, name: "한진", logo: "/logos/hanjin.svg" },
    { id: 4, name: "롯데글로벌로지스", logo: "/logos/lotte.svg" },
    { id: 5, name: "쿠팡", logo: "/logos/coupang.svg" },
    { id: 6, name: "마켓컬리", logo: "/logos/kurly.svg" }
  ];
  
  const handleImageError = (id) => {
    setImageLoadError(prev => ({...prev, [id]: true}));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">신뢰할 수 있는 파트너사</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">전국의 다양한 물류 기업들이 프리매칭 서비스를 통해 최적의 운송 파트너를 찾고 있습니다</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center"
        >
          {partners.map((partner, index) => (
            <motion.div 
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center grayscale hover:grayscale-0 transition-all duration-300"
            >
              <div className="h-20 w-40 bg-white rounded-lg shadow-sm flex items-center justify-center p-4">
                <Image 
                  src={imageLoadError[partner.id] ? '/logo-placeholder.svg' : partner.logo} 
                  alt={partner.name}
                  width={120}
                  height={60}
                  className="max-h-12 object-contain"
                  onError={() => handleImageError(partner.id)}
                  unoptimized={true}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a 
            href="/partners" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            모든 파트너사 보기
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBadges; 