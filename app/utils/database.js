import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Ensure that the profiles table exists in Supabase
 * This should be called once during application initialization
 */
export const setupProfilesTable = async () => {
  const supabase = createClientComponentClient();
  
  // Check if profiles table exists, if not create it
  try {
    const { error } = await supabase.rpc('create_profiles_table_if_not_exists');
    
    if (error) {
      console.error('Error setting up profiles table:', error);
    }
  } catch (error) {
    console.error('Failed to setup profiles table:', error);
  }
};

/**
 * Check if the user has a profile
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - Returns true if the user has a profile
 */
export const hasUserProfile = async (userId) => {
  if (!userId) return false;
  
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // PGRST116 is the error code for "no rows returned" - not actually an error in this context
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking user profile:', error.message || error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Failed to check user profile:', error.message || error);
    return false;
  }
};

/**
 * Get user profile data
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - The user profile or null if not found
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // If no profile found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user profile:', error.message || error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error.message || error);
    return null;
  }
};

/**
 * Create or update user profile
 * @param {Object} profile - The profile data
 * @returns {Promise<Object|null>} - The created/updated profile or null if failed
 */
export const upsertUserProfile = async (profile) => {
  if (!profile || !profile.user_id) return null;
  
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile])
      .select()
      .single();
      
    if (error) {
      console.error('Error upserting user profile:', error.message || error);
      return null;
    }
    
    if (!data) {
      console.warn('No data returned from upsert operation');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to upsert user profile:', error.message || error);
    return null;
  }
}; 