# Supabase Integration Guide

This guide explains how to properly set up and use Supabase in this application.

## Setting Up Environment Variables

1. Create a `.env.local` file in the root directory if it doesn't exist already.

2. Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Replace `your_supabase_project_url` and `your_supabase_anon_key` with the actual values from your Supabase project.

   You can find these values in your Supabase dashboard under:
   - Project Settings > API > Project URL
   - Project Settings > API > Project API keys > `anon` `public`

4. **Important**: Make sure your ANON key is correctly copied from the Supabase dashboard. It should be a long string starting with `ey`.

## Verifying Your Configuration

Run the following command to verify that your Supabase environment variables are correctly set:

```bash
npm run check-env
```

## Best Practices for Using Supabase

### Recommended: Use the Supabase JS Client

Always prefer using the Supabase JavaScript client which automatically includes authentication headers:

```javascript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// In a component/page
const supabase = createClientComponentClient();
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### Alternative: Manual Client Creation

If for some reason you can't use `createClientComponentClient()`, you can create a client directly. Make sure to provide the correct URL and key:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### Direct REST API Calls (Not Recommended)

If you must make direct fetch calls to the Supabase REST API, always include **both** the `apikey` and `Authorization` headers:

```javascript
// NOT RECOMMENDED but shown for reference
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/your_table`,
  {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### Error Handling and Retry Logic

Always implement proper error handling with reasonable retry limits to avoid infinite retry loops:

```javascript
// Example of proper error handling with limited retries
async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        console.error(`Failed after ${maxRetries} attempts:`, error);
        throw error; // Rethrow after max retries
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      console.log(`Retrying in ${delay/1000}s... (Attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Using the Utility Function

We've included a utility function for making direct REST API calls to Supabase that automatically includes the required headers and implements retry logic:

```javascript
import { fetchFromSupabase } from '../utils/supabaseApi';

// Example usage
try {
  const data = await fetchFromSupabase('/rest/v1/your_table?select=*');
  // Process data
} catch (error) {
  // Handle error - don't retry infinitely
  console.error('Failed to fetch data:', error);
  // Show appropriate error message to user
}
```

## Common Issues

1. **"Failed to fetch" errors**: Make sure your Supabase URL and anon key are correctly set.

2. **401 Unauthorized errors**: This usually means either:
   - Your API key is incorrect or has expired
   - You're missing the `apikey` or `Authorization` header in your requests
   - You're using the wrong API key (anon vs service_role)

3. **"Missing environment variables"**: Run `npm run check-env` to verify your environment setup.

4. **Infinite loading or app freezing**: May be caused by infinite retry loops. Always implement maximum retry limits in your error handling.

## Example Components

Check out the example component that demonstrates all approaches:

```
app/components/examples/SupabaseClientExample.jsx
``` 