"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js"; // Import User type

// Define interface for chat history items from DB
interface ChatItem {
  id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string; // Assuming string from DB
}

// Define interface for the message format used by useChat hook or similar
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Define interface for person data used in fetchLastChats
interface PersonData {
  id: string;
  name: string;
}

// Approximate token count for a string (rough estimate)
const estimateTokenCount = (text: string): number => {
  // A very rough approximation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
};

// Type the user parameter and chatHistory state
export function useChatHistory(user: User | null) {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]); // Type the state
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Number of messages to fetch per page
  const maxTokens = 50000; // Maximum tokens to include in context (reduced to 50k as requested)
  const oldestMessageIdRef = useRef<string | null>(null); // Correctly typed useRef
  const systemPromptTokensRef = useRef<number>(0); // Type useRef

  // Convert chat history to the format expected by useChat
  const convertHistoryToMessages = (history: ChatItem[]): ChatMessage[] => { // Type parameter and return
    return history.map((item: ChatItem) => ({ // Type item
      id: item.id,
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.message,
    }));
  };

  // Limit messages to stay under token limit, preserving system prompts
  // Note: This function might be less relevant now if history isn't directly passed to useChat's messages state
  const limitMessagesToTokenCount = (messages: ChatMessage[], systemPrompt: string = ""): ChatMessage[] => { // Type parameters and return
    let totalTokens = 0;
    const limitedMessages: ChatMessage[] = []; // Type array

    const systemPromptTokens = estimateTokenCount(systemPrompt);
    systemPromptTokensRef.current = systemPromptTokens;
    const availableTokens = maxTokens - systemPromptTokens;

    if (availableTokens <= 0) {
      console.warn("System prompt exceeds token limit, may cause issues");
    }

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      // Ensure msg.content exists before estimating tokens
      const tokenCount = msg.content ? estimateTokenCount(msg.content) : 0;

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
    async (agentId: string) => { // Type agentId
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
          // Assert data.data type and fix sort
          const fetchedData = data.data as ChatItem[];
          const sortedData = [...fetchedData].sort(
            (a: ChatItem, b: ChatItem) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() // Fix sort and type a, b
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
    async (agentId: string) => { // Type agentId
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
          // Assert data.data type and fix sort
          const fetchedData = data.data as ChatItem[];
          const sortedNewData = [...fetchedData].sort(
            (a: ChatItem, b: ChatItem) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() // Fix sort and type a, b
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
    async (selectedPerson: PersonData | null) => { // Type selectedPerson
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
    async (executivesData: PersonData[], employeesData: PersonData[]) => { // Type parameters
      if (!user) return { executivesChats: {}, employeesChats: {} };
      try {
        const newExecutiveChats: { [key: string]: string } = {}; // Add index signature
        for (const exec of executivesData) {
          newExecutiveChats[exec.id] = `Chat with ${exec.name}`;
        }
        const newEmployeeChats: { [key: string]: string } = {}; // Add index signature
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
    (scrollTop: number, agentId: string, isOldestMessageInView: boolean = false) => { // Type parameters
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
