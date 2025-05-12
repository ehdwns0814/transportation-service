import axios from 'axios';

// Get environment variables
const PUSHER_APP_ID = process.env.NEXT_PUBLIC_PUSHER_APP_ID;
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_SECRET = process.env.NEXT_PUBLIC_PUSHER_SECRET;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Create axios instance for Pusher API
const pusherApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a chat message through our API
 * @param {string} channelName - The channel to send message to
 * @param {string} eventName - Event name (e.g., 'chat-message')
 * @param {object} data - Message data
 * @returns {Promise} - API response
 */
export const sendChatMessage = async (channelName, eventName, data) => {
  try {
    if (!channelName || !data) {
      throw new Error('Missing required parameters');
    }
    
    // Use our own API endpoint instead of Pusher directly
    const response = await axios.post('/api/chat/send', {
      channelName,
      message: data,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Return a standardized error object instead of throwing
    return { success: false, error: error.message || 'Failed to send message' };
  }
};

/**
 * Fetch chat history from your backend
 * @param {string} channelName - Channel to get history for
 * @param {number} limit - Max number of messages
 * @returns {Promise} - Chat history
 */
export const getChatHistory = async (channelName, limit = 50) => {
  try {
    if (!channelName) {
      return { success: false, messages: [], error: 'Channel name is required' };
    }
    
    const response = await axios.get(`/api/chat/history`, {
      params: { channelName, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    // Return empty messages instead of throwing
    return { success: false, messages: [], error: error.message || 'Failed to fetch messages' };
  }
}; 