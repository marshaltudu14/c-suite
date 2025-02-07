"use client";

import React, { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// --- Replace Sheet with Dropdown Menu ---
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Local data
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

  // Decide if route is "executive" or "employee"
  const isExecutive = category === "executive";
  const list = isExecutive ? executivesData : employeesData;
  const demoMessages = isExecutive
    ? demoExecutiveMessages
    : demoEmployeeMessages;

  // Find matching data
  const selectedPerson = list.find((item) => item.id === personId) || null;
  const placeholderMessage = selectedPerson
    ? demoMessages[selectedPerson.id]
    : "No data found for this route.";

  // State for typed message
  const [newMessage, setNewMessage] = useState("");

  // Detect mobile to change Enter key behavior
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/mobi|android|touch|iphone|ipad|ipod/.test(userAgent)) {
        setIsMobile(true);
      }
    }
  }, []);

  // We'll reference the Textarea DOM element to auto-grow up to a limit
  const textAreaRef = useRef(null);
  const maxHeightPx = 128; // ~8 lines worth (adjust as needed)

  const handleSend = () => {
    if (!newMessage.trim()) return;
    alert(`Message sent: ${newMessage}`);
    setNewMessage("");
    // Reset the Textarea’s height when message is sent
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.overflowY = "hidden";
    }
  };

  // KeyDown to handle Enter for sending vs Shift+Enter for newline
  // If on mobile, pressing Enter always inserts a new line.
  // Otherwise (desktop), Enter sends unless Shift is pressed.
  const handleKeyDown = (e) => {
    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow logic. If scrollHeight exceeds our max, we allow scroll inside the Textarea
  const handleInput = () => {
    const handleInput = () => {
      const el = textAreaRef.current;
      if (!el) return;

      // Reset height so we can measure the scrollHeight accurately
      el.style.height = "auto";

      if (el.scrollHeight > maxHeightPx) {
        // Lock to maxHeight, allow scrolling inside
        el.style.height = `${maxHeightPx}px`;
        el.style.overflowY = "auto";
      } else {
        // Grow naturally, hide scroll
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

          {/* Right group: three vertical dots -> Replace Sheet with Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Menu or Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New Chat</DropdownMenuItem>
              <DropdownMenuItem>Chat History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat scrollable area (with bottom padding so last msg is above sticky bar) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
          {/* Single placeholder message. Replace with real messages mapped out. */}
          <motion.div
            className="max-w-sm rounded-xl p-3 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {placeholderMessage}
          </motion.div>
        </div>

        {/* Sticky bottom input area */}
        <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
          {/* Multi-line Textarea with auto-grow up to maxHeightPx */}
          <Textarea
            ref={textAreaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onInput={handleInput} // auto-grow logic
            onKeyDown={handleKeyDown} // Enter to send only on desktop
            rows={1}
            placeholder="Type your message..."
            className="resize-none"
            style={{ height: "auto", overflowY: "hidden" }}
          />
          {/* Send button */}
          <button
            onClick={handleSend}
            className="p-2 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  };
}
