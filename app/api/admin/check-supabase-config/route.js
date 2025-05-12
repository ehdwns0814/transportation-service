import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if environment variables are set
    const config = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? supabaseUrl : '(not set)',
      // Only show first few characters of the key for security
      key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 3)}` : '(not set)',
      isValidKeyFormat: supabaseAnonKey && typeof supabaseAnonKey === 'string' && supabaseAnonKey.startsWith('ey') && supabaseAnonKey.length > 30
    };
    
    // If both are set, try to make a test request to Supabase
    let testResult = null;
    if (config.hasUrl && config.hasKey) {
      try {
        // Test with proper headers (both apikey and Authorization)
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        testResult = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText
        };
        
        if (response.ok) {
          const data = await response.json();
          testResult.dataReceived = !!data;
          testResult.recordCount = Array.isArray(data) ? data.length : 'not an array';
        } else {
          // Attempt to get error details
          try {
            const errorBody = await response.text();
            testResult.errorDetails = errorBody;
          } catch (textError) {
            testResult.errorDetails = 'Could not read error details';
          }
        }
      } catch (error) {
        testResult = {
          success: false,
          error: error.message
        };
      }
      
      // If the first request failed, try without the Authorization header to see if that works
      if (testResult && !testResult.success) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
            method: 'GET',
            headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json'
            }
          });
          
          testResult.apiKeyOnlyTest = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
        } catch (error) {
          testResult.apiKeyOnlyTest = {
            success: false,
            error: error.message
          };
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      config,
      testResult,
      recommendations: getRuntimeRecommendations(config, testResult)
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
}

// Helper function to provide recommendations based on test results
function getRuntimeRecommendations(config, testResult) {
  const recommendations = [];
  
  if (!config.hasUrl || !config.hasKey) {
    recommendations.push("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
  }
  
  if (config.hasKey && !config.isValidKeyFormat) {
    recommendations.push("Your ANON_KEY doesn't match the expected format. Make sure you're using the 'anon' 'public' key from your Supabase dashboard, not the service_role key.");
  }
  
  if (testResult) {
    if (!testResult.success) {
      recommendations.push("API request failed. Check that your NEXT_PUBLIC_SUPABASE_ANON_KEY matches exactly with the key in your Supabase dashboard.");
      
      if (testResult.status === 401) {
        recommendations.push("401 Unauthorized error: This usually means your API key is incorrect or has expired. Regenerate it in the Supabase dashboard if needed.");
      }
      
      if (testResult.apiKeyOnlyTest && testResult.apiKeyOnlyTest.success) {
        recommendations.push("Request worked with just 'apikey' but not with 'Authorization' header. This is unusual but might be specific to your Supabase configuration.");
      }
    }
  }
  
  return recommendations;
} 