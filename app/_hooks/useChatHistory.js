"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

// Approximate token count for a string (rough estimate)
const estimateTokenCount = (text) => {
  // A very rough approximation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

export function useChatHistory(user, setMessages) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Number of messages to fetch per page
  const maxTokens = 100000; // Maximum tokens to include in context
  const oldestMessageIdRef = useRef(null);

  // Convert chat history to the format expected by useChat
  const convertHistoryToMessages = (history) => {
    return history.map((item) => ({
      id: item.id,
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.message,
    }));
  };

  // Limit messages to stay under token limit
  const limitMessagesToTokenCount = (messages) => {
    let totalTokens = 0;
    const limitedMessages = [];

    // Process messages from newest to oldest (reverse order)
    // This ensures we keep the most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const tokenCount = estimateTokenCount(msg.content);

      if (totalTokens + tokenCount <= maxTokens) {
        limitedMessages.unshift(msg); // Add to beginning to maintain order
        totalTokens += tokenCount;
      } else {
        break; // Stop once we hit the token limit
      }
    }

    return limitedMessages;
  };

  const fetchChatHistory = async (agentId) => {
    if (!user) return;

    setLoadingHistory(true);
    setPage(1); // Reset pagination
    oldestMessageIdRef.current = null;
    setHasMoreMessages(true);

    try {
      const response = await fetch(
        `/api/chat-history?agent=${agentId}&limit=${pageSize}&order=desc`
      );
      const data = await response.json();

      if (data.success && data.data) {
        // Sort by created_at to ensure correct order (newest last)
        const sortedData = [...data.data].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setChatHistory(sortedData);

        // Set the oldest message ID for pagination
        if (sortedData.length > 0) {
          oldestMessageIdRef.current = sortedData[0].id;
        }

        // Check if we have more messages
        setHasMoreMessages(data.data.length >= pageSize);

        // Convert history to messages format and set in the chat
        const historyMessages = convertHistoryToMessages(sortedData);

        // Apply token limiting
        const limitedMessages = limitMessagesToTokenCount(historyMessages);
        setMessages(limitedMessages);
      } else {
        setChatHistory([]);
        setMessages([]);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchOlderMessages = async (agentId) => {
    if (!user || !hasMoreMessages || loadingOlderMessages) return;

    setLoadingOlderMessages(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/chat-history?agent=${agentId}&limit=${pageSize}&page=${nextPage}&before=${oldestMessageIdRef.current}`
      );
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        // Sort by created_at to ensure correct order
        const sortedNewData = [...data.data].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        // Update the oldest message ID for next pagination
        if (sortedNewData.length > 0) {
          oldestMessageIdRef.current = sortedNewData[0].id;
        }

        // Combine with existing history
        const updatedHistory = [...sortedNewData, ...chatHistory];
        setChatHistory(updatedHistory);

        // Convert combined history to messages format
        const historyMessages = convertHistoryToMessages(updatedHistory);

        // Apply token limiting
        const limitedMessages = limitMessagesToTokenCount(historyMessages);
        setMessages(limitedMessages);

        // Update pagination state
        setPage(nextPage);
        setHasMoreMessages(data.data.length >= pageSize);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error fetching older messages:", error);
      toast.error("Failed to load older messages");
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const clearChatHistory = async (selectedPerson) => {
    if (!user || !selectedPerson) return;

    try {
      const response = await fetch(
        `/api/chat-history?agent=${selectedPerson.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        setChatHistory([]);
        setMessages([]);
        setPage(1);
        oldestMessageIdRef.current = null;
        setHasMoreMessages(false);
        toast.success("Chat history cleared");
      }
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const fetchLastChats = async (executivesData, employeesData) => {
    if (!user) return { executivesChats: {}, employeesChats: {} };

    try {
      // Fetch chat previews for executives
      const newExecutiveChats = {};
      for (const exec of executivesData) {
        try {
          const response = await fetch(
            `/api/chat-history?agent=${exec.id}&limit=1&order=desc`
          );
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            // Use the full message for preview
            newExecutiveChats[exec.id] = data.data[0].message;
          } else {
            newExecutiveChats[exec.id] = `Chat with ${exec.name}`;
          }
        } catch (error) {
          newExecutiveChats[exec.id] = `Chat with ${exec.name}`;
        }
      }

      // Fetch chat previews for employees
      const newEmployeeChats = {};
      for (const emp of employeesData) {
        try {
          const response = await fetch(
            `/api/chat-history?agent=${emp.id}&limit=1&order=desc`
          );
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            // Use the full message for preview
            newEmployeeChats[emp.id] = data.data[0].message;
          } else {
            newEmployeeChats[emp.id] = `Chat with ${emp.name}`;
          }
        } catch (error) {
          newEmployeeChats[emp.id] = `Chat with ${emp.name}`;
        }
      }

      return {
        executivesChats: newExecutiveChats,
        employeesChats: newEmployeeChats,
      };
    } catch (error) {
      console.error("Error fetching chats:", error);
      return { executivesChats: {}, employeesChats: {} };
    }
  };

  // Check if we need to load more messages when scrolling to top
  const checkAndLoadMoreMessages = useCallback(
    (scrollTop, agentId) => {
      // If we're near the top of the scroll container and have more messages
      if (scrollTop < 50 && hasMoreMessages && !loadingOlderMessages) {
        fetchOlderMessages(agentId);
      }
    },
    [hasMoreMessages, loadingOlderMessages]
  );

  return {
    chatHistory,
    loadingHistory,
    loadingOlderMessages,
    hasMoreMessages,
    fetchChatHistory,
    fetchOlderMessages,
    clearChatHistory,
    fetchLastChats,
    checkAndLoadMoreMessages,
  };
}
