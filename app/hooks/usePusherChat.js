import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, getChatHistory } from '../utils/pusherApi';

export default function usePusherChat(channelName, userId, recipientId = null, jobContext = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Load chat history
  const fetchChatHistory = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      
      const response = await getChatHistory(channelName);
      
      if (response.success && response.messages) {
        // If this is a refresh, only add new messages
        if (!isInitial && lastFetchTime) {
          const newMessages = response.messages.filter(
            msg => new Date(msg.timestamp) > lastFetchTime
          );
          
          if (newMessages.length > 0) {
            setMessages(prevMessages => [...prevMessages, ...newMessages]);
          }
        } else {
          setMessages(response.messages);
        }
        
        // Update last fetch time
        setLastFetchTime(new Date());
        setError(null);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setError('Failed to load chat history');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [channelName, lastFetchTime]);

  // Initial load of chat history
  useEffect(() => {
    if (channelName) {
      fetchChatHistory(true);
    }
  }, [channelName, fetchChatHistory]);

  // Function to refresh messages
  const refreshMessages = useCallback(() => {
    fetchChatHistory(false);
  }, [fetchChatHistory]);

  // Send message function
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !channelName || !userId) return false;

    try {
      const messageData = {
        text,
        userId,
        recipientId,
        timestamp: new Date().toISOString(),
        jobContext
      };

      const response = await sendChatMessage(channelName, 'chat-message', messageData);
      
      if (response.success) {
        // Optimistically add to UI
        setMessages(prev => [...prev, messageData]);
        setError(null);
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
      
      return false;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [channelName, userId, recipientId, jobContext]);

  // Add message to state (called when receiving messages from Pusher)
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(m => 
        m.timestamp === message.timestamp && 
        m.userId === message.userId &&
        m.text === message.text
      );
      
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    addMessage,
    refreshMessages
  };
} 