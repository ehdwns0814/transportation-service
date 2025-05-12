import { useState, useEffect, useRef } from 'react';
import usePusherChat from '../hooks/usePusherChat';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Chat({ userId, channelName = 'general', recipientId = null, jobContext = null }) {
  const [message, setMessage] = useState('');
  const chatBoxRef = useRef(null);
  const router = useRouter();
  const [recipient, setRecipient] = useState(null);
  const [userError, setUserError] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    addMessage,
    refreshMessages
  } = usePusherChat(channelName, userId, recipientId, jobContext);

  // Setup polling for messages instead of Pusher
  useEffect(() => {
    // Poll for new messages every 3 seconds
    const pollingInterval = setInterval(() => {
      refreshMessages();
    }, 3000);
    
    // Fetch recipient info if this is a direct message
    if (recipientId && !fetchAttempted) {
      fetchRecipientInfo();
      setFetchAttempted(true);
    }

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [channelName, userId, recipientId, refreshMessages, fetchAttempted]);

  // Fetch recipient user information
  const fetchRecipientInfo = async () => {
    try {
      if (!recipientId) return;
      
      // Fetch user profile from Supabase
      const response = await axios.get(`/api/users/${recipientId}`);
      if (response.data && response.data.user) {
        setRecipient(response.data.user);
        setUserError(null);
      }
    } catch (error) {
      console.error('Error fetching recipient info:', error);
      
      // Check for 404 error specifically
      if (error.response && error.response.status === 404) {
        setUserError('유저가 존재하지 않습니다');
        // Set a placeholder recipient to prevent further API calls
        setRecipient({ name: '존재하지 않는 사용자' });
      } else {
        setUserError('사용자 정보를 불러오는 중 오류가 발생했습니다');
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const success = await sendMessage(message);
    if (success) {
      setMessage('');
      // Refresh messages immediately after sending
      refreshMessages();
    }
  };

  // Send initial job context message if this is a new conversation
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (jobContext && messages.length === 0 && !loading && !userError) {
        // This is a new conversation about a job
        const initialMessage = `안녕하세요! "${jobContext.jobTitle}" 일감에 대해 문의드립니다.`;
        await sendMessage(initialMessage);
      }
    };

    sendInitialMessage();
  }, [loading, messages, jobContext, sendMessage, userError]);

  return (
    <div className="flex flex-col h-full w-full">      
      {/* User error message */}
      {userError && (
        <div className="bg-red-100 text-red-800 p-4 text-center">
          {userError}
        </div>
      )}
      
      {/* Messages area */}
      <div 
        ref={chatBoxRef}
        className="flex-1 p-4 overflow-y-auto bg-white"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            {userError ? '채팅을 시작할 수 없습니다.' : '대화를 시작해 보세요!'}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.userId === userId 
                    ? 'ml-auto bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="font-bold text-xs mb-1">
                  {msg.userId === userId ? '나' : (recipient?.name || `사용자 ${msg.userId.substring(0, 6)}...`)}
                </div>
                <p>{msg.text}</p>
                <div className="text-xs opacity-70 text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form 
        onSubmit={handleSendMessage}
        className="border-t p-4 bg-gray-100"
      >
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={userError ? "채팅 불가" : "메시지를 입력하세요..."}
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || userError}
          />
          <button
            type="submit"
            disabled={loading || !message.trim() || userError}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-400"
          >
            보내기
          </button>
        </div>
      </form>
    </div>
  );
} 