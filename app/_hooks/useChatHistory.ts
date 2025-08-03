
import { useState, useEffect, useCallback } from 'react';
import { CoreMessage } from 'ai';

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<CoreMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatHistory = useCallback(async (personId: string) => {
    setLoadingHistory(true);
    setError(null);
    try {
      // Mock data for chat history
      const mockHistory: CoreMessage[] = [
        { role: 'user', content: `Hello ${personId}, I have a question.` },
        { role: 'assistant', content: `Hi there! How can I help you today? This is a mock response for ${personId}.` },
      ];
      setChatHistory(mockHistory);
      setHasMoreMessages(false); // No more messages for mock data
    } catch (err) {
      setError('Failed to fetch chat history.');
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchOlderMessages = useCallback(async (personId: string) => {
    setLoadingOlderMessages(true);
    setError(null);
    try {
      // No older messages for mock data, so just simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      setHasMoreMessages(false);
    } catch (err) {
      setError('Failed to fetch older messages.');
      console.error(err);
    } finally {
      setLoadingOlderMessages(false);
    }
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
    setHasMoreMessages(false);
  }, []);

  const convertHistoryToMessages = useCallback((history: any[]): CoreMessage[] => {
    // Mock conversion, assuming history items have 'role' and 'content'
    return history.map(item => ({
      id: item.id,
      role: item.role,
      content: item.content,
    }));
  }, []);

  const limitMessagesToTokenCount = useCallback((messages: CoreMessage[], tokenLimit: number): CoreMessage[] => {
    // Mock limiting, just return all messages for simplicity
    return messages;
  }, []);

  const checkAndLoadMoreMessages = useCallback(() => {
    // Mock implementation, always false for mock data
    return false;
  }, []);

  return {
    chatHistory,
    loadingHistory,
    loadingOlderMessages,
    hasMoreMessages,
    error,
    fetchChatHistory,
    fetchOlderMessages,
    clearChatHistory,
    convertHistoryToMessages,
    limitMessagesToTokenCount,
    checkAndLoadMoreMessages,
  };
}
