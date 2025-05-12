'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/login');
          return;
        }
        
        // Redirect to the user's profile page with their ID
        router.push(`/profile/${session.user.id}`);
      } catch (error) {
        console.error('Error checking session:', error.message);
        router.push('/login');
      }
    };
    
    checkSession();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 