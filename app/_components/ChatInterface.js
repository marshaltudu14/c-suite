"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Send } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  executivesData,
  employeesData,
  demoExecutiveMessages,
  demoEmployeeMessages,
} from "@/app/_components/OfficeData";

export default function ChatInterface() {
  const router = useRouter();
  const pathname = usePathname();

  // Example: /office/executive/ceo => ["", "office", "executive", "ceo"]
  const pathParts = pathname.split("/");
  const category = pathParts[2]; // "executive" or "employee"
  const personId = pathParts[3]; // e.g., "ceo"

  // Identify if route is for an executive or employee
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

  // Local state for the user's typed message
  const [newMessage, setNewMessage] = useState("");

  // Simple send handler (demo only)
  const handleSend = () => {
    if (!newMessage.trim()) return;
    alert(`Message sent: ${newMessage}`);
    setNewMessage("");
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

        {/* Right group: three vertical dots -> Shadcn Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-1 rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu or Settings</SheetTitle>
              <SheetDescription>
                Extra options, profile settings, etc.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <p className="text-gray-600 dark:text-gray-300">
                Hello from the Shadcn Sheet!
              </p>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chat scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {/* Single placeholder message. In a real app, you'd map over chat messages here. */}
        <motion.div
          className="max-w-sm rounded-xl p-3 text-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {placeholderMessage}
        </motion.div>
      </div>

      {/* Bottom input area: sticky at bottom */}
      <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
