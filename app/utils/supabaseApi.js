/**
 * Utilities for making direct REST API calls to Supabase
 */

/**
 * Makes a fetch request to Supabase REST API with the proper authentication headers
 * 
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchFromSupabase = async (url, options = {}) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }
  
  // Ensure we have headers object
  const headers = {
    ...options.headers || {},
    // Include both apikey and Authorization headers for Supabase
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
  
  // If URL is a relative path, prepend the Supabase URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${url}`;
    
  // Add retry logic with limits
  let attempts = 0;
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });
      
      // For 429 (Too Many Requests), we might want to retry
      if (response.status === 429 && attempts < MAX_RETRY_ATTEMPTS - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
        continue;
      }
      
      return response;
    } catch (error) {
      attempts++;
      if (attempts >= MAX_RETRY_ATTEMPTS) {
        throw new Error(`Failed to fetch after ${MAX_RETRY_ATTEMPTS} attempts: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
    }
  }
  
  // This should never be reached due to the error thrown in the catch block
  throw new Error('Failed to fetch from Supabase');
};

/**
 * Makes a GET request to Supabase REST API
 * 
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} - The parsed JSON response
 */
export const getFromSupabase = async (url, options = {}) => {
  try {
    const response = await fetchFromSupabase(url, {
      ...options,
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase REST API error: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Supabase GET request failed:', error);
    throw error;
  }
};

/**
 * Makes a POST request to Supabase REST API
 * 
 * @param {string} url - The URL to fetch from
 * @param {Object} body - The request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} - The parsed JSON response
 */
export const postToSupabase = async (url, body, options = {}) => {
  try {
    const response = await fetchFromSupabase(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase REST API error: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Supabase POST request failed:', error);
    throw error;
  }
};

/**
 * Check if Supabase environment variables are properly configured
 * @returns {Object} - Configuration status
 */
export const checkSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Validate anon key format (should be long string starting with "ey")
  const isValidKey = key && typeof key === 'string' && key.startsWith('ey') && key.length > 30;
  
  return {
    hasUrl: !!url,
    hasKey: !!key,
    url: url ? url : undefined,
    // Only show first few characters of the key for security
    key: key ? `${key.substring(0, 5)}...${key.substring(key.length - 3)}` : undefined,
    isConfigured: !!url && !!key,
    isValidKeyFormat: isValidKey
  };
}; 