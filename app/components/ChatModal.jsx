import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Chat from './Chat';

export default function ChatModal({ isOpen, onClose, recipientId, currentUserId, jobTitle }) {
  const [isValidRecipient, setIsValidRecipient] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (isOpen && recipientId) {
      validateRecipient();
    }
  }, [isOpen, recipientId]);
  
  const validateRecipient = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    if (!recipientId) {
      setIsValidRecipient(false);
      setErrorMessage('받는 사람 ID가 제공되지 않았습니다');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', recipientId)
        .maybeSingle();
        
      if (error) {
        console.error('Recipient validation error:', error);
        setIsValidRecipient(false);
        setErrorMessage('프로필 정보를 확인하는 중 오류가 발생했습니다');
      } else if (!data) {
        setIsValidRecipient(false);
        setErrorMessage('상대방 프로필이 존재하지 않습니다');
      } else {
        setIsValidRecipient(true);
        setRecipientName(data.name || '');
      }
    } catch (err) {
      console.error('Error checking recipient:', err);
      setIsValidRecipient(false);
      setErrorMessage('프로필 확인 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  // Create a unique channel name for this conversation
  // We sort the IDs to ensure the same channel regardless of who initiates
  const userIds = [currentUserId, recipientId].sort();
  const channelName = `private-chat-${userIds[0]}-${userIds[1]}`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            채팅: {jobTitle ? `"${jobTitle}" 관련 문의` : '작성자와 대화'}
            {recipientName && <span className="text-sm text-gray-500 ml-2">({recipientName}님과 대화)</span>}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat component */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : !isValidRecipient ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="bg-yellow-100 p-4 rounded-md text-center mb-4">
                <p className="text-yellow-800 font-medium">상대방 정보를 찾을 수 없습니다</p>
                <p className="text-yellow-700 text-sm mt-2">
                  {errorMessage || '이 사용자는 더 이상 존재하지 않거나 프로필이 삭제되었을 수 있습니다.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          ) : (
            <Chat 
              userId={currentUserId}
              channelName={channelName}
              recipientId={recipientId}
              jobContext={jobTitle ? { jobTitle } : null}
            />
          )}
        </div>
      </div>
    </div>
  );
} 