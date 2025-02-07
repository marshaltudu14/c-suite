"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Local data (example data for executives/employees)
import {
  executivesData,
  employeesData,
  demoExecutiveMessages,
  demoEmployeeMessages,
} from "@/app/_components/OfficeData";
import { Button } from "@/components/ui/button";

export default function ChatInterface() {
  const router = useRouter();
  const pathname = usePathname();

  // URL example: /office/executive/ceo => ["", "office", "executive", "ceo"]
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3]; // e.g., "ceo" or "cfo"

  const isExecutive = category === "executive";
  const list = isExecutive ? executivesData : employeesData;
  const demoMessages = isExecutive
    ? demoExecutiveMessages
    : demoEmployeeMessages;

  const selectedPerson = list.find((item) => item.id === personId) || null;
  const placeholderMessage = selectedPerson
    ? demoMessages[selectedPerson.id]
    : "No data found for this route.";

  // Local state for the new message, model reply, and mobile detection
  const [newMessage, setNewMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
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

  // For auto-growing text area
  const textAreaRef = useRef(null);
  const maxHeightPx = 128; // Adjust as needed (approximately 8 lines)

  // --- Role-Based Prompt Helper ---
  function getRolePrompt(roleId) {
    switch (roleId) {
      case "ceo":
        return "You are a visionary CEO of a cutting-edge company. You provide strategic advice with a confident, inspiring, and forward-thinking tone.";
      case "cfo":
        return "You are a detail-oriented CFO with deep financial expertise. Answer questions in a precise, analytical, and professional manner.";
      // Add additional cases for other roles as needed
      default:
        return "You are a professional expert providing helpful and detailed answers.";
    }
  }
  // --------------------------------

  // Send the user's message to our API endpoint, which will forward it to Ollama.
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Create a role-specific system prompt
    const rolePrompt = getRolePrompt(personId);

    // Build the message list (system prompt + user message)
    const messages = [
      { role: "system", content: rolePrompt },
      { role: "user", content: newMessage },
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      // Assume the API returns { reply: "..." }
      setResponseMessage(data.reply || "No reply received.");
    } catch (error) {
      console.error("Error sending message:", error);
      setResponseMessage("Error fetching response from Ollama.");
    }

    setNewMessage("");
    // Reset textarea height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.overflowY = "hidden";
    }
  };

  // On desktop, pressing Enter (without Shift) sends the message.
  const handleKeyDown = (e) => {
    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize the text area as the user types.
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
      {/* Top bar with back button and person details */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => router.back()}
            className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {/* A demo placeholder message */}
        <motion.div
          className="max-w-sm rounded-xl p-3 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {placeholderMessage}
        </motion.div>

        {/* Display the response from Ollama (if any) */}
        {responseMessage && (
          <motion.div
            className="max-w-sm rounded-xl p-3 text-sm bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {responseMessage}
          </motion.div>
        )}
      </div>

      {/* Sticky input area */}
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
        <Button
          onClick={handleSend}
          className="p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
