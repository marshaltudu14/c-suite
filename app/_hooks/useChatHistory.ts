"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

// Approximate token count for a string (rough estimate)
const estimateTokenCount = (text) => {
  // A very rough approximation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

// Removed setMessages parameter
export function useChatHistory(user) {
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
  // Note: This function might be less relevant now if history isn't directly passed to useChat's messages state
  const limitMessagesToTokenCount = (messages, systemPrompt = "") => {
    let totalTokens = 0;
    const limitedMessages = [];

    const systemPromptTokens = estimateTokenCount(systemPrompt);
    systemPromptTokensRef.current = systemPromptTokens;
    const availableTokens = maxTokens - systemPromptTokens;

    if (availableTokens <= 0) {
      console.warn("System prompt exceeds token limit, may cause issues");
    }

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const tokenCount = estimateTokenCount(msg.content);

      if (totalTokens + tokenCount <= availableTokens) {
        limitedMessages.unshift(msg);
        totalTokens += tokenCount;
      } else {
        console.log(
          `Truncated ${
            messages.length - limitedMessages.length
          } older messages to stay within token limit`
        );
        break;
      }
    }

    console.log(
      `Using approximately ${
        totalTokens + systemPromptTokens
      } tokens (${totalTokens} for messages, ${systemPromptTokens} for system prompt)`
    );
    return limitedMessages;
  };

  // Wrap fetchChatHistory with useCallback
  const fetchChatHistory = useCallback(
    async (agentId) => {
      if (!user) return;

      setLoadingHistory(true);
      setPage(1);
      oldestMessageIdRef.current = null;
      setHasMoreMessages(true);

      try {
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
          const sortedData = [...data.data].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setChatHistory(sortedData); // Store the raw history

          if (sortedData.length > 0) {
            oldestMessageIdRef.current = sortedData[0].id;
          }
          setHasMoreMessages(data.data.length >= pageSize);

          // Convert history to messages format for potential use with initialMessages
          const historyMessages = convertHistoryToMessages(sortedData);
          // Apply token limiting if needed before passing as initialMessages
          // const limitedMessages = limitMessagesToTokenCount(historyMessages, ""); // Pass system prompt if available
          // console.log(`Loaded ${sortedData.length} messages, using ${limitedMessages.length} after token limiting`);
          // Don't call setMessages here
        } else {
          setChatHistory([]);
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Error processing chat history:", error);
        toast.error("Failed to process chat history");
      } finally {
        setLoadingHistory(false);
      }
    },
    [user, pageSize] // Removed setMessages dependency
  );

  // Wrap fetchOlderMessages with useCallback
  const fetchOlderMessages = useCallback(
    async (agentId) => {
      if (!user || !hasMoreMessages || loadingOlderMessages) return;
      if (!oldestMessageIdRef.current) {
        console.warn("No oldest message ID available for pagination");
        return;
      }

      setLoadingOlderMessages(true);
      try {
        const nextPage = page + 1;
        let response;
        try {
          response = await fetch(
            `/api/chat-history?agent=${agentId}&limit=${pageSize}&before=${oldestMessageIdRef.current}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
        } catch (fetchError) {
          console.error("Network error fetching older messages:", fetchError);
          toast.error(
            "Network error loading older messages. Please try again."
          );
          setLoadingOlderMessages(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const sortedNewData = [...data.data].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );

          if (sortedNewData.length > 0) {
            oldestMessageIdRef.current = sortedNewData[0].id;
          }

          const updatedHistory = [...sortedNewData, ...chatHistory];
          setChatHistory(updatedHistory); // Update raw history

          // Convert combined history to messages format if needed elsewhere
          // const historyMessages = convertHistoryToMessages(updatedHistory);
          // Apply token limiting if needed
          // const limitedMessages = limitMessagesToTokenCount(historyMessages, "");
          // Don't call setMessages here

          setPage(nextPage);
          setHasMoreMessages(data.data.length >= pageSize);
        } else {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Error processing older messages:", error);
        toast.error("Failed to process older messages");
      } finally {
        setLoadingOlderMessages(false);
      }
    },
    [
      user,
      hasMoreMessages,
      loadingOlderMessages,
      page,
      pageSize,
      chatHistory,
      // Removed setMessages dependency
    ]
  );

  // Wrap clearChatHistory with useCallback
  const clearChatHistory = useCallback(
    async (selectedPerson) => {
      if (!user || !selectedPerson) return;
      try {
        const response = await fetch(
          `/api/chat-history?agent=${selectedPerson.id}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        if (data.success) {
          setChatHistory([]); // Clear local raw history
          // Don't call setMessages here
          setPage(1);
          oldestMessageIdRef.current = null;
          setHasMoreMessages(false);
          toast.success("Chat history cleared");
        }
      } catch (error) {
        console.error("Error clearing chat history:", error);
        toast.error("Failed to clear chat history");
      }
    },
    [user] // Removed setMessages dependency
  );

  // fetchLastChats remains unchanged as it doesn't interact with setMessages
  const fetchLastChats = useCallback(
    async (executivesData, employeesData) => {
      if (!user) return { executivesChats: {}, employeesChats: {} };
      try {
        const newExecutiveChats = {};
        for (const exec of executivesData) {
          newExecutiveChats[exec.id] = `Chat with ${exec.name}`;
        }
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
    },
    [user]
  );

  // checkAndLoadMoreMessages remains largely the same, relying on fetchOlderMessages
  const checkAndLoadMoreMessages = useCallback(
    (scrollTop, agentId, isOldestMessageInView = false) => {
      const loadOlder = async () => {
        await fetchOlderMessages(agentId);
      };
      if (isOldestMessageInView && hasMoreMessages && !loadingOlderMessages) {
        loadOlder();
      } else if (scrollTop < 100 && hasMoreMessages && !loadingOlderMessages) {
        loadOlder();
      }
    },
    [hasMoreMessages, loadingOlderMessages, fetchOlderMessages]
  );

  // Return the raw chatHistory along with other states/functions
  return {
    chatHistory, // Return the raw history array
    loadingHistory,
    loadingOlderMessages,
    hasMoreMessages,
    fetchChatHistory,
    fetchOlderMessages,
    clearChatHistory,
    fetchLastChats,
    checkAndLoadMoreMessages,
    convertHistoryToMessages, // Expose converter function if needed by client
    limitMessagesToTokenCount, // Expose limiter function if needed
  };
}
