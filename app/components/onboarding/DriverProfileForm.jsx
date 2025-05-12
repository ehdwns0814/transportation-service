import { useState } from 'react';

export default function DriverProfileForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle_type: '',
    license_number: '',
    experience_years: '',
    preferred_area: '',
    can_long_distance: false,
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
    }
    
    if (!formData.vehicle_type.trim()) {
      newErrors.vehicle_type = '차량 유형을 선택해주세요.';
    }
    
    if (!formData.license_number.trim()) {
      newErrors.license_number = '면허 번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Add driver-specific fields
    const driverProfile = {
      ...formData,
      profile_type: 'driver',
      experience_years: parseInt(formData.experience_years) || 0
    };
    
    onSubmit(driverProfile);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
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
        <h1 className="text-2xl font-bold text-gray-900">운전기사 프로필 등록</h1>
        <p className="mt-2 text-gray-600">
          기사 프로필 정보를 입력해주세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="이름을 입력해주세요"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="연락 가능한 번호 (예: 010-1234-5678)"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          
          {/* 차량 유형 */}
          <div>
            <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
              차량 유형 <span className="text-red-600">*</span>
            </label>
            <select
              id="vehicle_type"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.vehicle_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">차량 유형 선택</option>
              <option value="1톤">1톤</option>
              <option value="2.5톤">2.5톤</option>
              <option value="5톤">5톤</option>
              <option value="11톤">11톤</option>
              <option value="25톤">25톤</option>
            </select>
            {errors.vehicle_type && <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>}
          </div>
          
          {/* 면허 번호 */}
          <div>
            <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
              운전면허 번호 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="license_number"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.license_number ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="운전면허 번호를 입력해주세요"
            />
            {errors.license_number && <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>}
          </div>
          
          {/* 운전 경력 */}
          <div>
            <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
              운전 경력
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="ml-2 text-gray-700">년</span>
            </div>
          </div>
          
          {/* 선호 배송 지역 */}
          <div>
            <label htmlFor="preferred_area" className="block text-sm font-medium text-gray-700 mb-1">
              선호 배송 지역
            </label>
            <input
              type="text"
              id="preferred_area"
              name="preferred_area"
              value={formData.preferred_area}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 서울, 경기 남부"
            />
          </div>
          
          {/* 장거리 운행 가능 여부 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="can_long_distance"
              name="can_long_distance"
              checked={formData.can_long_distance}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="can_long_distance" className="ml-2 block text-sm text-gray-700">
              장거리 운행 가능
            </label>
          </div>
          
          {/* 추가 정보 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              추가 정보
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="운송 경험, 특기사항 등을 자유롭게 작성해주세요"
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