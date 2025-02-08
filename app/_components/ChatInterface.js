"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// Example ChatInterface
export default function ChatInterface({ personaData }) {
  /*
    personaData can include:
    {
      name: "string",           // e.g. "Jane Doe"
      position: "string",       // e.g. "Chief Marketing Officer"
      image: "string",          // e.g. "/images/cmo.png"
      systemPrompt: "string",   // e.g. "You are the CMO. Provide marketing guidance..."
      // any other custom data you want, e.g. attachments, doc references, etc.
    }
  */

  const router = useRouter();

  // De-structure or fallback to defaults
  const {
    name = "Unknown Person",
    position = "Unknown Role",
    image = "",
    systemPrompt = "You are a helpful AI assistant.",
  } = personaData || {};

  // State for the conversation
  // Each message: { role: "user" | "assistant" | "system", content: "..." }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // For text area auto-resize
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Tracks whether we show the "scroll down" button
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Tracks if user is on mobile (so Enter key can behave differently)
  const [isMobile, setIsMobile] = useState(false);
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

  // Observe scroll to toggle scroll-down button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    function onScroll() {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setShowScrollDown(!nearBottom);
    }

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // Whenever messages update, scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Add user's message to local state
    const updatedMessages = [
      ...messages,
      { role: "user", content: newMessage },
    ];
    setMessages(updatedMessages);
    setNewMessage("");

    // Prepare the payload for the API
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [
            // Start with a system message (the persona's prompt)
            { role: "system", content: systemPrompt },
            // Then all conversation messages so far
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

      const assistantReply = data.response || "(No response)";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply },
      ]);
    } catch (err) {
      console.error("Error calling /api/ollama:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      // Reset textarea style
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!isMobile) {
      // On desktop, Enter (without Shift) -> send
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const maxHeightPx = 128; // ~8 lines
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {/* Show each message */}
        {messages.length === 0 ? (
          <motion.div
            className="max-w-sm rounded-xl p-3 text-sm 
                       bg-gray-200 text-gray-700 
                       dark:bg-gray-700 dark:text-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* You can put a static "welcome" or "no messages" text here */}
            <p>No messages yet. Ask me something!</p>
          </motion.div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
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
          })
        )}
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
