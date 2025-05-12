'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signUpWithEmail, signInWithEmail } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Form steps for registration
const RegisterSteps = [
  {
    id: 'email',
    title: '이메일 입력',
    description: '이메일 주소를 입력해주세요',
    fields: ['email'],
  },
  {
    id: 'password',
    title: '비밀번호 설정',
    description: '안전한 비밀번호를 설정해주세요',
    fields: ['password', 'confirmPassword'],
  },
  {
    id: 'userInfo',
    title: '기본 정보\n입력',
    description: '이름과 전화번호를 입력해주세요',
    fields: ['name', 'phone'],
  },
  {
    id: 'terms',
    title: '이용약관 동의',
    description: '서비스 이용을 위한 약관에 동의해주세요',
    fields: ['acceptTerms', 'acceptPrivacy', 'acceptMarketing'],
  }
];

// Form steps for login
const LoginSteps = [
  {
    id: 'email',
    title: '이메일 입력',
    description: '가입하신 이메일 주소를 입력해주세요',
    fields: ['email'],
  },
  {
    id: 'password',
    title: '비밀번호 입력',
    description: '비밀번호를 입력해주세요',
    fields: ['password'],
  }
];

const StepByStepForm = ({ isLogin = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });
  
  const steps = isLogin ? LoginSteps : RegisterSteps;
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const validateStep = () => {
    const currentFields = steps[currentStep].fields;
    
    for (const field of currentFields) {
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
          toast.error('유효한 이메일 주소를 입력해주세요');
          return false;
        }
      }
      
      if (field === 'password' && !isLogin) {
        if (formData.password.length < 8) {
          toast.error('비밀번호는 8자 이상이어야 합니다');
          return false;
        }
      }
      
      if (field === 'confirmPassword') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('비밀번호가 일치하지 않습니다');
          return false;
        }
      }
      
      if (field === 'name' && !formData.name) {
        toast.error('이름을 입력해주세요');
        return false;
      }
      
      if (field === 'phone') {
        const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.replace(/-/g, ''))) {
          toast.error('유효한 전화번호를 입력해주세요');
          return false;
        }
      }
      
      if (field === 'acceptTerms' && !formData.acceptTerms) {
        toast.error('이용약관에 동의해주세요');
        return false;
      }
      
      if (field === 'acceptPrivacy' && !formData.acceptPrivacy) {
        toast.error('개인정보 처리방침에 동의해주세요');
        return false;
      }
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isLogin) {
        const { data, error } = await signInWithEmail(formData.email, formData.password);
        
        if (error) throw error;
        
        toast.success('로그인에 성공했습니다');
        router.push('/');
      } else {
        const userData = {
          name: formData.name,
          phone: formData.phone,
          marketing_consent: formData.acceptMarketing,
        };
        
        const { data, error } = await signUpWithEmail(
          formData.email, 
          formData.password,
          userData
        );
        
        if (error) throw error;
        
        if (data.user && data.session) {
          toast.success('회원가입에 성공했습니다');
          router.push('/');
        } else {
          toast.success('회원가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.');
          router.push('/auth/check-email');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    const step = steps[currentStep];
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
          <p className="mt-2 text-gray-600">{step.description}</p>
        </div>
        
        <div className="space-y-4">
          {step.fields.includes('email') && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 입력
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium placeholder-gray-400 shadow-sm transition-all"
                placeholder="example@example.com"
                required
              />
            </div>
          )}
          
          {step.fields.includes('password') && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 입력
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium placeholder-gray-400 shadow-sm transition-all"
                placeholder={isLogin ? "비밀번호 입력" : "8자 이상의 비밀번호"}
                required
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  8자 이상의 비밀번호를 입력해주세요
                </p>
              )}
              {isLogin && (
                <div className="mt-1 text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {step.fields.includes('confirmPassword') && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 입력
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium placeholder-gray-400 shadow-sm transition-all"
                placeholder="비밀번호 확인"
                required
              />
            </div>
          )}
          
          {step.fields.includes('name') && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 입력
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium placeholder-gray-400 shadow-sm transition-all"
                placeholder="홍길동"
                required
              />
            </div>
          )}
          
          {step.fields.includes('phone') && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                휴대폰 번호 입력
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium placeholder-gray-400 shadow-sm transition-all"
                placeholder="01012345678"
                required
              />
            </div>
          )}
          
          {step.fields.includes('acceptTerms') && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  <span className="font-medium text-gray-900">[필수]</span> 이용약관에 동의합니다
                </label>
                <button type="button" className="ml-auto text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  보기
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="acceptPrivacy" className="ml-2 block text-sm text-gray-700">
                  <span className="font-medium text-gray-900">[필수]</span> 개인정보 처리방침에 동의합니다
                </label>
                <button type="button" className="ml-auto text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  보기
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceptMarketing"
                  name="acceptMarketing"
                  checked={formData.acceptMarketing}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptMarketing" className="ml-2 block text-sm text-gray-700">
                  <span className="font-medium text-gray-900">[선택]</span> 마케팅 정보 수신에 동의합니다
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="mr-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm border border-gray-300"
            >
              이전
            </button>
          )}
          
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium shadow-md border-2 border-blue-700"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : currentStep === steps.length - 1 ? (isLogin ? '로그인' : '가입하기') : '다음'}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-12">
        {/* Progress bar container */}
        <div className="relative">          
          {/* Main step indicators container */}
          <div className="relative mx-[6px]">
            {/* Step circles container with flex - using items-start instead of items-center */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-col items-center">
                  {/* Outer container to maintain consistent horizontal alignment */}
                  <div className="flex items-center h-12 relative">
                    {/* Lines between circles - except for the last circle */}
                    {index < steps.length - 1 && (
                      <div 
                        className={`absolute top-[24px] left-[24px] h-1 
                          ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                        style={{ 
                          width: `calc((100% - ${steps.length * 48}px) / ${steps.length - 1})` 
                        }}
                      ></div>
                    )}
                    
                    {/* Step circle */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center 
                        ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} 
                        shadow-md transition-all duration-300 text-lg font-bold border-2 
                        ${index <= currentStep ? 'border-blue-500' : 'border-gray-300'}`}
                    >
                      {index < currentStep ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>
                  
                  {/* Step title - in a separate container */}
                  <span 
                    className={`block text-sm font-medium mt-2 text-center w-20 whitespace-pre-line
                      ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepByStepForm; 