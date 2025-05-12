import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Helper to get the site URL safely
const getSiteURL = () => {
  // Check if window is defined (browser) or not (server)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signInWithKakao = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signInWithNaver = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'naver',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Email/Password Authentication
export const signUpWithEmail = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: `${getSiteURL()}/auth/callback`,
    },
  });
  
  return { data, error };
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteURL()}/auth/reset-password`,
  });
  
  return { data, error };
}; 