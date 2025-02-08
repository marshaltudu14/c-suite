"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  executivesData,
  employeesData,
  demoExecutiveMessages,
  demoEmployeeMessages,
} from "@/app/_components/OfficeData";

export default function ChatInterface() {
  const router = useRouter();
  const pathname = usePathname();

  // E.g., /office/executive/ceo => ["", "office", "executive", "ceo"]
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3]; // e.g., "ceo"

  const isExecutive = category === "executive";
  const list = isExecutive ? executivesData : employeesData;
  const demoMessages = isExecutive
    ? demoExecutiveMessages
    : demoEmployeeMessages;

  const selectedPerson = list.find((item) => item.id === personId) || null;
  const defaultMessage = selectedPerson
    ? demoMessages[selectedPerson.id]
    : "No data found for this route.";

  // Conversation state: array of { id, role: 'user'|'assistant', text }
  const [messages, setMessages] = useState([
    { id: Date.now(), role: "assistant", text: defaultMessage },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Track if on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // For auto-growing text area
  const textAreaRef = useRef(null);
  const maxHeightPx = 128; // ~8 lines worth

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    // Push user message
    const userMsg = {
      id: Date.now() + Math.random(),
      role: "user",
      text: newMessage.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    // Reset textarea height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.overflowY = "hidden";
    }

    // Prepare a combined prompt with context
    // For example, you can add details about the user or the "role"
    // (like CTO/CMO info) to make the response more personalized.
    const personalizedPrompt = `You are ${
      selectedPerson?.position || "an assistant"
    }. 
User says: "${userMsg.text}"`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: personalizedPrompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to get response from Ollama");
      }
      const data = await response.json();
      console.log("Ollama response:", response);

      // Add Ollama response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: data.completion || "...",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: `Error: ${error.message}`,
        },
      ]);
    }
  };

  // On desktop, Enter (w/o Shift) => send
  const handleKeyDown = (e) => {
    if (!isMobile) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  // Auto-grow the textarea
  const handleInput = () => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (el.scrollHeight > maxHeightPx) {
      el.style.height = `${maxHeightPx}px`;
      el.style.overflowY = "auto";
    } else {
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflowY = "hidden";
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Show "Scroll to bottom" button if user is not viewing the latest messages
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // If user is near the bottom, hide the button
    const threshold = 20;
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-md flex flex-col min-h-screen bg-white dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800">
        {/* Left group: back arrow + person info */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {/* Display image or skeleton */}
          {selectedPerson?.image ? (
            <Image
              src={selectedPerson.image}
              alt={selectedPerson.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <Skeleton className="w-8 h-8 rounded-full" />
          )}
          {/* Name & position */}
          <div className="flex flex-col">
            {selectedPerson ? (
              <>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {selectedPerson.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedPerson.position}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-red-500">
                Unknown route
              </p>
            )}
          </div>
        </div>

        {/* Right group: three vertical dots -> Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>New Chat</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Chat History</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat scrollable area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pb-24 space-y-2"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: isUser ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } w-full`}
            >
              <div
                className={`max-w-sm rounded-xl p-3 text-sm whitespace-pre-wrap
                  ${
                    isUser
                      ? // user bubble
                        "bg-blue-500 text-white dark:bg-blue-600"
                      : // assistant bubble
                        "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  }
                `}
              >
                {msg.text}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll to bottom button (shows only when not at bottom) */}
      {showScrollToBottom && (
        <motion.button
          className="fixed bottom-20 right-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
        >
          <ArrowDownCircle className="h-5 w-5" />
        </motion.button>
      )}

      {/* Sticky bottom input area */}
      <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
        <Textarea
          ref={textAreaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder="Type your message..."
          className="resize-none dark:bg-gray-900"
          style={{ height: "auto", overflowY: "hidden" }}
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
