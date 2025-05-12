'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    content: "수수료 없이 일할 수 있어서 월 수입이 30% 이상 늘었어요. 중개사 통하지 않고 기업이랑 직접 계약해서 훨씬 투명해요.",
    author: "김철수",
    position: "5톤 트럭 운전기사, 45세",
    avatar: "/avatar-1.jpg",
    rating: 5
  },
  {
    id: 2,
    content: "운송 일감 찾는게 너무 어려웠는데, 이 서비스로 매주 안정적인 일감을 받고 있어요. 앱도 사용하기 쉽고 계약 관리도 간편해요.",
    author: "박영희",
    position: "프리랜서 운송기사, 38세",
    avatar: "/avatar-2.jpg",
    rating: 5
  },
  {
    id: 3,
    content: "20년 넘게 일했지만 이렇게 편리한 서비스는 처음이에요. 지금은 매월 일정하게 수입이 들어와 생활이 안정되었습니다.",
    author: "이민수",
    position: "대형 화물 운전기사, 52세",
    avatar: "/avatar-3.jpg",
    rating: 4
  },
  {
    id: 4,
    content: "일감 찾는데 시간 낭비 안해도 되고, 페이 협상도 투명하게 이루어져요. 대금 지급도 제때 이루어져서 신뢰할 수 있어요.",
    author: "정유진",
    position: "개인사업자 운송, 40세",
    avatar: "/avatar-4.jpg",
    rating: 5
  },
  {
    id: 5,
    content: "처음에는 반신반의했는데, 이제는 모든 일감을 여기서 찾아요. 중개 수수료가 없으니 실수령액이 많아져 더 좋네요.",
    author: "최동훈",
    position: "냉장 화물 운송기사, 36세",
    avatar: "/avatar-5.jpg",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState({});
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleImageError = (id) => {
    setImageLoadError(prev => ({...prev, [id]: true}));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    ));
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            실제 현장에서 <span className="text-blue-600">입증된</span> 서비스
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            3,000명 이상의 운송 기사가 직접 경험한 후기를 확인하세요
          </motion.p>
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-4">
                    <Image 
                      src={imageLoadError[testimonial.id] ? '/avatar-placeholder.svg' : testimonial.avatar}
                      alt={testimonial.author}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover border-2 border-blue-100"
                      onError={() => handleImageError(testimonial.id)}
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                    <div className="flex mt-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md"
          >
            더 많은 후기 보기
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 