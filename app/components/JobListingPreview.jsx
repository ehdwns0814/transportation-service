'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const JobCard = ({ title, date, salary, location, company, notes, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {date}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {location}
          </span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {company}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{notes}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-blue-600">{salary}</span>
          <Link href="/chat">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out text-sm">
              1:1 채팅
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const JobListingPreview = () => {
  const jobListings = [
    { 
      title: "서울 강남구 택배 배송 기사", 
      date: "5월 10일 ~ 5월 15일",
      salary: "일급 25만원", 
      location: "서울 강남구", 
      company: "A 택배",
      notes: "오전 8시 출근, 4톤 트럭 운전 가능자"
    },
    { 
      title: "인천 화물 운송 기사 모집", 
      date: "상시",
      salary: "건당 15만원", 
      location: "인천 전역", 
      company: "B 물류",
      notes: "1톤 탑차 소유자 우대, 유류비 지원"
    },
    { 
      title: "경기도 용인 새벽 배송", 
      date: "주 3회",
      salary: "일급 20만원", 
      location: "경기 용인시", 
      company: "C 쇼핑",
      notes: "새벽 3시 ~ 9시, 신선식품 배송"
    },
    { 
      title: "대전 장거리 운송 기사", 
      date: "월 10회",
      salary: "회당 30만원", 
      location: "대전 출발", 
      company: "D 운송",
      notes: "대전-부산 왕복, 숙박비 지원"
    },
    { 
      title: "수도권 식자재 배송", 
      date: "주 5일",
      salary: "월 450만원", 
      location: "수도권", 
      company: "E 푸드",
      notes: "냉장차 운전 경험자 우대"
    },
    { 
      title: "광주 당일 배송 기사", 
      date: "주 6일",
      salary: "월 500만원", 
      location: "광주 전역", 
      company: "F 익스프레스",
      notes: "오전 집하, 오후 배송, 차량 제공"
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">일감 미리보기</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            지금 바로 등록된 일감을 확인하고 직접 연락해보세요
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobListings.map((job, index) => (
            <JobCard 
              key={index}
              title={job.title}
              date={job.date}
              salary={job.salary}
              location={job.location}
              company={job.company}
              notes={job.notes}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/jobs">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-150 ease-in-out text-lg font-medium">
              모든 일감 보기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobListingPreview; 