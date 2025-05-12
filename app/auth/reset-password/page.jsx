'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import NavBar from '../../components/NavBar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      toast.success('비밀번호가 성공적으로 변경되었습니다');
      router.push('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || '비밀번호 재설정 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">비밀번호 재설정</h2>
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8자 이상의 비밀번호"
                />
                <p className="mt-1 text-xs text-gray-500">
                  8자 이상의 비밀번호를 입력해주세요
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호 확인"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : '비밀번호 변경하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 