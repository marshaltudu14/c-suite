"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { Loader2 } from "lucide-react";

// Custom hooks
import { useAuth } from "@/app/_hooks/useAuth";
import { useCompanyDetails } from "@/app/_hooks/useCompanyDetails";
import { useChatHistory } from "@/app/_hooks/useChatHistory";
import { useFileHandling } from "@/app/_hooks/useFileHandling";
import { useScrollHandling } from "@/app/_hooks/useScrollHandling";

// Components
import ContactsList from "@/app/_chatComponents/ContactList";
import ChatTopBar from "@/app/_chatComponents/ChatTopBar";
import { ScrollToBottomButton } from "@/app/_chatComponents/Components";
import ChatArea from "@/app/_chatComponents/ChatArea";
import PastedContent from "@/app/_chatComponents/PastedContent";
import AttachmentsPreview from "@/app/_chatComponents/AttachmentsPreview";
import UploadProgress from "@/app/_chatComponents/UploadProgress";
import ModelSelector from "@/app/_chatComponents/ModelSelector";
import ChatInput from "@/app/_chatComponents/ChatInput";

export default function RoleChatClient({ roleData, systemPrompt }) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Custom hooks
  const { user, loadingUser } = useAuth();
  const { companyDetails } = useCompanyDetails();

  // AI model selection
  const [useReasoningModel, setUseReasoningModel] = useState(false);
  const [modelType, setModelType] = useState("llama3.2");

  // Use roleData prop directly
  const selectedPerson = roleData;
  const category = selectedPerson?.link?.split("/")[2];
  const personId = selectedPerson?.id;

  // Vercel AI chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages, // Keep setMessages from useChat
  } = useChat({
    api: "/api/chat",
    body: {
      systemPrompt,
      companyDetails,
      selectedPerson,
      modelType,
      attachments: [],
      userId: user?.id,
    },
    initialMessages: [], // Start with empty messages, history loaded via useEffect
    onFinish: (message) => {},
  });

  // File handling hook
  const {
    attachments,
    pastedContent,
    isUploading,
    uploadProgress,
    handleFileUpload,
    handlePaste,
    removePastedContent,
    removeAttachment,
    setPastedContent,
  } = useFileHandling();

  // Chat history hook (without setMessages)
  const {
    chatHistory, // Raw history from DB
    loadingHistory,
    loadingOlderMessages,
    hasMoreMessages,
    fetchChatHistory,
    fetchOlderMessages,
    clearChatHistory,
    checkAndLoadMoreMessages,
    convertHistoryToMessages, // Get converter
    limitMessagesToTokenCount, // Get limiter
  } = useChatHistory(user); // Pass only user

  // Scroll handling hook
  const { showScrollToBottom, handleScroll, scrollToBottom } =
    useScrollHandling(
      chatContainerRef,
      messages, // Pass messages from useChat
      checkAndLoadMoreMessages,
      selectedPerson
    );

  // Left panel search state
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle model function
  const toggleModel = () => {
    setUseReasoningModel(!useReasoningModel);
    setModelType(useReasoningModel ? "llama3.2" : "deepseek-r1");
  };

  // Custom submit handler
  const customSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0 && !pastedContent) return;

    let finalInput = input;
    if (pastedContent) {
      finalInput = pastedContent + "\n\n" + input;
      setPastedContent("");
    }

    const attachmentDataForApi = attachments.map((att) => ({
      name: att.name,
      type: att.type,
      size: att.size,
      content: att.content,
    }));

    if (finalInput !== input) {
      setInput(finalInput);
    }

    handleSubmit(e, {
      options: {
        body: {
          systemPrompt,
          companyDetails,
          selectedPerson,
          modelType,
          attachments: attachmentDataForApi,
          userId: user?.id,
        },
      },
    });
    setAttachments([]);
  };

  // Handle keydown for submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      customSubmit(e);
    }
  };

  // Effect to fetch initial history when user/person changes
  useEffect(() => {
    if (user && selectedPerson) {
      fetchChatHistory(selectedPerson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedPerson]); // Rerun if user or selectedPerson changes

  // Effect to load fetched history into useChat's state *once* after it loads
  useEffect(() => {
    if (!loadingHistory && chatHistory.length > 0) {
      // Check if messages is empty to avoid overwriting ongoing chat
      if (messages.length === 0) {
        const historyMessages = convertHistoryToMessages(chatHistory);
        // Apply token limiting if needed
        const limitedMessages = limitMessagesToTokenCount(
          historyMessages,
          systemPrompt
        );
        setMessages(limitedMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingHistory, chatHistory]); // Run when history loading finishes or history array changes

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Filter system messages for display
  const displayedMessages = messages.filter((msg) => msg.role !== "system");

  // Loading state
  if (loadingUser || !user || !selectedPerson) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <ContactsList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        loadingUser={loadingUser}
        currentCategory={category}
        currentPersonId={personId}
      />

      {/* Right side (chat) */}
      <div className="relative flex flex-col w-full md:w-2/3">
        {/* Top bar */}
        <ChatTopBar
          selectedPerson={selectedPerson}
          onClearHistory={() => {
            clearChatHistory(selectedPerson);
            setMessages([]); // Also clear useChat messages state
          }}
        />

        {/* Chat area */}
        <ChatArea
          chatContainerRef={chatContainerRef}
          handleScroll={handleScroll}
          loadingHistory={loadingHistory} // Pass loading state for initial load indicator
          loadingOlderMessages={loadingOlderMessages}
          hasMoreMessages={hasMoreMessages}
          displayedMessages={displayedMessages}
          isLoading={isLoading} // Loading state from useChat
        />

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <ScrollToBottomButton onClick={scrollToBottom} />
        )}

        {/* Pasted content card */}
        <PastedContent
          pastedContent={pastedContent}
          removePastedContent={removePastedContent}
        />

        {/* Attachments preview */}
        <AttachmentsPreview
          attachments={attachments}
          removeAttachment={removeAttachment}
        />

        {/* Upload progress indicator */}
        <UploadProgress
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        {/* Sticky bottom input */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="flex flex-col w-full">
            {/* Model selection toggle */}
            <ModelSelector
              useReasoningModel={useReasoningModel}
              toggleModel={toggleModel}
            />

            {/* Input area */}
            <ChatInput
              textareaRef={textareaRef}
              fileInputRef={{
                current: {
                  click: () => fileInputRef.current?.click(),
                  onChange: handleFileUpload,
                },
              }}
              input={input}
              handleInputChange={handleInputChange}
              handleKeyDown={handleKeyDown}
              handlePaste={handlePaste}
              customSubmit={customSubmit}
              selectedPerson={selectedPerson}
              isLoading={isLoading}
              pastedContent={pastedContent}
              attachments={attachments}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={!selectedPerson || isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
