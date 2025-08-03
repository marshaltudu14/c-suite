"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "@/app/_hooks/useAuth"; // Assuming useAuth provides user object

const ChatPreviewsContext = createContext({
  chatPreviews: {},
  loadingPreviews: true,
  fetchChatPreviews: async () => {}, // Add fetch function to context if needed for manual refresh
});

// Define props interface for the provider
interface ChatPreviewsProviderProps {
  children: React.ReactNode;
}

export function ChatPreviewsProvider({ children }: ChatPreviewsProviderProps) {
  const { user, loadingUser } = useAuth(); // Get user status from your auth hook
  const [chatPreviews, setChatPreviews] = useState<{ [key: string]: string }>({}); // Add index signature
  const [loadingPreviews, setLoadingPreviews] = useState(true);

  const fetchChatPreviews = useCallback(async () => {
    if (!user) {
      setChatPreviews({}); // Clear previews if no user
      setLoadingPreviews(false);
      return;
    }

    setLoadingPreviews(true);
    try {
      const response = await fetch("/api/last-chats"); // Fetch from the new endpoint
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();

      if (data.success && data.data) {
        // Assuming data.data is an object with string keys and string values
        setChatPreviews(data.data as { [key: string]: string });
      } else {
        console.error("Failed to fetch last chats:", data.error);
        setChatPreviews({}); // Set empty on failure
      }
    } catch (error) {
      console.error("Error fetching last chat previews:", error);
      setChatPreviews({}); // Set empty on error
    } finally {
      setLoadingPreviews(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch previews only when user authentication status is resolved
    if (!loadingUser) {
      fetchChatPreviews();
    }
  }, [loadingUser, fetchChatPreviews]); // Use memoized fetchChatPreviews

  const value = {
    chatPreviews,
    loadingPreviews,
    fetchChatPreviews, // Expose fetch function if manual refresh is desired
  };

  return (
    <ChatPreviewsContext.Provider value={value}>
      {children}
    </ChatPreviewsContext.Provider>
  );
}

// Custom hook to use the context easily
export const useChatPreviews = () => {
  return useContext(ChatPreviewsContext);
};
