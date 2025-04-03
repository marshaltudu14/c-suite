"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "@/app/_hooks/useAuth"; // Assuming useAuth provides user object

const ChatPreviewsContext = createContext({
  chatPreviews: {},
  loadingPreviews: true,
  fetchChatPreviews: async () => {}, // Add fetch function to context if needed for manual refresh
});

export function ChatPreviewsProvider({ children }) {
  const { user, loadingUser } = useAuth(); // Get user status from your auth hook
  const [chatPreviews, setChatPreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(true);

  const fetchChatPreviews = async () => {
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
        setChatPreviews(data.data);
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
  };

  useEffect(() => {
    // Fetch previews only when user authentication status is resolved and user exists
    if (!loadingUser) {
      fetchChatPreviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingUser]); // Re-fetch if user logs in/out

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
