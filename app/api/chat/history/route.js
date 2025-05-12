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
    
    // Get channel name from query params
    const url = new URL(request.url);
    const channelName = url.searchParams.get('channelName');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    
    if (!channelName) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 });
    }
    
    let messages = [];
    
    // Try different approaches to fetch messages
    
    // First try: Query the messages table (most standard approach)
    try {
      const { data: messageData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelName)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (!messagesError && messageData && messageData.length > 0) {
        messages = messageData.map(msg => ({
          userId: msg.sender_id,
          recipientId: msg.recipient_id,
          text: msg.content,
          timestamp: msg.created_at,
          jobContext: msg.metadata ? JSON.parse(msg.metadata) : null
        }));
      } else if (messagesError) {
        console.error('Error with messages table:', messagesError);
        throw messagesError;
      }
    } catch (messagesError) {
      console.log('Messages table approach failed, trying alternative:', messagesError);
      
      // Second try: Try chat_messages table
      try {
        const { data: chatMessages, error: chatError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('channel', channelName)
          .order('timestamp', { ascending: true })
          .limit(limit);
        
        if (!chatError && chatMessages && chatMessages.length > 0) {
          messages = chatMessages.map(msg => ({
            userId: msg.sender_id,
            recipientId: msg.recipient_id,
            text: msg.message,
            timestamp: msg.timestamp,
            jobContext: msg.job_context ? JSON.parse(msg.job_context) : null
          }));
        } else if (chatError) {
          console.error('Error with chat_messages table:', chatError);
          throw chatError;
        }
      } catch (chatError) {
        console.log('Chat messages table approach failed, trying fallback:', chatError);
        
        // Final fallback: Try chat_data table
        try {
          const { data: chatData, error: dataError } = await supabase
            .from('chat_data')
            .select('*')
            .eq('channel_name', channelName)
            .eq('type', 'message')
            .order('created_at', { ascending: true })
            .limit(limit);
          
          if (!dataError && chatData && chatData.length > 0) {
            messages = chatData.map(msg => ({
              userId: msg.sender_id,
              recipientId: msg.recipient_id,
              text: msg.data.text,
              timestamp: msg.data.timestamp || msg.created_at,
              jobContext: msg.data.job_context || null
            }));
          }
        } catch (dataError) {
          console.error('All approaches failed:', dataError);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 