import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

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
    const { channelName, eventName, message } = body;
    
    if (!channelName || !eventName || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify sender is the authenticated user
    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }
    
    // Store message in database (optional but recommended)
    const { error: dbError } = await supabase
      .from('chat_messages')
      .insert({
        channel: channelName,
        sender_id: message.userId,
        recipient_id: message.recipientId,
        message: message.text,
        timestamp: message.timestamp,
        job_context: message.jobContext ? JSON.stringify(message.jobContext) : null
      });
    
    if (dbError) {
      console.error('Error storing message:', dbError);
      // Continue even if DB storage fails
    }
    
    // Trigger Pusher event
    await pusher.trigger(channelName, eventName, message);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 