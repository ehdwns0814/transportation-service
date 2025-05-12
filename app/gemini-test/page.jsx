'use client';

import { useState } from 'react';

export default function GeminiTest() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      console.log('API 요청 시작:', question);
      
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      const data = await res.json();
      console.log('API 응답:', data);
      
      if (!res.ok) {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
      }
      
      setResponse(data);
    } catch (err) {
      console.error('오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Gemini API 테스트</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              질문 입력
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="운송 서비스에 대한 질문을 입력하세요..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={`px-4 py-2 rounded-md ${
              loading || !question.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium`}
          >
            {loading ? '처리 중...' : '질문하기'}
          </button>
        </form>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-lg font-semibold text-red-700 mb-2">오류 발생</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {response && (
          <div className="p-4 bg-white border shadow-sm rounded-md">
            <h2 className="text-lg font-semibold mb-2">Gemini API 응답</h2>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{response.answer}</p>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <p>모델: {response.model}</p>
              <p>응답 시간: {new Date(response.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 