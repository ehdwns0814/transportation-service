'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import RoleSelection from '../components/onboarding/RoleSelection';
import DriverProfileForm from '../components/onboarding/DriverProfileForm';
import AgencyProfileForm from '../components/onboarding/AgencyProfileForm';
import { toast } from 'react-hot-toast';

export default function OnboardingPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('role-selection'); // 'role-selection', 'profile-driver', 'profile-agency'
  const [selectedRole, setSelectedRole] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if user is logged in and profile status
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        console.log('Checking session in onboarding page...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error in onboarding:', error.message || error);
          router.push('/login');
          return;
        }
        
        if (!session) {
          console.log('No session found in onboarding, redirecting to login');
          // Redirect to login if no session
          router.push('/login');
          return;
        }
        
        console.log('Session found, user is authenticated:', session.user.id);
        setSession(session);
        
        // Check if user already has a profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profileError) {
            if (profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
              console.error('Error checking profile:', profileError.message || profileError);
            } else {
              console.log('No profile found, staying on onboarding page');
            }
          } else if (profile) {
            // If user already has a profile, redirect to profile page
            console.log('Profile found, redirecting to profile page');
            setProfileComplete(true);
            router.push('/profile');
            return;
          }
        } catch (profileError) {
          console.error('Error during profile check:', profileError.message || profileError);
          // Continue with onboarding even if profile check fails
        }
      } catch (error) {
        console.error('Error during session check:', error.message || error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [supabase, router]);

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(role === 'driver' ? 'profile-driver' : 'profile-agency');
  };

  // Handle profile form submission
  const handleProfileSubmit = async (profileData) => {
    try {
      setLoading(true);
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Create profile object with the right structure
      let profile = {
        user_id: session.user.id,
        role: selectedRole,
        created_at: new Date().toISOString()
      };
      
      // Add fields from the form data
      if (selectedRole === 'driver') {
        // Map driver-specific fields
        profile = {
          ...profile,
          name: profileData.name,
          phone: profileData.phone,
          vehicle_type: profileData.vehicle_type,
          license_number: profileData.license_number,
          experience_years: profileData.experience_years ? parseInt(profileData.experience_years) : 0,
          preferred_area: profileData.preferred_area,
          can_long_distance: !!profileData.can_long_distance,
          description: profileData.description
        };
      } else {
        // Map agency-specific fields
        profile = {
          ...profile,
          agency_name: profileData.agency_name,
          business_number: profileData.business_number,
          representative_name: profileData.representative_name,
          phone: profileData.phone,
          address: profileData.address,
          company_size: profileData.company_size,
          service_areas: profileData.service_areas,
          description: profileData.description
        };
      }
      
      // Insert into profiles table
      const { error } = await supabase
        .from('profiles')
        .insert([profile]);
        
      if (error) throw error;
      
      setProfileComplete(true);
      // Redirect to profile page with user ID
      router.push(`/profile/${session.user.id}`);
    } catch (error) {
      console.error('Error saving profile:', error.message || error);
      alert('Profile registration failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Add logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('로그아웃 되었습니다.');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error.message || error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto mb-4">
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </button>
      </div>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {step === 'role-selection' && (
          <RoleSelection onSelect={handleRoleSelect} />
        )}
        
        {step === 'profile-driver' && (
          <DriverProfileForm onSubmit={handleProfileSubmit} loading={loading} />
        )}
        
        {step === 'profile-agency' && (
          <AgencyProfileForm onSubmit={handleProfileSubmit} loading={loading} />
        )}
      </div>
    </div>
  );
} 