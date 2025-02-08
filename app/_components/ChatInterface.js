"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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

// A simple bubble for messages
function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`max-w-xs w-fit break-words rounded-xl p-3 text-sm
        ${
          isUser
            ? "bg-blue-500 text-white self-end"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
        }
      `}
    >
      {message.content}
    </motion.div>
  );
}

export default function ChatInterface() {
  const router = useRouter();
  const pathname = usePathname();

  // E.g., /office/executive/ceo => ["", "office", "executive", "ceo"]
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3]; // e.g. "ceo"

  const isExecutive = category === "executive";
  const list = isExecutive ? executivesData : employeesData;
  const defaultMessages = isExecutive
    ? demoExecutiveMessages
    : demoEmployeeMessages;

  // Find the person data based on ID
  const selectedPerson = list.find((item) => item.id === personId) || null;

  // We'll keep the entire conversation in this state array
  const [messages, setMessages] = useState([]);
  // For user input
  const [newMessage, setNewMessage] = useState("");
  // For partial streaming text from Ollama
  const [streamingMessage, setStreamingMessage] = useState("");
  // Flag if streaming in progress
  const [isStreaming, setIsStreaming] = useState(false);
  // Desktop vs mobile (to decide how Enter works)
  const [isMobile, setIsMobile] = useState(false);
  // For auto-growing text area
  const textAreaRef = useRef(null);
  const maxHeightPx = 128;

  // Scroll container ref to keep conversation scrolled to the bottom
  const chatContainerRef = useRef(null);

  // On mount, if no conversation yet, insert an “intro” agent message
  useEffect(() => {
    if (selectedPerson && messages.length === 0) {
      const introduction = `Hi, I'm ${selectedPerson.name}, the ${selectedPerson.position}. How can I help you today?`;
      setMessages([{ role: "agent", content: introduction }]);
    }
  }, [selectedPerson, messages.length]);

  // Detect screen size
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

  // Always scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  // Send user message + get streamed response from Ollama
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !selectedPerson) return;

    // Push user’s message
    const updatedMessages = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setNewMessage("");

    // Now call our /api/chat route
    try {
      setIsStreaming(true);
      setStreamingMessage(""); // clear any leftover partial text

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          agentName: selectedPerson.name,
          agentPosition: selectedPerson.position,
        }),
      });

      if (!response.ok) {
        console.error("Ollama fetch error:", response.statusText);
        setIsStreaming(false);
        return;
      }

      // Stream the NDJSON: each line is a JSON object with { token, done }.
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let tempText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        // Could contain multiple lines
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.done) {
              // Streaming done for this response
              break;
            }
            if (data.token) {
              // Accumulate partial text
              tempText += data.token;
              setStreamingMessage(tempText);
            }
          } catch (err) {
            console.error("Error parsing Ollama line:", err, line);
          }
        }
      }

      // Finalize the partial text into the messages array
      if (tempText) {
        setMessages((prev) => [...prev, { role: "agent", content: tempText }]);
      }
    } catch (err) {
      console.error("Error streaming from Ollama:", err);
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
      // Reset text area
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.overflowY = "hidden";
      }
    }
  };

  // Enter key logic on desktop
  const handleKeyDown = (e) => {
    if (!isMobile) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  // Auto-grow textarea
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
        className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col space-y-2"
      >
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {/* If streaming, show partial agent text as it arrives */}
        {isStreaming && streamingMessage && (
          <MessageBubble
            message={{ role: "agent", content: streamingMessage }}
          />
        )}
      </div>

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
          className="resize-none"
          style={{ height: "auto", overflowY: "hidden" }}
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          disabled={isStreaming}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
