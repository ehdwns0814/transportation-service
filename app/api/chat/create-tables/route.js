import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create a simple chat table using raw SQL
    try {
      const { data: createTableResult, error: createTableError } = await supabase.rpc(
        'exec_sql',
        {
          sql_query: `
            -- Create a simple chats table if it doesn't exist
            CREATE TABLE IF NOT EXISTS chats (
              id SERIAL PRIMARY KEY,
              sender_id UUID REFERENCES auth.users(id),
              recipient_id UUID REFERENCES auth.users(id),
              channel_name TEXT,
              message TEXT NOT NULL,
              timestamp TIMESTAMPTZ DEFAULT now(),
              created_at TIMESTAMPTZ DEFAULT now()
            );
            
            -- Create indexes
            CREATE INDEX IF NOT EXISTS chats_sender_id_idx ON chats(sender_id);
            CREATE INDEX IF NOT EXISTS chats_recipient_id_idx ON chats(recipient_id);
            CREATE INDEX IF NOT EXISTS chats_channel_name_idx ON chats(channel_name);
            
            -- Enable RLS
            ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
            
            -- Create policy
            DROP POLICY IF EXISTS "Users can read their own chats" ON chats;
            CREATE POLICY "Users can read their own chats" 
              ON chats 
              FOR SELECT 
              USING (sender_id = auth.uid() OR recipient_id = auth.uid());
            
            DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
            CREATE POLICY "Users can insert their own chats" 
              ON chats 
              FOR INSERT 
              WITH CHECK (sender_id = auth.uid());
          `
        }
      );
      
      if (!createTableError) {
        // Table created successfully
        return NextResponse.json({ 
          success: true,
          message: 'Chats table created successfully'
        });
      }
    } catch (rpcError) {
      console.error('RPC exec_sql error:', rpcError.message);
      // Continue with alternative approaches
    }
    
    // If we're here, the first attempt failed - try a direct DDL operation
    const { error: directError } = await supabase.from('chats').select('id').limit(1);
    
    if (directError && directError.code === '42P01') { // Relation does not exist
      // Try to create a function that will create the table
      try {
        const { error: functionError } = await supabase.rpc(
          'exec_sql',
          {
            sql_query: `
              CREATE OR REPLACE FUNCTION create_simple_chat_table()
              RETURNS VOID
              LANGUAGE plpgsql
              SECURITY DEFINER
              AS $$
              BEGIN
                -- Create a simple chats table
                CREATE TABLE IF NOT EXISTS chats (
                  id SERIAL PRIMARY KEY,
                  sender_id UUID REFERENCES auth.users(id),
                  recipient_id UUID REFERENCES auth.users(id),
                  channel_name TEXT,
                  message TEXT NOT NULL,
                  timestamp TIMESTAMPTZ DEFAULT now(),
                  created_at TIMESTAMPTZ DEFAULT now()
                );
                
                -- Create indexes
                CREATE INDEX IF NOT EXISTS chats_sender_id_idx ON chats(sender_id);
                CREATE INDEX IF NOT EXISTS chats_recipient_id_idx ON chats(recipient_id);
                CREATE INDEX IF NOT EXISTS chats_channel_name_idx ON chats(channel_name);
                
                -- Enable RLS
                ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
                
                -- Create policy
                BEGIN
                  DROP POLICY IF EXISTS "Users can read their own chats" ON chats;
                EXCEPTION WHEN OTHERS THEN
                  NULL;
                END;
                
                CREATE POLICY "Users can read their own chats" 
                  ON chats 
                  FOR SELECT 
                  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
                
                BEGIN
                  DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
                EXCEPTION WHEN OTHERS THEN
                  NULL;
                END;
                
                CREATE POLICY "Users can insert their own chats" 
                  ON chats 
                  FOR INSERT 
                  WITH CHECK (sender_id = auth.uid());
              END;
              $$;
            `
          }
        );
        
        if (functionError) {
          return NextResponse.json({ 
            error: 'Failed to create function', 
            details: functionError.message,
            phase: 'function_creation'
          }, { status: 500 });
        }
        
        // Call the function
        try {
          const { error: callError } = await supabase.rpc('create_simple_chat_table');
          
          if (callError) {
            return NextResponse.json({ 
              error: 'Failed to call function', 
              details: callError.message,
              phase: 'function_call'
            }, { status: 500 });
          }
        } catch (callRpcError) {
          return NextResponse.json({ 
            error: 'Exception when calling function', 
            details: callRpcError.message,
            phase: 'function_call_exception'
          }, { status: 500 });
        }
      } catch (funcRpcError) {
        return NextResponse.json({ 
          error: 'Exception creating function', 
          details: funcRpcError.message,
          phase: 'function_creation_exception'
        }, { status: 500 });
      }
    }
    
    // Test if the table exists and is accessible
    const { data: testData, error: testError } = await supabase
      .from('chats')
      .select('id')
      .limit(1);
    
    return NextResponse.json({ 
      success: !testError,
      message: testError ? 'Failed to access chats table' : 'Chats table is ready',
      error: testError ? testError.message : null
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
} 