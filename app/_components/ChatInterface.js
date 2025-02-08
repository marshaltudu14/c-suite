"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

/*
  Pass in personaData to customize:
  ChatInterface({
    personaData: {
      name: "John Doe",
      position: "CTO",
      image: "/images/cto.png",
      systemPrompt: "You are a wise CTO..."
    }
  })
*/
export default function ChatInterface({ personaData }) {
  const router = useRouter();

  // Destructure or fallback
  const {
    name = "Unknown Person",
    position = "Unknown Role",
    image = "",
    systemPrompt = "You are a helpful AI assistant.",
  } = personaData || {};

  // We start with a single introduction message from AI
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I am here to help. Feel free to ask me anything or provide instructions.",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  // For text area auto-resize
  const textAreaRef = useRef(null);
  // For scrolling
  const chatContainerRef = useRef(null);

  // Track if user is on mobile (so Enter key is different)
  const [isMobile, setIsMobile] = useState(false);

  // Show/hide scroll-down button
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Check screen size
  useEffect(() => {
    function handleResize() {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll observer to decide if we show "scroll down" button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    function handleScroll() {
      // Check how far from the bottom
      const bottomOffset =
        container.scrollHeight - (container.scrollTop + container.clientHeight);

      // If the user is more than ~50px away from the bottom, show the button
      setShowScrollDown(bottomOffset > 50);
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Always scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }

  async function handleSend() {
    if (!newMessage.trim()) return;

    // Add user's message
    const updatedMessages = [
      ...messages,
      { role: "user", content: newMessage },
    ];
    setMessages(updatedMessages);
    setNewMessage("");

    // Prepare payload
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [
            // Start with a system message for persona's prompt
            { role: "system", content: systemPrompt },
            // Then the entire conversation
            ...updatedMessages,
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch from Ollama API");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Show raw response text from Ollama
      const assistantReply = data.response || "(No response)";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply },
      ]);
    } catch (err) {
      console.error("Error calling /api/ollama:", err);
      // Show error as AI message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      // Reset textarea size
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.overflowY = "hidden";
      }
    }
  }

  function handleKeyDown(e) {
    if (!isMobile) {
      // Desktop: Enter (without shift) -> send
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  }

  const maxHeightPx = 128; // ~8 lines
  function handleInput() {
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
  }

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
          {image ? (
            <Image
              src={image}
              alt={name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <Skeleton className="w-8 h-8 rounded-full" />
          )}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {position}
            </p>
          </div>
        </div>
        {/* Right group: menu */}
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

      {/* Chat messages container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-24 space-y-3"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={idx}
              className={`flex w-full ${
                isUser ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, x: isUser ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                className={`rounded-xl p-3 max-w-[80%] text-sm break-words ${
                  isUser
                    ? "bg-blue-500 dark:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Down Button */}
      {showScrollDown && (
        <motion.button
          className="fixed bottom-20 right-5 p-2 bg-gray-200 dark:bg-gray-700 
            text-gray-700 dark:text-gray-200 rounded-full shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      )}

      {/* Text input area */}
      <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
        <Textarea
          ref={textAreaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder="Type your message..."
          className="resize-none"
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
