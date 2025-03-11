"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "ai/react"; // Vercel AI
import {
  Loader2,
  Send,
  Upload,
  X,
  FileText,
  Image,
  Paperclip,
  Lightbulb,
} from "lucide-react";
import { executivesData, employeesData } from "@/app/_components/OfficeData";
import ContactsList from "@/app/_chatComponents/ContactList";
import ChatTopBar from "@/app/_chatComponents/ChatTopBar";
import {
  MessageBubble,
  ScrollToBottomButton,
} from "@/app/_chatComponents/Components";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Maximum file sizes in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

export default function ChatInterfacePage({ systemPrompt }) {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef(null);

  // Fetch other data
  const [companyDetails, setCompanyDetails] = useState([]);

  // AI model selection
  const [useReasoningModel, setUseReasoningModel] = useState(false);
  const [modelType, setModelType] = useState("llama3.2"); // Default model

  // File handling states
  const [attachments, setAttachments] = useState([]);
  const [pastedContent, setPastedContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
  } = useChat({
    endpoint: "/api/chat",
    body: {
      systemPrompt,
      companyDetails,
      selectedPerson,
      modelType, // Pass the selected model to the API
      attachments, // Pass any attachments
    },
    initialMessages: [],
  });

  // Left panel states
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [executivesChats, setExecutivesChats] = useState({});
  const [employeesChats, setEmployeesChats] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // Scrolling logic
  const chatContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const textareaRef = useRef(null);

  // ----------------------------------------------------------------
  // Toggle between reasoning and normal model
  // ----------------------------------------------------------------
  const toggleModel = () => {
    setUseReasoningModel(!useReasoningModel);
    setModelType(useReasoningModel ? "llama3.2" : "deepseek-r1");
  };

  // ----------------------------------------------------------------
  // Handle file uploads
  // ----------------------------------------------------------------
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    // Process and validate each file
    const validFiles = files.filter((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast({
            title: "File too large",
            description: `Image ${file.name} exceeds the 5MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      } else if (file.type === "application/pdf") {
        if (file.size > MAX_PDF_SIZE) {
          toast({
            title: "File too large",
            description: `PDF ${file.name} exceeds the 50MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      }
      toast({
        title: "Unsupported file type",
        description: `${file.name} is not a supported file type (image or PDF)`,
        variant: "destructive",
      });
      return false;
    });

    // Process valid files
    const filePromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result,
          };
          resolve(fileData);
        };

        reader.onerror = () => {
          toast({
            title: "Error reading file",
            description: `Could not read ${file.name}`,
            variant: "destructive",
          });
          resolve(null);
        };

        if (file.type.startsWith("image/")) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      });
    });

    Promise.all(filePromises).then((results) => {
      const validResults = results.filter(Boolean);
      setAttachments((prev) => [...prev, ...validResults]);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    });
  };

  // ----------------------------------------------------------------
  // Handle paste event to detect large pasted content
  // ----------------------------------------------------------------
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData("text");

    if (pastedText.length > 5000) {
      e.preventDefault();
      setPastedContent(pastedText);
      toast({
        title: "Large content pasted",
        description: "Your pasted content is displayed above the input area",
      });
    }
  };

  // ----------------------------------------------------------------
  // Remove pasted content or attachment
  // ----------------------------------------------------------------
  const removePastedContent = () => {
    setPastedContent("");
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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

  // ----------------------------------------------------------------
  // Unified user check in a single useEffect block
  // ----------------------------------------------------------------
  useEffect(() => {
    (async () => {
      setLoadingUser(true);
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!data?.user) {
          // If user is null, force a login
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Error checking user:", err);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [router, pathname]);

  // Fetch User Details
  useEffect(() => {
    async function getCompanyDetails() {
      try {
        const res = await fetch("/api/account-details", {
          method: "GET",
        });
        const { success, data, error } = await res.json();
        if (!success) {
          console.error("Failed to fetch details:", error);
          return;
        }

        if (data) {
          setCompanyDetails(data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
    getCompanyDetails();
  }, []);

  // (Optional) fetch last chat previews after we have a user
  useEffect(() => {
    if (!user) return;
    const fetchLastChats = async () => {
      try {
        const newExecutiveChats = {};
        executivesData.forEach((exec) => {
          newExecutiveChats[exec.id] = `Last chat with ${exec.name}`;
        });
        const newEmployeeChats = {};
        employeesData.forEach((emp) => {
          newEmployeeChats[emp.id] = `Last chat with ${emp.name}`;
        });
        setExecutivesChats(newExecutiveChats);
        setEmployeesChats(newEmployeeChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchLastChats();
  }, [user]);

  // ------------------- SCROLL / UI LOGIC -------------------- //
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Auto scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        <ChatTopBar selectedPerson={selectedPerson} />

        {/* Chat area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 bg-gray-50 dark:bg-gray-900"
        >
          {displayedMessages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={{
                role: msg.role === "assistant" ? "agent" : "user",
                content: msg.content,
              }}
            />
          ))}
          {isLoading && (
            <MessageBubble message={{ role: "agent", content: "..." }} />
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollToBottom && (
          <ScrollToBottomButton onClick={scrollToBottom} />
        )}

        {/* Pasted content card */}
        {pastedContent && (
          <Card className="mx-4 mt-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="py-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Pasted Content
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={removePastedContent}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 max-h-24 overflow-y-auto">
                {pastedContent.substring(0, 100)}...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 pt-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Card
                key={index}
                className="w-fit bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-2 flex items-center gap-2">
                  {file.type.startsWith("image/") ? (
                    <Image className="h-4 w-4 text-purple-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-xs truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full ml-1"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="px-4 pt-2">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}

        {/* Sticky bottom input - enhanced with modern design */}
        <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="flex flex-col w-full">
            {/* Model selection toggle */}
            <div className="flex items-center justify-end mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {useReasoningModel
                    ? "Reasoning Mode (Deepseek R1)"
                    : "Standard Mode (Llama 3.2)"}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={useReasoningModel}
                          onCheckedChange={toggleModel}
                        />
                        <Lightbulb
                          className={`h-4 w-4 ${
                            useReasoningModel
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Toggle between standard and reasoning models
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Input area with attachments */}
            <div className="relative flex items-end rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700">
              <Textarea
                ref={textareaRef}
                name="prompt"
                rows={1}
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="resize-none w-full min-h-12 max-h-36 py-3 pl-4 pr-20 focus:outline-none border-none focus:ring-0 bg-transparent"
                disabled={!selectedPerson || isLoading}
              />

              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                {/* File upload button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!selectedPerson || isLoading}
                      >
                        <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Upload image (max 5MB) or PDF (max 50MB)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={!selectedPerson || isLoading}
                />

                {/* Send button */}
                <Button
                  className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                  size="icon"
                  type="submit"
                  onClick={customSubmit}
                  disabled={
                    !selectedPerson ||
                    isLoading ||
                    (input.trim() === "" &&
                      !pastedContent &&
                      attachments.length === 0)
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
