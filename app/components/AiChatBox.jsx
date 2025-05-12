import { useState } from 'react';

export default function AiChatBox() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 질문을 채팅 기록에 추가
      const newQuestion = question.trim();
      setChatHistory(prev => [...prev, { type: 'question', content: newQuestion }]);
      
      // API 요청 - 서버 측 API 라우트를 통해 Gemini에 안전하게 요청
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: newQuestion }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '답변을 가져오는 데 실패했습니다.');
      }
      
      // 답변을 채팅 기록에 추가
      setChatHistory(prev => [...prev, { type: 'answer', content: data.answer }]);
      
      // 입력 필드 초기화
      setQuestion('');
      
    } catch (err) {
      console.error('AI 질의 오류:', err);
      setError(err.message || '서버 응답 오류가 발생했습니다.');
      
      // 오류 메시지를 채팅 기록에 추가
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: `오류: ${err.message || '서버 응답 오류가 발생했습니다.'}` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        AI 운송 서비스 어시스턴트
      </h2>
      
      {/* 채팅 기록 */}
      <div className="border rounded-md mb-4 bg-gray-50 p-4 h-64 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            운송 서비스와 관련된 질문을 입력해보세요.
          </p>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  chat.type === 'question' 
                    ? 'bg-blue-100 ml-8' 
                    : chat.type === 'error'
                    ? 'bg-red-100 mr-8'
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {chat.type === 'question' ? '질문' : chat.type === 'error' ? '오류 발생' : 'AI 답변'}
                </p>
                <p className={`whitespace-pre-wrap font-medium ${
                  chat.type === 'error' ? 'text-red-700' : 'text-gray-800'
                }`}>
                  {chat.content}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <p className="text-red-500 text-xs mt-1">환경 변수 설정이 필요할 수 있습니다. SETUP_GEMINI.md 파일을 참고하세요.</p>
        </div>
      )}
      
      {/* 질문 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="운송 서비스와 관련된 질문을 입력하세요..."
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className={`px-4 py-2 bg-blue-600 text-white rounded-r-md 
            ${loading || !question.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
            transition-colors font-medium`}
        >
          {loading ? '처리중...' : '질문하기'}
        </button>
      </form>
    </div>
  );
} 