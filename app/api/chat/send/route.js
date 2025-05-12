import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const { channelName, message } = body;
    
    if (!channelName || !message || !message.text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify sender is the authenticated user
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }
    
    // Prepare message data with timestamp
    const messageData = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    // First, make sure the chat_messages table exists
    // This is a workaround for a new project without migrations applied
    try {
      await supabase.rpc('ensure_chat_tables', {
        channel_name: channelName
      });
    } catch (rpcError) {
      console.log("RPC not available, attempting direct table operations:", rpcError.message);
      // Continue with operation even if RPC fails
    }
    
    // Try to insert the message into the messages table
    try {
      // Store message in database
      const { data, error: dbError } = await supabase
        .from('messages')
        .insert({
          channel_id: channelName,
          sender_id: messageData.userId,
          recipient_id: messageData.recipientId,
          content: messageData.text,
          created_at: messageData.timestamp,
          metadata: messageData.jobContext ? JSON.stringify(messageData.jobContext) : null
        })
        .select();
      
      if (dbError) {
        throw dbError;
      }
      
      return NextResponse.json({ 
        success: true,
        message: messageData
      }, { status: 200 });
    } catch (insertError) {
      console.error("Error with messages table, falling back to direct SQL:", insertError);
      
      // If the table doesn't exist or has different structure, create a simple message record
      try {
        const { data, error: rawError } = await supabase.rpc('store_chat_message', {
          p_channel_name: channelName,
          p_sender_id: messageData.userId,
          p_recipient_id: messageData.recipientId,
          p_message: messageData.text,
          p_timestamp: messageData.timestamp,
          p_metadata: messageData.jobContext ? JSON.stringify(messageData.jobContext) : null
        });
        
        if (rawError) {
          throw rawError;
        }
        
        return NextResponse.json({ 
          success: true,
          message: messageData
        }, { status: 200 });
      } catch (rpcError) {
        console.error('Error storing message with RPC:', rpcError.message);
        
        // Last resort: Store in a general table
        const { error: fallbackError } = await supabase
          .from('chat_data')
          .insert({
            type: 'message',
            sender_id: messageData.userId,
            recipient_id: messageData.recipientId,
            channel_name: channelName,
            data: {
              text: messageData.text,
              timestamp: messageData.timestamp,
              job_context: messageData.jobContext
            }
          });
        
        if (fallbackError) {
          console.error('Final fallback error:', fallbackError);
          return NextResponse.json({ error: 'Failed to store message' }, { status: 500 });
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 