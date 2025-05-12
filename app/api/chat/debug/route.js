import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: sessionError.message,
        step: 'auth'
      }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'Not authenticated', 
        step: 'auth'
      }, { status: 401 });
    }
    
    // Test table existence
    const tableResults = {};
    
    // Try to query existing tables
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      tableResults.tables = tables || [];
      tableResults.tablesError = tablesError ? tablesError.message : null;
    } catch (e) {
      tableResults.tablesException = e.message;
    }
    
    // Try to create a simple message in a fallback way
    const testResult = {};
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          sender_id: session.user.id,
          message: 'Test message',
          timestamp: new Date().toISOString()
        })
        .select();
      
      testResult.insert = { success: !error, data: data, error: error?.message };
    } catch (e) {
      testResult.insertException = e.message;
      
      // If that failed, try to create the table first
      try {
        const { error: createError } = await supabase.rpc('create_simple_chat_table');
        testResult.createTable = { success: !createError, error: createError?.message };
        
        // Try insert again
        try {
          const { data, error } = await supabase
            .from('chats')
            .insert({
              sender_id: session.user.id,
              message: 'Test message after creation',
              timestamp: new Date().toISOString()
            })
            .select();
          
          testResult.insertAfterCreate = { success: !error, data: data, error: error?.message };
        } catch (e2) {
          testResult.insertAfterCreateException = e2.message;
        }
      } catch (rpcError) {
        testResult.createTableException = rpcError.message;
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      tableResults,
      testResult
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
} 