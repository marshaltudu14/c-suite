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
  const maxTokens = 50000; // Maximum tokens to include in context (reduced to 50k as requested)
  const oldestMessageIdRef = useRef(null);
  const systemPromptTokensRef = useRef(0); // To track system prompt tokens

  // Convert chat history to the format expected by useChat
  const convertHistoryToMessages = (history) => {
    return history.map((item) => ({
      id: item.id,
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.message,
    }));
  };

  // Limit messages to stay under token limit, preserving system prompts
  const limitMessagesToTokenCount = (messages, systemPrompt = "") => {
    let totalTokens = 0;
    const limitedMessages = [];

    // First, estimate system prompt tokens (these should never be truncated)
    const systemPromptTokens = estimateTokenCount(systemPrompt);
    systemPromptTokensRef.current = systemPromptTokens;

    // Available tokens for conversation messages
    const availableTokens = maxTokens - systemPromptTokens;

    if (availableTokens <= 0) {
      console.warn("System prompt exceeds token limit, may cause issues");
      // Still try to include at least some messages
    }

    // Process messages from newest to oldest (reverse order)
    // This ensures we keep the most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const tokenCount = estimateTokenCount(msg.content);

      if (totalTokens + tokenCount <= availableTokens) {
        limitedMessages.unshift(msg); // Add to beginning to maintain order
        totalTokens += tokenCount;
      } else {
        console.log(
          `Truncated ${
            messages.length - limitedMessages.length
          } older messages to stay within token limit`
        );
        break; // Stop once we hit the token limit
      }
    }

    console.log(
      `Using approximately ${
        totalTokens + systemPromptTokens
      } tokens (${totalTokens} for messages, ${systemPromptTokens} for system prompt)`
    );
    return limitedMessages;
  };

  const fetchChatHistory = async (agentId) => {
    if (!user) return;

    setLoadingHistory(true);
    setPage(1); // Reset pagination
    oldestMessageIdRef.current = null;
    setHasMoreMessages(true);

    try {
      // Improved API call with better error handling
      let response;
      try {
        response = await fetch(
          `/api/chat-history?agent=${agentId}&limit=${pageSize}&order=desc`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (fetchError) {
        console.error("Network error fetching chat history:", fetchError);
        toast.error("Network error loading chat history. Please try again.");
        setLoadingHistory(false);
        return;
      }

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

        // Convert history to messages format
        const historyMessages = convertHistoryToMessages(sortedData);

        // Get the current system prompt from the chat interface (if available)
        // For now we'll use an empty string as we don't have direct access to it
        const currentSystemPrompt = "";

        // Apply token limiting with system prompt consideration
        const limitedMessages = limitMessagesToTokenCount(
          historyMessages,
          currentSystemPrompt
        );

        // Log information about the loaded messages
        console.log(
          `Loaded ${sortedData.length} messages, using ${limitedMessages.length} after token limiting`
        );

        setMessages(limitedMessages);
      } else {
        setChatHistory([]);
        setMessages([]);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error processing chat history:", error);
      toast.error("Failed to process chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchOlderMessages = async (agentId) => {
    if (!user || !hasMoreMessages || loadingOlderMessages) return;

    setLoadingOlderMessages(true);
    try {
      const nextPage = page + 1;

      // Improved API call with better error handling
      let response;
      try {
        response = await fetch(
          `/api/chat-history?agent=${agentId}&limit=${pageSize}&page=${nextPage}&before=${oldestMessageIdRef.current}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (fetchError) {
        console.error("Network error fetching older messages:", fetchError);
        toast.error("Network error loading older messages. Please try again.");
        setLoadingOlderMessages(false);
        return;
      }

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

        // Get the current system prompt from the chat interface (if available)
        // For now we'll use an empty string as we don't have direct access to it
        const currentSystemPrompt = "";

        // Apply token limiting with system prompt consideration
        const limitedMessages = limitMessagesToTokenCount(
          historyMessages,
          currentSystemPrompt
        );
        setMessages(limitedMessages);

        // Update pagination state
        setPage(nextPage);
        setHasMoreMessages(data.data.length >= pageSize);

        console.log(
          `Loaded ${data.data.length} older messages, now have ${updatedHistory.length} total messages`
        );
      } else {
        setHasMoreMessages(false);
        console.log("No more older messages available");
      }
    } catch (error) {
      console.error("Error processing older messages:", error);
      toast.error("Failed to process older messages");
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
      // Instead of fetching last messages for each agent, just use default text
      // This optimizes the chat interface by reducing API calls

      // Create default chat previews for executives
      const newExecutiveChats = {};
      for (const exec of executivesData) {
        newExecutiveChats[exec.id] = `Chat with ${exec.name}`;
      }

      // Create default chat previews for employees
      const newEmployeeChats = {};
      for (const emp of employeesData) {
        newEmployeeChats[emp.id] = `Chat with ${emp.name}`;
      }

      return {
        executivesChats: newExecutiveChats,
        employeesChats: newEmployeeChats,
      };
    } catch (error) {
      console.error("Error setting up chat previews:", error);
      return { executivesChats: {}, employeesChats: {} };
    }
  };

  // Check if we need to load more messages when scrolling to top
  const checkAndLoadMoreMessages = useCallback(
    (scrollTop, agentId) => {
      // If we're near the top of the scroll container and have more messages
      if (scrollTop < 100 && hasMoreMessages && !loadingOlderMessages) {
        console.log("Near top of scroll container, loading more messages...");
        fetchOlderMessages(agentId);
      }
    },
    [hasMoreMessages, loadingOlderMessages, fetchOlderMessages]
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
