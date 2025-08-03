"use client";

import React, { useEffect, useRef } from "react";
// Import necessary types from 'ai' and 'ai/react'
import { CoreMessage, Message, LanguageModelUsage } from "ai"; // Removed LanguageModelV1FinishReason if not exported
import { useChat, type UseChatOptions } from "ai/react";
import { Loader2 } from "lucide-react";

// Custom hooks

import { useChatHistory } from "@/app/_hooks/useChatHistory";
import { useFileHandling } from "@/app/_hooks/useFileHandling";


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

// Define interface for Role Data (matching page.tsx)
interface RoleData {
  id: string;
  name: string;
  position: string;
  image: string;
  link: string;
  promptTemplate: string;
}

// Define interface for component props
interface RoleChatClientProps {
  roleData: RoleData;
  systemPrompt: string;
}

// Define interface for attachment data sent to API
interface AttachmentDataForApi {
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer | null;
}

// Define interface for attachment file used in state
interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer | null;
}

export default function RoleChatClient({ roleData, systemPrompt }: RoleChatClientProps) {
  // Refs - Assuming child components might need non-null refs
  const fileInputRef = useRef<HTMLInputElement>(null!); // Use non-null assertion if confident it's always assigned
  const textareaRef = useRef<HTMLTextAreaElement>(null!); // Use non-null assertion
  const chatContainerRef = useRef<HTMLDivElement>(null!); // Use non-null assertion
  const historyLoadedRef = useRef<boolean>(false); // Track if history has been loaded

  // Custom hooks
  

  // AI model selection
  const [useReasoningModel, setUseReasoningModel] = React.useState(false);

  const toggleModel = (checked: boolean) => {
    setUseReasoningModel(checked);
  };

  // Use roleData prop directly - type explicitly
  const selectedPerson: RoleData = roleData;
  const category = selectedPerson?.link?.split("/")[2];
  const personId = selectedPerson?.id;

  // File handling hook - Ensure setAttachments is included
  const {
    attachments,
    setAttachments, // Added setAttachments
    pastedContent,
    isUploading,
    uploadProgress,
    handleFileUpload,
    handlePaste,
    removePastedContent,
    removeAttachment,
    setPastedContent,
  } = useFileHandling();

  const { chatHistory, loadingHistory, loadingOlderMessages, hasMoreMessages, fetchChatHistory, fetchOlderMessages, clearChatHistory, checkAndLoadMoreMessages, convertHistoryToMessages, limitMessagesToTokenCount, error: chatHistoryError } = useChatHistory();

  // Vercel AI chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
    body: {
      systemPrompt,
      selectedPerson,
      // attachments: attachments as AttachmentDataForApi[], // Remove attachments from initial body
    },
    initialMessages: [] as Message[], // Use Message[]
    // Correct onFinish signature (removed potentially problematic FinishReason)
    onFinish: (message: Message, options?: { usage?: LanguageModelUsage }) => {
      // console.log("Finished:", message, options);
    },
  } as UseChatOptions); // Cast options

  // Chat history hook
  

  // Scroll handling hook
  

  // Left panel search state
  

  // Toggle model function
  

  // Refactored submit logic (no event needed)
  // Make it async to handle file reading
  const prepareAndSubmit = async () => {
    if (!input.trim() && attachments.length === 0 && !pastedContent) return;

    let finalInput = input;
    if (pastedContent) {
      finalInput = pastedContent + "\n\n" + input;
      setPastedContent(""); // Clear pasted content after preparing input
    }

    // Read file contents asynchronously before submitting
    const attachmentDataForApi: AttachmentDataForApi[] = await Promise.all(
      attachments.map(async (file: File) => {
        const content = await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          // Read as Data URL for simplicity, adjust if API needs ArrayBuffer
          reader.readAsDataURL(file);
        });
        return {
          name: file.name,
          type: file.type,
          size: Number(file.size), // Explicitly convert to number
          content: content, // Use the read content
        };
      })
    );

    // Use setInput before calling handleSubmit if input changed
    if (finalInput !== input) {
      setInput(finalInput);
    }

    // Call handleSubmit with the current input and updated body
    handleSubmit(null as any, { // Pass null or a fake event if required, cast to any if needed
      body: {
        systemPrompt,
        selectedPerson,
        attachments: attachmentDataForApi,
      },
    });

    setAttachments([]); // Clear attachments after submit
    // Input is cleared automatically by useChat hook
  };

  // Handle keydown for submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      prepareAndSubmit(); // Call the refactored submit logic
    }
  };

  // Effect to fetch initial history when user/person changes
  useEffect(() => {
    if (selectedPerson) {
      historyLoadedRef.current = false; // Reset history loaded flag
      fetchChatHistory(selectedPerson.id);
    }
  }, [selectedPerson, fetchChatHistory]);

  // Effect to load fetched history into useChat's state *once*
  useEffect(() => {
    if (!loadingHistory && chatHistory.length > 0 && !historyLoadedRef.current) {
      const historyMessages = convertHistoryToMessages(chatHistory);
      const limitedMessages = limitMessagesToTokenCount(
        historyMessages as any, // Cast if types differ, review needed
        4000 // Token limit for message history
      );
      setMessages(limitedMessages as Message[]);
      historyLoadedRef.current = true; // Mark as loaded
    }
  }, [loadingHistory, chatHistory, convertHistoryToMessages, limitMessagesToTokenCount, setMessages]);

  

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
  if (!selectedPerson) {
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
        currentCategory={category}
        currentPersonId={personId}
      />

      {/* Right side (chat) */}
      <div className="relative flex flex-col w-full md:w-2/3">
        {/* Top bar */}
        <ChatTopBar
          selectedPerson={selectedPerson}
          onClearHistory={() => {
            clearChatHistory();
            setMessages([]);
            historyLoadedRef.current = false; // Reset history loaded flag
          }}
        />

        {/* Chat area */}
        <ChatArea
          chatContainerRef={chatContainerRef}
          loadingHistory={loadingHistory}
          loadingOlderMessages={loadingOlderMessages}
          hasMoreMessages={hasMoreMessages}
          displayedMessages={displayedMessages} // Pass filtered messages
          isLoading={isLoading}
        />

        {/* Scroll-to-bottom button */}
        

        {/* Pasted content card */}
        <PastedContent
          pastedContent={pastedContent}
          removePastedContent={removePastedContent}
        />

        {/* Attachments preview */}
        <AttachmentsPreview
          attachments={attachments} // Pass AttachmentFile[]
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
              textareaRef={textareaRef} // Pass non-null ref
              fileInputRef={fileInputRef} // Pass non-null ref
              input={input}
              handleInputChange={handleInputChange}
              handleKeyDown={handleKeyDown}
              handlePaste={handlePaste}
              customSubmit={prepareAndSubmit} // Pass refactored submit
              selectedPerson={selectedPerson}
              isLoading={isLoading}
              pastedContent={pastedContent}
              attachments={attachments} // Pass AttachmentFile[]
            />

            {/* Hidden file input */}
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
