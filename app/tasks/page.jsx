'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../../lib/supabaseTask';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await getTasks(user.id);
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('작업 목록을 불러오는데 실패했습니다.');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">내 작업 목록</h1>
          <p className="mt-2 text-sm text-gray-600">현재 진행 중인 작업들을 관리하세요.</p>
        </div>

        <div className="mt-8">
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            새 작업 추가
          </Link>
        </div>

        <div className="mt-6 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-xl font-semibold text-gray-900">{task.title}</p>
                  <p className="mt-3 text-base text-gray-500">{task.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {task.status}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500">등록된 작업이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 