"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "ai/react"; // Vercel AI
import { Loader2 } from "lucide-react";
import { executivesData, employeesData } from "@/app/_components/OfficeData";

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

export default function ChatInterfacePage({ systemPrompt }) {
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Custom hooks
  const { user, loadingUser } = useAuth();
  const { companyDetails } = useCompanyDetails();

  // AI model selection
  const [useReasoningModel, setUseReasoningModel] = useState(false);
  const [modelType, setModelType] = useState("llama3.2"); // Default model

  // Identify if it's /office/executive/<id> or /office/employee/<id>
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3];
  const isExecutive = category === "executive";
  const dataList = isExecutive ? executivesData : employeesData;
  const selectedPerson = dataList.find((item) => item.id === personId) || null;

  // Vercel AI chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    endpoint: "/api/chat",
    body: {
      systemPrompt,
      companyDetails,
      selectedPerson,
      modelType, // Pass the selected model to the API
      attachments: [], // Will be updated with real attachments
      userId: null, // Will be set in the API
    },
    initialMessages: [],
  });

  // File handling with custom hook
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

  // Chat history with custom hook
  const {
    chatHistory,
    loadingHistory,
    loadingOlderMessages,
    hasMoreMessages,
    fetchChatHistory,
    fetchOlderMessages,
    clearChatHistory,
    fetchLastChats,
    checkAndLoadMoreMessages,
  } = useChatHistory(user, setMessages);

  // Scroll handling with custom hook
  const { showScrollToBottom, handleScroll, scrollToBottom } =
    useScrollHandling(
      chatContainerRef,
      messages,
      checkAndLoadMoreMessages,
      selectedPerson
    );

  // Left panel states
  const [searchQuery, setSearchQuery] = useState("");
  const [executivesChats, setExecutivesChats] = useState({});
  const [employeesChats, setEmployeesChats] = useState({});

  // ----------------------------------------------------------------
  // Toggle between reasoning and normal model
  // ----------------------------------------------------------------
  const toggleModel = () => {
    setUseReasoningModel(!useReasoningModel);
    setModelType(useReasoningModel ? "llama3.2" : "deepseek-r1");
  };

  // ----------------------------------------------------------------
  // Custom submit handler to include attachments and support Enter key
  // ----------------------------------------------------------------
  const customSubmit = (e) => {
    e.preventDefault();

    if (!input.trim() && attachments.length === 0 && !pastedContent) {
      return;
    }

    // Include pasted content if present
    let finalInput = input;
    if (pastedContent) {
      finalInput = pastedContent + "\n\n" + input;
      setPastedContent("");
    }

    // Update input with the combined content
    if (finalInput !== input) {
      setInput(finalInput);
    }

    handleSubmit(e);
  };

  // ----------------------------------------------------------------
  // Handle keydown for Enter and Shift+Enter
  // ----------------------------------------------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      customSubmit(e);
    }
  };

  // Fetch chat history when user and selectedPerson are available
  useEffect(() => {
    if (user && selectedPerson) {
      fetchChatHistory(selectedPerson.id);
    }
  }, [user, selectedPerson]);

  // (Optional) fetch last chat previews after we have a user
  useEffect(() => {
    if (!user) return;

    async function loadChatPreviews() {
      const { executivesChats: newExecChats, employeesChats: newEmpChats } =
        await fetchLastChats(executivesData, employeesData);

      setExecutivesChats(newExecChats);
      setEmployeesChats(newEmpChats);
    }

    loadChatPreviews();
  }, [user]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Filter out system messages so they are never displayed to the end user
  const displayedMessages = messages.filter((msg) => msg.role !== "system");

  // ----------------------------------------------------------------
  // If we're still checking or user is invalid, show spinner
  // ----------------------------------------------------------------
  if (loadingUser || !user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Once the user is known to be valid, render the main interface
  // ----------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel: only visible on md+ */}
      <ContactsList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        executivesChats={executivesChats}
        employeesChats={employeesChats}
        loadingUser={loadingUser}
        currentCategory={category}
        currentPersonId={personId}
      />

      {/* Right side (chat) => full width on mobile, 70% on desktop */}
      <div className="relative flex flex-col w-full md:w-2/3">
        {/* Top bar */}
        <ChatTopBar
          selectedPerson={selectedPerson}
          onClearHistory={() => clearChatHistory(selectedPerson)}
        />

        {/* Chat area */}
        <ChatArea
          chatContainerRef={chatContainerRef}
          handleScroll={handleScroll}
          loadingHistory={loadingHistory}
          loadingOlderMessages={loadingOlderMessages}
          hasMoreMessages={hasMoreMessages}
          displayedMessages={displayedMessages}
          isLoading={isLoading}
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

        {/* Sticky bottom input - enhanced with modern design */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="flex flex-col w-full">
            {/* Model selection toggle */}
            <ModelSelector
              useReasoningModel={useReasoningModel}
              toggleModel={toggleModel}
            />

            {/* Input area with attachments */}
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
