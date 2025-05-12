import { useState } from 'react';

export default function AgencyProfileForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    agency_name: '',
    business_number: '',
    representative_name: '',
    phone: '',
    address: '',
    company_size: '',
    service_areas: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.agency_name.trim()) {
      newErrors.agency_name = '대리점명을 입력해주세요.';
    }
    
    if (!formData.business_number.trim()) {
      newErrors.business_number = '사업자 등록번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{2}-\d{5}$/.test(formData.business_number)) {
      newErrors.business_number = '올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)';
    }
    
    if (!formData.representative_name.trim()) {
      newErrors.representative_name = '대표자명을 입력해주세요.';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Add agency-specific fields
    const agencyProfile = {
      ...formData,
      profile_type: 'agency'
    };
    
    onSubmit(agencyProfile);
  };

  const formatBusinessNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
    }
  };

  const handleBusinessNumberChange = (e) => {
    const formattedValue = formatBusinessNumber(e.target.value);
    setFormData(prev => ({ ...prev, business_number: formattedValue }));
    
    // Clear error
    if (errors.business_number) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.business_number;
        return newErrors;
      });
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formattedValue }));
    
    // Clear error
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대리점 프로필 등록</h1>
        <p className="mt-2 text-gray-600">
          대리점 정보를 입력해주세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 대리점명 */}
          <div>
            <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-1">
              대리점명 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="agency_name"
              name="agency_name"
              value={formData.agency_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.agency_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="대리점 이름을 입력해주세요"
            />
            {errors.agency_name && <p className="mt-1 text-sm text-red-600">{errors.agency_name}</p>}
          </div>
          
          {/* 사업자 등록번호 */}
          <div>
            <label htmlFor="business_number" className="block text-sm font-medium text-gray-700 mb-1">
              사업자 등록번호 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="business_number"
              name="business_number"
              value={formData.business_number}
              onChange={handleBusinessNumberChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.business_number ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="사업자 등록번호 (예: 123-45-67890)"
            />
            {errors.business_number && <p className="mt-1 text-sm text-red-600">{errors.business_number}</p>}
          </div>
          
          {/* 대표자명 */}
          <div>
            <label htmlFor="representative_name" className="block text-sm font-medium text-gray-700 mb-1">
              대표자명 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="representative_name"
              name="representative_name"
              value={formData.representative_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.representative_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="대표자 이름을 입력해주세요"
            />
            {errors.representative_name && <p className="mt-1 text-sm text-red-600">{errors.representative_name}</p>}
          </div>
          
          {/* 연락처 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="연락 가능한 번호 (예: 02-1234-5678)"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          
          {/* 주소 */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              주소 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="회사 주소를 입력해주세요"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
          
          {/* 회사 규모 */}
          <div>
            <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">
              회사 규모
            </label>
            <select
              id="company_size"
              name="company_size"
              value={formData.company_size}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="1-10명">1-10명</option>
              <option value="11-50명">11-50명</option>
              <option value="51-100명">51-100명</option>
              <option value="101-500명">101-500명</option>
              <option value="500명 이상">500명 이상</option>
            </select>
          </div>
          
          {/* 서비스 지역 */}
          <div>
            <label htmlFor="service_areas" className="block text-sm font-medium text-gray-700 mb-1">
              서비스 지역
            </label>
            <input
              type="text"
              id="service_areas"
              name="service_areas"
              value={formData.service_areas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 서울, 경기 전체, 인천"
            />
          </div>
          
          {/* 회사 소개 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              회사 소개
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="회사에 대한 간략한 소개를 작성해주세요"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? '등록 중...' : '등록 완료'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 