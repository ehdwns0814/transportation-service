import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Checks if a user with the specified ID exists and creates a dummy one if not
 * @param {string} userId - The user ID to check for
 * @returns {Promise<{success: boolean, message: string, data: any}>}
 */
export const checkAndCreateDummyUser = async (userId = '599dc79e-fd79-42b2-82a0-0aaca312d9ec') => {
  const supabase = createClientComponentClient();
  
  try {
    // First check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
      console.error('Error checking auth user:', authError);
      
      // Create a dummy user with this ID
      try {
        // We'll need to use a server function to create auth users
        // For this example, we'll just add to the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            name: '테스트 사용자',
            email: 'test@example.com',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (profileError) {
          return { 
            success: false, 
            message: '더미 사용자 프로필 생성 실패', 
            error: profileError 
          };
        }
        
        return { 
          success: true, 
          message: '더미 사용자 프로필이 생성되었습니다',
          data: profile 
        };
      } catch (error) {
        return { 
          success: false, 
          message: '더미 사용자 생성 중 오류 발생', 
          error 
        };
      }
    }
    
    // User exists, check if they have a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError && profileError.code === 'PGRST116') {
      // User exists in auth but has no profile, create one
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          name: '테스트 사용자',
          email: authUser?.user?.email || 'test@example.com',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (newProfileError) {
        return { 
          success: false, 
          message: '사용자 프로필 생성 실패', 
          error: newProfileError 
        };
      }
      
      return { 
        success: true, 
        message: '사용자 프로필이 생성되었습니다', 
        data: newProfile 
      };
    } else if (profileError) {
      return { 
        success: false, 
        message: '프로필 확인 중 오류 발생', 
        error: profileError 
      };
    }
    
    // User and profile both exist
    return { 
      success: true, 
      message: '사용자가 이미 존재합니다', 
      data: { user: authUser, profile } 
    };
    
  } catch (error) {
    return { 
      success: false, 
      message: '사용자 확인 중 오류 발생', 
      error 
    };
  }
};

// Auto-execute on import
checkAndCreateDummyUser()
  .then(result => console.log('Dummy user check result:', result))
  .catch(err => console.error('Error in dummy user check:', err)); 