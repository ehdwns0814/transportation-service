import { useState } from 'react';
import Image from 'next/image';

export default function RoleSelection({ onSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null);

  const roles = [
    {
      id: 'driver',
      title: '용차 기사',
      description: '운송 일감을 찾고 배송 업무를 수행합니다',
      icon: '/images/driver-icon.svg', // Make sure to add this image to your public folder
    },
    {
      id: 'agency',
      title: '대리점',
      description: '운송 일감을 등록하고 기사를 찾습니다',
      icon: '/images/agency-icon.svg', // Make sure to add this image to your public folder
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">역할을 선택해주세요</h1>
        <p className="mt-2 text-gray-600">
          서비스에서 어떤 역할로 참여하실지 선택해주세요
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`
              border rounded-lg p-6 cursor-pointer transition-all duration-200
              ${
                hoveredRole === role.id
                  ? 'border-blue-500 shadow-md transform scale-[1.02]'
                  : 'border-gray-200 hover:border-blue-300'
              }
            `}
            onClick={() => onSelect(role.id)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className="flex items-center justify-center mb-4">
              {/* Fallback div in case image is missing */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold">
                  {role.title.charAt(0)}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
              {role.title}
            </h2>
            <p className="text-center text-gray-600">{role.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          선택 후에도 나중에 계정 설정에서 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
} 