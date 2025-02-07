"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Separator } from "@/components/ui/separator";

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
  const placeholderMessage = selectedPerson
    ? demoMessages[selectedPerson.id]
    : "No data found for this route.";

  // State for typed message
  const [newMessage, setNewMessage] = useState("");

  // Track if we're on mobile vs. desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    }
    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // For auto-growing text area
  const textAreaRef = useRef(null);
  const maxHeightPx = 128; // ~8 lines worth (adjust as needed)

  const handleSend = () => {
    if (!newMessage.trim()) return;
    alert(`Message sent: ${newMessage}`);
    setNewMessage("");
    // Reset textarea height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.overflowY = "hidden";
    }
  };

  // On desktop, Enter (w/o Shift) sends. On mobile, Enter inserts a new line.
  const handleKeyDown = (e) => {
    if (!isMobile) {
      // Desktop behavior
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
    // On mobile, do nothing special; default enter => new line
  };

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
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {/* Placeholder message (replace with real messages in actual code) */}
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
